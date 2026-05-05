<script lang="ts">
  import { page } from "$app/state";
  import {
    podcastsMetaCollection,
    podcastIndexSearchCollection as podcastIndexCollection,
  } from "@/db/collections";
  import { eq, ilike, useLiveQuery } from "@tanstack/svelte-db";
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
  import { resolve } from "$app/paths";
  import PodcastSearchCard from "@/components/podcast-search-card.svelte";

  const NULL_UUID = "00000000-0000-0000-0000-000000000000";
  const ALL_PODCAST_LIMIT = 7;

  let search = $derived(page.url.searchParams.get("q") ?? "");

  type SearchResult = {
    podcastId: string;
    podcastGuid?: string;
    title?: string;
    author?: string;
    image?: string;
    description?: string;
    categories?: string[];
    link?: string;
    owner?: string;
    /** true for results from local DB, false for Podcast Index upstream results */
    isLocal: boolean;
  };

  const localQuery = useLiveQuery((q) =>
    q
      .from({ podcastsMeta: podcastsMetaCollection })
      .select(({ podcastsMeta }) => ({
        podcastId: podcastsMeta.podcastId,
        title: podcastsMeta.title,
        author: podcastsMeta.author,
        image: podcastsMeta.image,
        description: podcastsMeta.description,
        categories: podcastsMeta.categories,
        link: podcastsMeta.link,
        owner: podcastsMeta.owner,
      }))
      .where(({ podcastsMeta }) => ilike(podcastsMeta.title, `%${search}%`))
      .orderBy(({ podcastsMeta }) => podcastsMeta.title),
  );

  const upstreamQuery = useLiveQuery((q) =>
    q
      .from({ podcastIndex: podcastIndexCollection })
      .where(({ podcastIndex }) => eq(podcastIndex.query, search))
      .select(({ podcastIndex }) => ({
        podcastGuid: podcastIndex.podcastGuid,
        title: podcastIndex.title,
        author: podcastIndex.author,
        image: podcastIndex.image,
        description: podcastIndex.description,
        link: podcastIndex.link,
      }))
      .orderBy(({ podcastIndex }) => podcastIndex.title),
  );

  // Local results as SearchResult[]
  const localResults = $derived<SearchResult[]>(
    (localQuery.data ?? []).map((r) => ({ ...r, isLocal: true })),
  );

  // Upstream results excluding any already present in local results (by title match would be rough;
  // we have no shared key, so just show all upstream results).
  const upstreamResults = $derived<SearchResult[]>(
    (upstreamQuery.data ?? []).map((r) => ({
      podcastId: NULL_UUID,
      podcastGuid: r.podcastGuid,
      title: r.title,
      author: r.author,
      image: r.image,
      description: r.description,
      link: r.link,
      isLocal: false,
    })),
  );

  const isLoading = $derived(localQuery.isLoading || upstreamQuery.isLoading);

  // All tab: local first, fill remaining slots up to ALL_PODCAST_LIMIT with upstream
  const allTabResults = $derived.by<SearchResult[]>(() => {
    const local = localResults.slice(0, ALL_PODCAST_LIMIT);
    const remaining = ALL_PODCAST_LIMIT - local.length;
    const upstream = remaining > 0 ? upstreamResults.slice(0, remaining) : [];
    return [...local, ...upstream];
  });

  // Podcasts tab: all local + all upstream (merged, no limit)
  const podcastsTabResults = $derived<SearchResult[]>([
    ...localResults,
    ...upstreamResults,
  ]);
</script>

{#snippet podcastCards(podcasts: SearchResult[])}
  <div class="grid grid-cols-6 gap-4">
    {#each podcasts as meta (meta.isLocal ? meta.podcastId : meta.podcastGuid)}
      <PodcastSearchCard
        podcastMeta={{ ...meta, podcastId: meta.podcastId }}
        isLocal={meta.isLocal}
      />
    {/each}
  </div>
{/snippet}

{#snippet podcastList(podcasts: SearchResult[])}
  <ItemGroup>
    {#each podcasts as meta, i (meta.isLocal ? meta.podcastId : meta.podcastGuid)}
      {#if meta.isLocal}
        <a href={resolve(`/podcast/${meta.podcastId}`)}>
          <Item>
            <ItemMedia variant="image">
              {#if meta.image}
                <img
                  src={meta.image}
                  alt={meta.title}
                  class="size-full object-cover"
                />
              {/if}
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{meta.title ?? ""}</ItemTitle>
              {#if meta.author}
                <ItemDescription>{meta.author}</ItemDescription>
              {/if}
            </ItemContent>
          </Item>
        </a>
      {:else}
        <Item>
          <ItemMedia variant="image">
            {#if meta.image}
              <img
                src={meta.image}
                alt={meta.title}
                class="size-full object-cover"
              />
            {/if}
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{meta.title ?? ""}</ItemTitle>
            {#if meta.author}
              <ItemDescription>{meta.author}</ItemDescription>
            {/if}
          </ItemContent>
        </Item>
      {/if}
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

    <!-- All tab -->
    <Tabs.Content value="all">
      {#if isLoading}
        <p class="text-muted-foreground text-sm">Loading...</p>
      {:else if allTabResults.length === 0}
        <p class="text-muted-foreground text-sm">No results for "{search}".</p>
      {:else}
        <!-- Desktop: heading + cards -->
        <div class="hidden md:block">
          <h2 class="text-lg font-semibold tracking-tight mb-4">Podcasts</h2>
          {@render podcastCards(allTabResults)}
        </div>
        <!-- Mobile: list -->
        <div class="md:hidden">
          {@render podcastList(allTabResults)}
        </div>
      {/if}
    </Tabs.Content>

    <!-- Podcasts tab -->
    <Tabs.Content value="podcasts">
      {#if isLoading}
        <p class="text-muted-foreground text-sm">Loading...</p>
      {:else if podcastsTabResults.length === 0}
        <p class="text-muted-foreground text-sm">
          No podcasts found for "{search}".
        </p>
      {:else}
        <!-- Desktop: heading + cards (no limit) -->
        <div class="hidden md:block">
          <h2 class="text-lg font-semibold tracking-tight mb-4">Podcasts</h2>
          {@render podcastCards(podcastsTabResults)}
        </div>
        <!-- Mobile: list -->
        <div class="md:hidden">
          {@render podcastList(podcastsTabResults)}
        </div>
      {/if}
    </Tabs.Content>

    <!-- Episodes tab (placeholder) -->
    <Tabs.Content value="episodes">
      <p class="text-muted-foreground text-sm">Episode search coming soon.</p>
    </Tabs.Content>
  </Tabs.Root>
{/if}
