<script lang="ts">
  import FeedGrid from "$lib/components/feed-grid.svelte";
  import { OPMLParser } from "$lib/opml";
  import * as Empty from "$lib/components/ui/empty";
  import { feedEntriesCollection, feedsCollection } from "@/db/collections";
  import { Label } from "@/components/ui/label";
  import { Input } from "@/components/ui/input";
  import { getFeed } from "@/feed.remote";
  import * as Card from "@/components/ui/card";
  import { AspectRatio } from "@/components/ui/aspect-ratio";
  import { Skeleton } from "@/components/ui/skeleton";

  const feeds = $derived(feedsCollection.find().fetch());

  async function handleImport(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target?.files?.[0];

    if (file) {
      const parser = new OPMLParser();
      const opmlFeeds = parser.parse(await file.text()).feeds;

      opmlFeeds.forEach(async (feed) => {
        const { entries, ...fullFeed } = await getFeed(feed.xmlUrl).run();
        const id = feedsCollection.insert(fullFeed);
        console.debug(entries);
        feedEntriesCollection.insertMany(
          entries?.map((entry) => ({ feedId: id, ...entry })) ?? [],
        );
      });
    }
  }

  const isLoading = $derived(feedsCollection.isLoading());
</script>

<div class="min-h-screen p-6 pb-24 mx-auto container">
  <h1 class="mb-6 text-2xl font-semibold tracking-tight">Podcasts</h1>

  {#if isLoading}
    {#each { length: 12 } as _, i (i)}
      <Card.Root class="py-0 overflow-hidden">
        <Card.Content class="px-0">
          <AspectRatio ratio={1 / 1}>
            <Skeleton class="size-full rounded-none" />
          </AspectRatio>
        </Card.Content>
      </Card.Root>
    {/each}
  {:else if feeds.length > 0}
    <FeedGrid {feeds} />
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
