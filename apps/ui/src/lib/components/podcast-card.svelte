<script lang="ts">
  import * as Card from "@/components/ui/card";
  import { AspectRatio } from "@/components/ui/aspect-ratio";
  import { Skeleton } from "@/components/ui/skeleton";

  import { resolve } from "$app/paths";
  import { eq, useLiveQuery } from "@tanstack/svelte-db";
  import { podcastsMetaCollection, type PodcastInput } from "@/db/collections";

  let { podcast }: { podcast: PodcastInput } = $props();

  const query = useLiveQuery((q) =>
    q
      .from({ podcastMeta: podcastsMetaCollection })
      .where(({ podcastMeta }) => eq(podcastMeta.podcastId, podcast.id))
      .select(({ podcastMeta }) => podcastMeta),
  );

  const feed = $derived(query.data?.[0]);
</script>

<a href={resolve(`/podcast/${podcast.id}`)} class="block">
  <Card.Root
    class="py-0 overflow-hidden transition-transform duration-100 ease-in-out hover:scale-105"
  >
    <Card.Content class="px-0" style="border-radius: inherit">
      <AspectRatio ratio={1 / 1}>
        {#if feed?.image}
          <img
            src={feed.image}
            alt={feed.title ?? podcast.text}
            class="size-full object-cover"
            style:view-transition-name={`podcast-${podcast.id}`}
          />
        {:else}
          <Skeleton class="size-full rounded-none" />
        {/if}
      </AspectRatio>
    </Card.Content>
  </Card.Root>
</a>
