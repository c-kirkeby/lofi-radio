<script lang="ts">
  import type { Snippet } from "svelte";
  import { Play, ListStart, ListEnd, ListX, EllipsisVertical } from "@lucide/svelte";
  import { Button } from "@/components/ui/button";
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
  import {
    ItemGroup,
    Item,
    ItemContent,
    ItemTitle,
    ItemDescription,
    ItemActions,
  } from "@/components/ui/item";
  import ItemSeparator from "@/components/ui/item/item-separator.svelte";
  import { Skeleton } from "@/components/ui/skeleton";
  import { WindowVirtualizer } from "virtua/svelte";
  import { parseDuration } from "@/feeds";
  import { formatDate } from "@/dates";
  import { player } from "@/state/player.svelte";
  import { queueCollection, enqueueNext, enqueueLast, dequeue } from "@/db/collections";
  import { useLiveQuery } from "@tanstack/svelte-db";
  import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

  export interface EpisodeItem {
    url: string;
    feedId: number;
    title?: string;
    published?: Date;
    duration?: number;
    image?: string;
    /** Optional podcast title override — used on the queue page where podcastTitle prop is empty. */
    show?: string;
  }

  interface Props {
    /** The episodes to render. */
    episodes: EpisodeItem[];
    /** Podcast title — used as `show` when loading into player. */
    podcastTitle: string;
    /** Podcast image — fallback when episode has no image. */
    podcastImage?: string;
    /**
     * Whether to wrap the list in a WindowVirtualizer (default true).
     * Set to false for short lists like the queue page.
     */
    virtual?: boolean;
    /** Whether data is still loading — shows skeleton rows when true. */
    isLoading?: boolean;
    /**
     * Optional snippet rendered to the left of the title/description area.
     * Useful for showing podcast artwork on the queue page.
     */
    leading?: Snippet<[episode: EpisodeItem]>;
    /**
     * Optional snippet rendered below the episode title.
     * Useful for showing podcast title on the queue page.
     */
    meta?: Snippet<[episode: EpisodeItem]>;
    /**
     * Optional snippet that replaces the duration/date column.
     * Useful for showing remaining time on the queue page.
     */
    duration?: Snippet<[episode: EpisodeItem]>;
    /**
     * Optional snippet that replaces the entire actions area.
     * Use this for fully custom action buttons.
     */
    actions?: Snippet<[episode: EpisodeItem]>;
  }

  let {
    episodes,
    podcastTitle,
    podcastImage,
    virtual = true,
    isLoading = false,
    leading,
    meta,
    duration: durationSnippet,
    actions: actionsSnippet,
  }: Props = $props();

  // Reactively track which URLs are in the queue
  const queueQuery = useLiveQuery((q) =>
    q
      .from({ queue: queueCollection })
      .select(({ queue }) => ({ url: queue.url })),
  );

  const queuedUrls = $derived(new Set(queueQuery.data.map((q) => q.url)));

  function playEpisode(entry: EpisodeItem) {
    if (!entry.url) return;
    // If something is already playing, push it back to the front of the queue
    if (player.src && player.feedId !== null && player.src !== entry.url) {
      enqueueNext(player.src, player.feedId);
    }
    // Remove the new episode from the queue if it was upcoming
    if (isQueued(entry.url)) dequeue(entry.url);
    player.load({
      src: entry.url,
      title: entry.title ?? "Untitled",
      show: entry.show ?? podcastTitle,
      id: String(entry.feedId),
      feedId: entry.feedId,
      image: entry.image ?? podcastImage ?? null,
    });
  }

  function queueNext(entry: EpisodeItem) {
    enqueueNext(entry.url, entry.feedId);
    // If nothing is loaded in the player, load this episode paused
    if (!player.src) {
      player.loadPaused({
        src: entry.url,
        title: entry.title ?? "Untitled",
        show: entry.show ?? podcastTitle,
        id: String(entry.feedId),
        feedId: entry.feedId,
        image: entry.image ?? podcastImage ?? null,
      });
    }
  }

  function queueLast(entry: EpisodeItem) {
    enqueueLast(entry.url, entry.feedId);
    // If nothing is loaded in the player, load this episode paused
    if (!player.src) {
      player.loadPaused({
        src: entry.url,
        title: entry.title ?? "Untitled",
        show: entry.show ?? podcastTitle,
        id: String(entry.feedId),
        feedId: entry.feedId,
        image: entry.image ?? podcastImage ?? null,
      });
    }
  }

  function removeFromQueue(url: string) {
    // If the episode being removed is currently playing, advance to next or close
    if (url === player.src) {
      player.skipToNext();
    }
    dequeue(url);
  }

  function isQueued(url: string): boolean {
    return queuedUrls.has(url);
  }
</script>

