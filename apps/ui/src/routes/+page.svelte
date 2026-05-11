<script lang="ts">
  import PodcastGrid from "$lib/components/podcast-grid.svelte";
  import * as v from "valibot";
  import * as Empty from "$lib/components/ui/empty";
  import { Label } from "@/components/ui/label";
  import { Input } from "@/components/ui/input";
  import { podcastsCollection } from "@/db/collections";
  import { useLiveQuery } from "@tanstack/svelte-db";
  import { parseOpml } from "feedsmith";
  import { podcastIndexClient } from "@/providers/podcast-index";
  import { cacheImage, resizeImage } from "@/caches/image";

  const outlineSchema = v.object({
    text: v.string(),
    xmlUrl: v.pipe(v.string(), v.url()),
    type: v.optional(v.string()),
  });
  type Outline = v.InferInput<typeof outlineSchema>;

  const query = useLiveQuery((q) =>
    q
      .from({ podcasts: podcastsCollection })
      .where(({ podcasts }) => podcasts.subscribed)
      .select(({ podcasts }) => ({ ...podcasts })),
  );

  type SkippedItem = { text: string; xmlUrl: string };

  let importing = $state(false);
  let importTotal = $state(0);
  let importedCount = $state(0);
  let skippedCount = $state(0);
  let skippedItems = $state<SkippedItem[]>([]);

  const CONCURRENCY = 15;

  async function handleImport(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target?.files?.[0];
    if (!file) return;

    const opml = parseOpml(await file.text());
    const [feed] = opml.body?.outlines ?? [];
    const outlines: Outline[] =
      feed.outlines?.filter(
        (outline): outline is Outline =>
          v.safeParse(outlineSchema, outline).success,
      ) ?? [];

    if (!outlines.length) return;

    importing = true;
    importTotal = outlines.length;
    importedCount = 0;
    skippedCount = 0;
    skippedItems = [];

    // Process with bounded concurrency
    let index = 0;

    async function worker() {
      while (index < outlines.length) {
        const outline = outlines[index++];
        try {
          const response = await podcastIndexClient("podcasts/byfeedurl", {
            query: { url: outline.xmlUrl },
          });

          if (
            response.error ||
            !response.data ||
            response.data.status !== "true"
          ) {
            skippedCount++;
            skippedItems = [
              ...skippedItems,
              { text: outline.text, xmlUrl: outline.xmlUrl },
            ];
            continue;
          }

          const { feed } = response.data;
          const podcast = {
            feedId: feed.id,
            podcastGuid: feed.podcastGuid,
            subscribed: true,
            xmlUrl: feed.url,
            title: feed.title,
            author: feed.author ?? "",
            description: feed.description ?? "",
            image: feed.artwork || feed.image || "",
            link: feed.link ?? "",
            language: feed.language || undefined,
            categories: Object.values(feed.categories ?? {}),
          };
          const image = await resizeImage(podcast.image);
          await cacheImage(image, String(podcast.feedId), "image");
          if (podcastsCollection.has(feed.id)) {
            podcastsCollection.update(feed.id, (draft) => {
              Object.assign(draft, podcast);
            });
          } else {
            podcastsCollection.insert(podcast);
          }
          importedCount++;
        } catch {
          skippedCount++;
          skippedItems = [
            ...skippedItems,
            { text: outline.text, xmlUrl: outline.xmlUrl },
          ];
        }
      }
    }

    await Promise.all(Array.from({ length: CONCURRENCY }, worker));
    importing = false;
  }

  const importDone = $derived(!importing && importTotal > 0);
  const importProgress = $derived(
    importTotal > 0 ? importedCount + skippedCount : 0,
  );
</script>

<h1 class="mb-6 text-2xl font-semibold tracking-tight">Podcasts</h1>

{#if importing || importDone}
  <div class="mb-6 rounded-lg border p-4 text-sm space-y-2">
    <div class="flex items-center justify-between font-medium">
      <span>
        {#if importing}
          Importing… {importProgress} / {importTotal}
        {:else}
          Import complete
        {/if}
      </span>
      <span class="text-muted-foreground">
        {importedCount} imported
        {#if skippedCount > 0}&nbsp;·&nbsp;{skippedCount} skipped{/if}
      </span>
    </div>
    {#if importing}
      <div class="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          class="h-full bg-primary rounded-full transition-all duration-300"
          style:width="{importTotal > 0
            ? (importProgress / importTotal) * 100
            : 0}%"
        ></div>
      </div>
    {/if}
    {#if skippedItems.length > 0}
      <details class="text-muted-foreground">
        <summary class="cursor-pointer hover:text-foreground transition-colors">
          {skippedItems.length} feed{skippedItems.length === 1 ? "" : "s"} not found
          in Podcast Index
        </summary>
        <ul class="mt-2 space-y-0.5 pl-4 list-disc text-xs">
          {#each skippedItems as item (item.xmlUrl)}
            <li>{item.text} <span class="opacity-60">({item.xmlUrl})</span></li>
          {/each}
        </ul>
      </details>
    {/if}
  </div>
{/if}

{#if query.data.length < 1 && query.isLoading && !importing}
  <div
    class="grid xl:grid-cols-8 lg:grid-cols-7 md:grid-cols-5 grid-cols-3 gap-2 md:gap-4"
  >
    {#each { length: 12 } as _, i (i)}
      <div class="aspect-square rounded-lg bg-muted animate-pulse"></div>
    {/each}
  </div>
{:else if query.data.length > 0}
  <PodcastGrid podcasts={query.data} />
{:else if !importing}
  <Empty.Root class="border border-dashed">
    <Empty.Header>
      <Empty.Title>No podcasts yet</Empty.Title>
      <Empty.Description
        >Import your feed from another podcast app to get started.</Empty.Description
      >
    </Empty.Header>
    <Empty.Content>
      <Label for="import">Import OPML</Label>
      <Input
        id="import"
        type="file"
        accept=".txt,.opml,.xml,text/xml,application/xml"
        oninput={(event) => handleImport(event)}
      />
    </Empty.Content>
  </Empty.Root>
{/if}
