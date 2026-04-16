<script lang="ts">
  import { onMount } from "svelte";
  import * as Card from "@/components/ui/card";
  import { AspectRatio } from "@/components/ui/aspect-ratio";
  import { Skeleton } from "@/components/ui/skeleton";
  import { Play } from "@lucide/svelte";
  import { Button } from "@/components/ui/button";
  import type { OPMLFeed } from "$lib/opml";
  import { fetchFeed } from "$lib/feeds";
  import type { CachedFeed } from "$lib/feeds";
  import { player } from "$lib/state/player.svelte";

  let { show }: { show: OPMLFeed } = $props();

  let feed = $state<CachedFeed | null>(null);
  let loading = $state(true);

  onMount(async () => {
    if (show.id != null) {
      feed = await fetchFeed(show.id, show.xmlUrl);
    }
    loading = false;
  });

  // Prefer the feed's own title; fall back to the OPML text attribute
  let title = $derived(feed?.title ?? show.text);
  // feed-extractor stores the extra image field we requested via getExtraFeedFields
  let image = $derived(
    (feed as (CachedFeed & { image?: string }) | null)?.image ?? null,
  );

  // Grab the enclosure URL from the latest episode for the test play trigger
  type EntryWithEnclosure = { enclosure?: { "@_url"?: string; url?: string } };
  let latestEpisodeSrc = $derived((): string | null => {
    if (!feed?.entries?.length) return null;
    const entry = feed.entries[0] as (typeof feed.entries)[0] &
      EntryWithEnclosure;
    const enc = entry?.enclosure;
    return enc?.["@_url"] ?? enc?.url ?? null;
  });

  function playLatest() {
    const src = latestEpisodeSrc();
    if (!src) return;
    player.load({
      src,
      title: feed?.entries?.[0]?.title ?? "Unknown episode",
      show: title,
      image,
    });
  }
</script>

<Card.Root class="py-0 overflow-hidden relative group">
  <Card.Content class="px-0">
    <AspectRatio ratio={1 / 1}>
      {#if loading}
        <Skeleton class="size-full rounded-none" />
      {:else if image}
        <img src={image} alt={title} class="size-full object-cover" />
      {:else}
        <img
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'/%3E"
          alt={title}
          class="size-full object-cover bg-muted"
        />
      {/if}
    </AspectRatio>
  </Card.Content>

  {#if !loading && latestEpisodeSrc()}
    <Button
      onclick={playLatest}
      variant="secondary"
      size="icon"
      class="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
      aria-label="Play latest episode of {title}"
    >
      <Play class="size-4" />
    </Button>
  {/if}
</Card.Root>
