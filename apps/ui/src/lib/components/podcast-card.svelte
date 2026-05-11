<script lang="ts">
  import * as Card from "@/components/ui/card";
  import { AspectRatio } from "@/components/ui/aspect-ratio";
  import { Skeleton } from "@/components/ui/skeleton";
  import { resolve } from "$app/paths";
  import type { PodcastInput } from "@/db/collections";

  let { podcast }: { podcast: PodcastInput } = $props();
</script>

<a href={resolve(`/podcast/${podcast.feedId}`)} class="block">
  <Card.Root
    class="py-0 overflow-hidden transition-transform duration-100 ease-in-out hover:scale-105"
  >
    <Card.Content class="px-0" style="border-radius: inherit">
      <AspectRatio ratio={1 / 1}>
        {#if podcast.feedId}
          <img
            src={`/image/${podcast.feedId}.png`}
            alt={podcast.title}
            class="size-full object-cover"
            style:view-transition-name={`podcast-${podcast.feedId}`}
          />
        {:else}
          <Skeleton class="size-full rounded-none" />
        {/if}
      </AspectRatio>
    </Card.Content>
  </Card.Root>
</a>
