<script lang="ts">
  import { onMount } from "svelte";
  import * as Card from "@/components/ui/card";
  import { AspectRatio } from "@/components/ui/aspect-ratio";
  import { Skeleton } from "@/components/ui/skeleton";
  import type { OPMLFeed } from "$lib/opml";
  import { fetchFeed } from "$lib/feeds";
  import type { CachedFeed } from "$lib/feeds";

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
</script>

<a href="/feed/{show.id}" class="block">
  <Card.Root
    class="py-0 overflow-hidden transition-transform duration-200 ease-in-out hover:scale-105"
  >
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
  </Card.Root>
</a>
