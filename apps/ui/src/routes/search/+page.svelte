<script lang="ts">
  import { page } from "$app/state";
  import { podcastsCollection } from "@/db/collections";
  import type { PodcastInput } from "@/db/collections";
  import { ilike, useLiveQuery } from "@tanstack/svelte-db";
  import * as Tabs from "@/components/ui/tabs";
  import {
    ItemGroup,
    Item,
    ItemContent,
    ItemTitle,
    ItemDescription,
    ItemMedia,
  } from "@/components/ui/item";
  import ItemSeparator from "@/components/ui/item/item-separator.svelte";
  import PodcastSearchCard from "@/components/podcast-search-card.svelte";

  const ALL_PODCAST_LIMIT = 7;

  let search = $derived(page.url.searchParams.get("q") ?? "");

  // --- Podcast search: on-demand queryFn in podcastsCollection handles PI fetch ---
  const podcastsQuery = useLiveQuery((q) =>
    q
      .from({ podcasts: podcastsCollection })
      .where(({ podcasts }) => ilike(podcasts.title, `%${search}%`))
      .orderBy(({ podcasts }) => podcasts.title),
  );

  const isLoading = $derived(podcastsQuery.isLoading);
  const allResults = $derived(podcastsQuery.data ?? []);

  // Tabs
  const allTabResults = $derived.by(() => {
    const subscribed = allResults
      .filter((p) => p.subscribed)
      .slice(0, ALL_PODCAST_LIMIT);
    const remaining = ALL_PODCAST_LIMIT - subscribed.length;
    const unsubscribed =
      remaining > 0
        ? allResults.filter((p) => !p.subscribed).slice(0, remaining)
        : [];
    return [...subscribed, ...unsubscribed];
  });

  const podcastsTabResults = $derived<PodcastInput[]>(allResults);

  // --- Subscribe actions ---
  function subscribe(podcast: PodcastInput) {
    if (podcastsCollection.has(podcast.feedId)) {
      podcastsCollection.update(podcast.feedId, (draft) => {
        draft.subscribed = true;
      });
    } else {
      podcastsCollection.insert({ ...podcast, subscribed: true });
    }
  }

  function unsubscribe(podcast: PodcastInput) {
    podcastsCollection.update(podcast.feedId, (draft) => {
      draft.subscribed = false;
    });
  }
</script>

{#snippet podcastCards(podcasts: PodcastInput[])}
  <div class="grid grid-cols-6 gap-4">
    {#each podcasts as podcast (podcast.feedId)}
      <PodcastSearchCard
        {podcast}
        onsubscribe={() => subscribe(podcast)}
        onunsubscribe={() => unsubscribe(podcast)}
      />
    {/each}
  </div>
{/snippet}

{#snippet podcastList(podcasts: PodcastInput[])}
  <ItemGroup class="gap-0">
    {#each podcasts as podcast, i (podcast.feedId)}
      <a href="/podcast/{podcast.feedId}">
        <Item>
          <ItemMedia variant="image">
            {#if podcast.image}
              <img
                src={podcast.image}
                alt={podcast.title}
                class="size-full object-cover"
              />
            {/if}
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{podcast.title ?? ""}</ItemTitle>
            {#if podcast.author}
              <ItemDescription>{podcast.author}</ItemDescription>
            {/if}
          </ItemContent>
          <!-- Mobile subscribe toggle: always visible -->
          <div class="flex items-center pr-2">
            {#if podcast.subscribed}
              <button
                class="text-green-500 p-1"
                aria-label="Unsubscribe from {podcast.title}"
                onclick={(e) => {
                  e.preventDefault();
                  unsubscribe(podcast);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="size-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  ><path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4-4 1.41-1.41L10 13.67l6.59-6.59L18 8.5l-8 8z"
                  /></svg
                >
              </button>
            {:else}
              <button
                class="text-muted-foreground p-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                aria-label="Subscribe to {podcast.title}"
                onclick={(e) => {
                  e.preventDefault();
                  subscribe(podcast);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="size-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  ><circle cx="12" cy="12" r="10" /><path
                    d="M12 8v8M8 12h8"
                  /></svg
                >
              </button>
            {/if}
          </div>
        </Item>
      </a>
      {#if i !== podcasts.length - 1}
        <ItemSeparator />
      {/if}
    {/each}
  </ItemGroup>
{/snippet}

{#if !search}
  <p class="text-muted-foreground text-sm">
    Start typing to search podcasts and episodes.
  </p>
{:else}
  <Tabs.Root value="all">
    <Tabs.List>
      <Tabs.Trigger value="all">All</Tabs.Trigger>
      <Tabs.Trigger value="podcasts">Podcasts</Tabs.Trigger>
      <Tabs.Trigger value="episodes">Episodes</Tabs.Trigger>
    </Tabs.List>

    <Tabs.Content value="all">
      {#if isLoading}
        <p class="text-muted-foreground text-sm">Loading...</p>
      {:else if allTabResults.length === 0}
        <p class="text-muted-foreground text-sm">No results for "{search}".</p>
      {:else}
        <div class="hidden md:block">
          <h2 class="text-lg font-semibold tracking-tight mb-4">Podcasts</h2>
          {@render podcastCards(allTabResults)}
        </div>
        <div class="md:hidden">
          {@render podcastList(allTabResults)}
        </div>
      {/if}
    </Tabs.Content>

    <Tabs.Content value="podcasts">
      {#if isLoading}
        <p class="text-muted-foreground text-sm">Loading...</p>
      {:else if podcastsTabResults.length === 0}
        <p class="text-muted-foreground text-sm">
          No podcasts found for "{search}".
        </p>
      {:else}
        <div class="hidden md:block">
          <h2 class="text-lg font-semibold tracking-tight mb-4">Podcasts</h2>
          {@render podcastCards(podcastsTabResults)}
        </div>
        <div class="md:hidden">
          {@render podcastList(podcastsTabResults)}
        </div>
      {/if}
    </Tabs.Content>

    <Tabs.Content value="episodes">
      <p class="text-muted-foreground text-sm">Episode search coming soon.</p>
    </Tabs.Content>
  </Tabs.Root>
{/if}
