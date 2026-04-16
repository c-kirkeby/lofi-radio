<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { getCachedShows } from "$lib/db/shows";
  import { fetchFeed, parseDuration } from "$lib/feeds";
  import type { CachedFeed, FeedEntryExtended } from "$lib/feeds";
  import { player } from "$lib/state/player.svelte";
  import { Skeleton } from "@/components/ui/skeleton";
  import { Button } from "@/components/ui/button";
  import {
    ItemGroup,
    Item,
    ItemContent,
    ItemTitle,
    ItemDescription,
    ItemActions,
  } from "@/components/ui/item";
  import { Play } from "@lucide/svelte";
  import ItemSeparator from "@/components/ui/item/item-separator.svelte";

  const id = $derived(Number(page.params.id));

  let feed = $state<CachedFeed | null>(null);
  let feedImage = $state<string | null>(null);
  let feedTitle = $state<string | null>(null);
  let feedAuthor = $state<string | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);

  onMount(async () => {
    try {
      const shows = await getCachedShows();
      const show = shows.find((s) => s.id === id);

      if (!show) {
        error = "Show not found.";
        return;
      }

      const data = await fetchFeed(show.id!, show.xmlUrl);
      if (!data) {
        error = "Failed to load feed.";
        return;
      }

      feed = data;
      feedImage = (data as CachedFeed & { image?: string }).image ?? null;
      feedTitle = data.title ?? show.text;
      const d = data as CachedFeed & {
        author?: { name?: string; email?: string } | string;
      };
      feedAuthor =
        typeof d.author === "string"
          ? d.author
          : (d.author?.name ?? d.author?.email ?? null);
    } catch (err) {
      console.error(err);
      error = "An unexpected error occurred.";
    } finally {
      loading = false;
    }
  });

  function playEpisode(entry: FeedEntryExtended) {
    const enc = entry.enclosure;
    const src = enc?.["@_url"] ?? enc?.url ?? null;
    if (!src) return;
    player.load({
      src,
      title: entry.title ?? "Unknown episode",
      show: feedTitle ?? "",
      image: feedImage,
    });
  }

  function formatDate(published: string | undefined): string {
    if (!published) return "";
    return new Date(published).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
</script>

<div class="min-h-screen p-6 pb-24 mx-auto container max-w-3xl">
  {#if loading}
    <!-- Header skeleton -->
    <div class="flex gap-6 mb-8">
      <Skeleton class="size-32 rounded-lg shrink-0" />
      <div class="flex flex-col gap-3 justify-center flex-1">
        <Skeleton class="h-7 w-2/3" />
        <Skeleton class="h-4 w-1/3" />
      </div>
    </div>
    <!-- Episode list skeleton -->
    {#each { length: 8 } as _}
      <div class="flex items-center gap-4 py-4 border-b">
        <div class="flex-1 flex flex-col gap-2">
          <Skeleton class="h-4 w-3/4" />
          <Skeleton class="h-3 w-1/4" />
        </div>
        <Skeleton class="h-8 w-16" />
      </div>
    {/each}
  {:else if error}
    <p class="text-destructive">{error}</p>
  {:else if feed}
    <!-- Feed header -->
    <div class="flex gap-6 mb-8">
      {#if feedImage}
        <img
          src={feedImage}
          alt={feedTitle ?? ""}
          class="size-32 rounded-lg object-cover shrink-0"
        />
      {/if}
      <div class="flex flex-col justify-center">
        <h1 class="text-2xl font-semibold tracking-tight">{feedTitle}</h1>
        {#if feedAuthor}
          <p class="text-muted-foreground mt-1">{feedAuthor}</p>
        {/if}
      </div>
    </div>

    <!-- Episode list -->
    <ItemGroup>
      {#each feed.entries ?? [] as entry, index (entry.id ?? entry.title)}
        {@const ext = entry as FeedEntryExtended}
        {@const duration = parseDuration(ext.duration)}
        {@const encType = ext.enclosure?.["@_type"] ?? ""}
        {#if encType.startsWith("audio/")}
        <Item class="py-0">
          <ItemContent>
            <ItemTitle>{entry.title ?? "Untitled"}</ItemTitle>
            <ItemDescription>
              {formatDate(entry.published)}{#if duration && entry.published}
                ·
              {/if}{duration}
            </ItemDescription>
          </ItemContent>
          <ItemActions>
              <Button
                onclick={() => playEpisode(ext)}
                variant="ghost"
                size="icon"
                aria-label="Play {entry.title}"
              >
                <Play class="size-4" />
              </Button>
            </ItemActions>
          {#if index !== (feed.entries?.length ?? 0) - 1}
            <ItemSeparator />
          {/if}
        </Item>
        {/if}
      {/each}
    </ItemGroup>
  {/if}
</div>
