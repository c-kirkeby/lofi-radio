<script lang="ts">
  import * as Card from "@/components/ui/card";
  import { AspectRatio } from "@/components/ui/aspect-ratio";
  import { Skeleton } from "@/components/ui/skeleton";

  import { resolve } from "$app/paths";
  import { type PodcastInput, type PodcastMetaInput } from "@/db/collections";

  let {
    podcast,
  }: { podcast: PodcastInput & { podcastsMeta: PodcastMetaInput[] } } =
    $props();
</script>

<a href={resolve(`/podcast/${podcast.id}`)} class="block">
  <Card.Root
    class="py-0 overflow-hidden transition-transform duration-100 ease-in-out hover:scale-105"
  >
    <Card.Content class="px-0" style="border-radius: inherit">
      <AspectRatio ratio={1 / 1}>
        {#if podcast.podcastsMeta?.[0]?.image}
          <img
            src={podcast.podcastsMeta[0].image}
            alt={podcast.podcastsMeta[0].title ?? podcast.text}
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