{#snippet defaultDuration(entry: EpisodeItem)}
  <ItemDescription class="hidden md:block">
    {formatDate(entry.published)}
  </ItemDescription>
  <ItemDescription>
    {parseDuration(entry.duration) ?? ""}
  </ItemDescription>
{/snippet}

{#snippet defaultActions(entry: EpisodeItem)}
  {@const queued = isQueued(entry.url)}

  <!-- Desktop queue buttons: visible on row hover only -->
  {#if queued}
    <Tooltip>
      <TooltipTrigger>
        {#snippet child({ props })}
          <Button
            {...props}
            variant="ghost"
            size="icon"
            class="hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Remove from queue"
            onclick={() => removeFromQueue(entry.url)}
          >
            <ListX class="size-4" />
          </Button>
        {/snippet}
      </TooltipTrigger>
      <TooltipContent>Remove from queue</TooltipContent>
    </Tooltip>
  {:else}
    <Tooltip>
      <TooltipTrigger>
        {#snippet child({ props })}
          <Button
            {...props}
            variant="ghost"
            size="icon"
            class="hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Play next"
            onclick={() => queueNext(entry)}
          >
            <ListStart class="size-4" />
          </Button>
        {/snippet}
      </TooltipTrigger>
      <TooltipContent>Play next</TooltipContent>
    </Tooltip>
    <Tooltip>
      <TooltipTrigger>
        {#snippet child({ props })}
          <Button
            {...props}
            variant="ghost"
            size="icon"
            class="hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Play last"
            onclick={() => queueLast(entry)}
          >
            <ListEnd class="size-4" />
          </Button>
        {/snippet}
      </TooltipTrigger>
      <TooltipContent>Play last</TooltipContent>
    </Tooltip>
  {/if}

  <!-- Play button (always visible) -->
  <Tooltip>
    <TooltipTrigger>
      {#snippet child({ props })}
        <Button
          {...props}
          variant="ghost"
          size="icon"
          aria-label="Play {entry.title}"
          onclick={() => playEpisode(entry)}
        >
          <Play class="size-4" />
        </Button>
      {/snippet}
    </TooltipTrigger>
    <TooltipContent>Play</TooltipContent>
  </Tooltip>

  <!-- Mobile: triple-dot dropdown -->
  <DropdownMenu>
    <DropdownMenuTrigger>
      {#snippet child({ props })}
        <Button
          {...props}
          variant="ghost"
          size="icon"
          class="md:hidden"
          aria-label="More options"
        >
          <EllipsisVertical class="size-4" />
        </Button>
      {/snippet}
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      {#if !queued}
        <DropdownMenuItem onclick={() => queueNext(entry)}>
          <ListStart class="size-4 mr-2" />
          Play next
        </DropdownMenuItem>
        <DropdownMenuItem onclick={() => queueLast(entry)}>
          <ListEnd class="size-4 mr-2" />
          Play last
        </DropdownMenuItem>
      {:else}
        <DropdownMenuItem onclick={() => removeFromQueue(entry.url)}>
          <ListX class="size-4 mr-2" />
          Remove from queue
        </DropdownMenuItem>
      {/if}
    </DropdownMenuContent>
  </DropdownMenu>
{/snippet}

{#snippet row(entry: EpisodeItem, index: number)}
  <Item class="group">
    {#if leading}
      {@render leading(entry)}
    {/if}
    <ItemContent class="flex flex-col md:grid md:grid-cols-5">
      <ItemDescription class="md:hidden">
        {formatDate(entry.published)}
      </ItemDescription>
      <ItemTitle class={meta ? "md:col-span-3" : "md:col-span-3"}>
        {entry.title ?? "Untitled"}
      </ItemTitle>
      {#if meta}
        {@render meta(entry)}
      {/if}
      {#if durationSnippet}
        {@render durationSnippet(entry)}
      {:else}
        {@render defaultDuration(entry)}
      {/if}
    </ItemContent>
    <ItemActions>
      {#if actionsSnippet}
        {@render actionsSnippet(entry)}
      {:else}
        {@render defaultActions(entry)}
      {/if}
    </ItemActions>
  </Item>
  {#if index !== episodes.length - 1}
    <ItemSeparator />
  {/if}
{/snippet}

{#if isLoading}
  {#each { length: 8 } as _, i (i)}
    <div class="flex items-center gap-2 py-3 border-b px-3">
      <div class="flex-1 grid md:grid-cols-5 gap-1.5 items-center">
        <Skeleton class="h-3 w-20 md:hidden" />
        <Skeleton class="h-4 w-3/4 md:col-span-3" />
        <Skeleton class="hidden md:block h-3 w-20" />
        <Skeleton class="h-3 w-12" />
      </div>
    </div>
  {/each}
{:else}
  <ItemGroup>
    {#if virtual}
      <WindowVirtualizer data={episodes}>
        {#snippet children(entry, index)}
          {@render row(entry, index)}
        {/snippet}
      </WindowVirtualizer>
    {:else}
      {#each episodes as entry, index (entry.url)}
        {@render row(entry, index)}
      {/each}
    {/if}
  </ItemGroup>
{/if}
