<script lang="ts">
  import { page } from "$app/state";
  import { sanitiseDescription } from "$lib/feed/parser";
  import { Skeleton } from "@/components/ui/skeleton";
  import { Button } from "@/components/ui/button";
  import { Badge } from "@/components/ui/badge";
  import { Play, Mic, Link, Plus, CircleCheck } from "@lucide/svelte";
  import { eq, useLiveQuery } from "@tanstack/svelte-db";
  import { podcastsCollection, episodesCollection } from "@/db/collections";
  import EpisodeList from "@/components/episode-list.svelte";

  const DESCRIPTION_LIMIT = 100;

  const feedId = $derived(Number(page.params.feedId));

  // --- Collection query: on-demand queryFn fetches from PI if not present ---
  const podcastQuery = useLiveQuery((q) =>
    q
      .from({ podcasts: podcastsCollection })
      .where(({ podcasts }) => eq(podcasts.feedId, feedId))
      .select(({ podcasts }) => ({ ...podcasts })),
  );

  // --- Episodes query (on-demand, keyed by feedId) ---
  const episodesQuery = useLiveQuery((q) =>
    q
      .from({ episodes: episodesCollection })
      .where(({ episodes }) => eq(episodes.feedId, feedId))
      .orderBy(({ episodes }) => episodes.published, "desc")
      .select(({ episodes }) => ({
        feedId: episodes.feedId,
        title: episodes.title,
        url: episodes.url,
        published: episodes.published,
        duration: episodes.duration,
        image: episodes.image,
      })),
  );

  const podcast = $derived(podcastQuery.data[0] ?? null);
  const isLoading = $derived(podcastQuery.isLoading);
  const notFound = $derived(!podcastQuery.isLoading && !podcast);

  function subscribe() {
    if (!podcast) return;
    if (podcastsCollection.has(podcast.feedId)) {
      podcastsCollection.update(podcast.feedId, (draft) => {
        draft.subscribed = true;
      });
    } else {
      podcastsCollection.insert({ ...podcast, subscribed: true });
    }
  }

  function unsubscribe() {
    if (!podcast) return;
    podcastsCollection.update(podcast.feedId, (draft) => {
      draft.subscribed = false;
    });
  }

  let descriptionExpanded = $state(false);
</script>

{#if isLoading}
  <div
    class="flex flex-col items-center md:items-start md:flex-row gap-8 mb-8 py-4 px-3"
  >
    <Skeleton class="size-32 md:size-48 rounded-xl shrink-0" />
    <div class="flex flex-col gap-2 justify-start w-full">
      <Skeleton class="h-8 w-2/3 mx-auto md:mx-0" />
      <div class="hidden md:flex flex-row gap-2">
        <Skeleton class="h-5 w-16 rounded-full" />
        <Skeleton class="h-5 w-20 rounded-full" />
      </div>
      <div
        class="flex flex-col md:flex-row items-center md:items-start gap-1.5"
      >
        <Skeleton class="h-4 w-28" />
        <Skeleton class="h-4 w-40" />
      </div>
      <div class="flex flex-col gap-1.5 mt-1">
        <Skeleton class="h-3.5 w-full" />
        <Skeleton class="h-3.5 w-full" />
        <Skeleton class="h-3.5 w-5/6" />
        <Skeleton class="h-3.5 w-4/6" />
      </div>
    </div>
  </div>
  <EpisodeList
    episodes={[]}
    podcastTitle=""
    isLoading={true}
  />
{:else if notFound}
  <p class="text-muted-foreground text-sm">Podcast not found.</p>
{:else if podcast}
  {@const sanitised = sanitiseDescription(podcast.description ?? "")}
  {@const descriptionTruncated = sanitised.text.length > DESCRIPTION_LIMIT}

  <div class="flex flex-col items-center md:items-start md:flex-row gap-8 mb-8">
    {#if podcast.image}
      <div class="relative shrink-0">
        <div
          style="--background-image: url({`/image/${podcast.feedId}.png`})"
          class="bg-(image:--background-image) absolute bg-cover -z-10 inset-1 scale-200 rotate-45 blur-3xl md:hidden"
        ></div>
        <img
          src={`/image/${podcast.feedId}.png`}
          alt={podcast.title}
          class="size-32 rounded-xl object-cover md:size-48"
          style:view-transition-name={`podcast-${podcast.feedId}`}
        />
      </div>
    {/if}
    <div
      class="flex flex-col justify-start gap-2 min-w-0 w-full overflow-hidden"
    >
      <h1
        class="text-2xl font-semibold tracking-tight text-center md:text-start"
      >
        {podcast.title}
      </h1>
      {#if podcast.categories?.length}
        <div class="hidden md:flex flex-row gap-2">
          {#each podcast.categories as category (category)}
            <Badge variant="secondary">{category}</Badge>
          {/each}
        </div>
      {/if}
      <div
        class="flex flex-col md:flex-row font-bold flex-wrap justify-center md:justify-start items-center md:items-start gap-x-3 gap-y-1.5 text-sm text-muted-foreground min-w-0"
      >
        {#if podcast.author}
          <span class="flex items-center gap-1.5">
            <Mic class="size-3.5 shrink-0" />
            <span class="truncate">{podcast.author}</span>
          </span>
        {/if}
        {#if podcast.link}
          <a
            href={podcast.link}
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-foreground flex items-center gap-1.5 transition-colors min-w-0"
          >
            <Link class="size-3.5 shrink-0" />
            <span class="truncate text-foreground">{podcast.link}</span>
          </a>
        {/if}
      </div>
      {#if sanitised?.html}
        <div class="text-sm text-muted-foreground">
          <div
            class={[
              "[&_p]:mb-2 [&_p:last-child]:mb-0 [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:opacity-80",
              !descriptionExpanded && descriptionTruncated
                ? "line-clamp-4"
                : "",
            ].join(" ")}
          >
            {@html sanitised.html}
          </div>
          {#if descriptionTruncated}
            <button
              onclick={() => (descriptionExpanded = !descriptionExpanded)}
              class="mt-1 text-foreground underline-offset-4 hover:underline text-xs font-medium"
            >
              {descriptionExpanded ? "Show less" : "Read more"}
            </button>
          {/if}
        </div>
      {/if}

      <!-- Subscribe / Unsubscribe button -->
      {#if podcast.subscribed}
        <div class="mt-1">
          <Button variant="outline" size="sm" onclick={unsubscribe}>
            <CircleCheck class="size-4 text-green-500 mr-1.5" />
            Subscribed
          </Button>
        </div>
      {:else}
        <div class="mt-1">
          <Button variant="default" size="sm" onclick={subscribe}>
            <Plus class="size-4 mr-1.5" />
            Subscribe
          </Button>
        </div>
      {/if}
    </div>
  </div>

  <EpisodeList
    episodes={episodesQuery.data}
    podcastTitle={podcast.title}
    podcastImage={podcast.image}
    isLoading={episodesQuery.isLoading}
  />
{/if}
