<script lang="ts">
  import { useLiveQuery } from "@tanstack/svelte-db";
  import { eq } from "@tanstack/db";
  import {
    queueCollection,
    episodesCollection,
    podcastsCollection,
    progressCollection,
  } from "@/db/collections";
  import EpisodeList, {
    type EpisodeItem,
  } from "@/components/episode-list.svelte";
  import { ItemDescription } from "@/components/ui/item";
  import {
    Empty,
    EmptyHeader,
    EmptyTitle,
    EmptyDescription,
  } from "@/components/ui/empty";
  import { ListVideo } from "@lucide/svelte";
  import { parseDuration } from "@/feeds";
  import { resolve } from "$app/paths";

  /**
   * Single joined query: queue ⋈ episodes ⋈ podcasts, with a left join to
   * progress for remaining-time calculation. Ordered by queue.order ascending.
   */
  const queueQuery = useLiveQuery((q) =>
    q
      .from({ queue: queueCollection })
      .join(
        { episode: episodesCollection },
        ({ queue, episode }) => eq(queue.url, episode.url),
        "inner",
      )
      .join(
        { podcast: podcastsCollection },
        ({ queue, podcast }) => eq(queue.feedId, podcast.feedId),
        "inner",
      )
      .join(
        { progress: progressCollection },
        ({ queue, progress }) => eq(queue.url, progress.url),
        "left",
      )
      .orderBy(({ queue }) => queue.order, "asc")
      .select(({ queue, episode, podcast, progress }) => ({
        // EpisodeItem fields
        url: episode.url,
        feedId: episode.feedId,
        title: episode.title,
        published: episode.published,
        duration: episode.duration,
        image: episode.image,
        // Queue order (for display)
        order: queue.order,
        // Podcast metadata for leading/meta snippets
        podcastTitle: podcast.title,
        // Progress for remaining-time calculation
        position: progress?.position ?? 0,
      })),
  );

  const isLoading = $derived(queueQuery.isLoading);

  /** Map result rows to EpisodeItem for EpisodeList. */
  const queuedEpisodes = $derived<EpisodeItem[]>(
    queueQuery.data.map((row) => ({
      url: row.url,
      feedId: row.feedId,
      title: row.title,
      published: row.published,
      duration: row.duration,
      image: row.image,
      show: row.podcastTitle,
    })),
  );

  /** Lookup map from url → joined row (for snippets that need podcast/progress data). */
  const rowMap = $derived(
    new Map(queueQuery.data.map((row) => [row.url, row])),
  );

  /** Compute remaining seconds for an episode. */
  function remainingSeconds(
    url: string,
    duration: number | undefined,
  ): number | null {
    if (!duration) return null;
    const row = rowMap.get(url);
    const position = row?.position ?? 0;
    return Math.max(0, duration - position);
  }
</script>

<svelte:head>
  <title>Queue</title>
</svelte:head>

<h1 class="text-2xl font-semibold tracking-tight mb-6">Queue</h1>

{#if !isLoading && queuedEpisodes.length === 0}
  <Empty>
    <EmptyHeader>
      <ListVideo class="size-10 text-muted-foreground" />
      <EmptyTitle>Your queue is empty</EmptyTitle>
      <EmptyDescription>
        Browse your podcasts and add episodes to your queue.
      </EmptyDescription>
    </EmptyHeader>
  </Empty>
{:else}
  <EpisodeList
    episodes={queuedEpisodes}
    podcastTitle=""
    virtual={false}
    {isLoading}
  >
    {#snippet leading(entry)}
      {@const row = rowMap.get(entry.url)}
      {#if row}
        <a href={resolve(`/podcast/${entry.feedId}`)} class="shrink-0 mr-1">
          <img
            src={`/image/${entry.feedId}.png`}
            alt={row.podcastTitle}
            class="size-10 rounded-md object-cover"
          />
        </a>
      {/if}
    {/snippet}

    {#snippet meta(entry)}
      {@const row = rowMap.get(entry.url)}
      {#if row}
        <ItemDescription>
          <a
            href={resolve(`/podcast/${entry.feedId}`)}
            class="hover:text-foreground transition-colors"
          >
            {row.podcastTitle}
          </a>
        </ItemDescription>
      {/if}
    {/snippet}

    {#snippet duration(entry)}
      {@const remaining = remainingSeconds(entry.url, entry.duration)}
      <ItemDescription class="hidden md:block">
        {remaining !== null ? `${parseDuration(remaining)} left` : ""}
      </ItemDescription>
    {/snippet}
  </EpisodeList>
{/if}
