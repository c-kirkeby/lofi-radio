<script lang="ts">
  import PodcastGrid from "$lib/components/podcast-grid.svelte";
  import * as v from "valibot";
  import * as Empty from "$lib/components/ui/empty";
  import { Label } from "@/components/ui/label";
  import { Input } from "@/components/ui/input";
  import * as Card from "@/components/ui/card";
  import { AspectRatio } from "@/components/ui/aspect-ratio";
  import { Skeleton } from "@/components/ui/skeleton";
  import { podcastsCollection } from "@/db/collections";
  import { useLiveQuery } from "@tanstack/svelte-db";
  import { parseOpml } from "feedsmith";

  const outlineSchema = v.object({
    text: v.string(),
    xmlUrl: v.string(),
    type: v.optional(v.string()),
  });
  type Outline = v.InferInput<typeof outlineSchema>;

  const query = useLiveQuery((q) => q.from({ podcasts: podcastsCollection }));

  async function handleImport(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target?.files?.[0];

    if (file) {
      const opml = parseOpml(await file.text());
      const [feed] = opml.body?.outlines ?? [];
      const outlines =
        feed.outlines
          ?.filter(
            (outline): outline is Outline =>
              v.safeParse(outlineSchema, outline).success,
          )
          .map((outline) => ({
            id: crypto.randomUUID(),
            text: outline.text,
            xmlUrl: outline.xmlUrl,
            type: outline.type,
          })) ?? [];
      podcastsCollection.insert(outlines);
    }
  }
</script>

<div class="min-h-screen p-6 pb-24 mx-auto container">
  <h1 class="mb-6 text-2xl font-semibold tracking-tight">Podcasts</h1>
  {#if query.isLoading}
    {#each { length: 12 } as _, i (i)}
      <Card.Root class="py-0 overflow-hidden">
        <Card.Content class="px-0">
          <AspectRatio ratio={1 / 1}>
            <Skeleton class="size-full rounded-none" />
          </AspectRatio>
        </Card.Content>
      </Card.Root>
    {/each}
  {:else if query.data.length > 0}
    {@const podcasts = query.data}
    <PodcastGrid {podcasts} />
  {:else}
    <Empty.Root class="border border-dashed">
      <Empty.Header>
        <Empty.Title>No podcasts yet</Empty.Title>
        <Empty.Description
          >Import your feed from another podcast app to get started.</Empty.Description
        >
      </Empty.Header>
      <Empty.Content>
        <Label for="import">Import</Label>
        <Input
          id="import"
          type="file"
          accept=".txt,.opml,.xml,text/xml,application/xml"
          onchange={(event) => handleImport(event)}
        />
      </Empty.Content>
    </Empty.Root>
  {/if}
</div>
