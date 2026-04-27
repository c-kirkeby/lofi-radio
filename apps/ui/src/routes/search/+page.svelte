<script lang="ts">
  import { page } from "$app/state";
  import { podcastsMetaCollection } from "@/db/collections";
  import { eq, useLiveQuery } from "@tanstack/svelte-db";
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

  const ALL_PODCAST_LIMIT = 6;

  let search = $derived(page.url.searchParams.get("q") ?? "");

  const query = useLiveQuery((q) =>
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
      .where(({ podcastsMeta }) => eq(podcastsMeta.title, `${search}`))
      .orderBy(({ podcastsMeta }) => podcastsMeta.title)
      .limit(7),
  );
</script>

{#snippet podcastCards(podcasts: typeof query.data)}
  <div class="grid grid-cols-6 gap-4">
    {#each podcasts as meta (meta.podcastId)}
      <PodcastSearchCard podcastMeta={meta} />
    {/each}
  </div>
{/snippet}

{#snippet podcastList(podcasts: typeof query.data)}
  <ItemGroup>
    {#each podcasts as meta, i (meta.podcastId)}
      <a href={resolve(`/podcast/${meta.podcastId}`)}>
        <Item>
          <ItemMedia variant="image">
            {#if meta.image}
              <img src={meta.image} alt={meta.title} class="size-full object-cover" />
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
      {#if i !== podcasts.length - 1}
        <ItemSeparator />
      {/if}
    {/each}
  </ItemGroup>
{/snippet}

{#if !search}
  <p class="text-muted-foreground text-sm">Start typing to search podcasts and episodes.</p>
{:else}
  <Tabs.Root value="all">
    <Tabs.List>
      <Tabs.Trigger value="all">All</Tabs.Trigger>
      <Tabs.Trigger value="podcasts">Podcasts</Tabs.Trigger>
      <Tabs.Trigger value="episodes">Episodes</Tabs.Trigger>
    </Tabs.List>

    <!-- All tab -->
    <Tabs.Content value="all">
      {#if query.isLoading}
        <p class="text-muted-foreground text-sm">Loading...</p>
      {:else if query.data.length === 0}
        <p class="text-muted-foreground text-sm">No results for "{search}".</p>
      {:else}
        <!-- Desktop: heading + cards -->
        <div class="hidden md:block">
          <h2 class="text-lg font-semibold tracking-tight mb-4">Podcasts</h2>
          {@render podcastCards(query.data.slice(0, ALL_PODCAST_LIMIT))}
        </div>
        <!-- Mobile: list -->
        <div class="md:hidden">
          {@render podcastList(query.data.slice(0, ALL_PODCAST_LIMIT))}
        </div>
      {/if}
    </Tabs.Content>

    <!-- Podcasts tab -->
    <Tabs.Content value="podcasts">
      {#if query.isLoading}
        <p class="text-muted-foreground text-sm">Loading...</p>
      {:else if query.data.length === 0}
        <p class="text-muted-foreground text-sm">No podcasts found for "{search}".</p>
      {:else}
        <!-- Desktop: heading + cards (no limit) -->
        <div class="hidden md:block">
          <h2 class="text-lg font-semibold tracking-tight mb-4">Podcasts</h2>
          {@render podcastCards(query.data)}
        </div>
        <!-- Mobile: list -->
        <div class="md:hidden">
          {@render podcastList(query.data)}
        </div>
      {/if}
    </Tabs.Content>

    <!-- Episodes tab (placeholder) -->
    <Tabs.Content value="episodes">
      <p class="text-muted-foreground text-sm">Episode search coming soon.</p>
    </Tabs.Content>
  </Tabs.Root>
{/if}
