<script lang="ts">
  import * as Card from "@/components/ui/card";
  import { AspectRatio } from "@/components/ui/aspect-ratio";
  import { Skeleton } from "@/components/ui/skeleton";
  import { resolve } from "$app/paths";
  import type { PodcastMetaInput } from "@/db/collections";

  let { podcastMeta }: { podcastMeta: PodcastMetaInput } = $props();
</script>

<a href={resolve(`/podcast/${podcastMeta.podcastId}`)} class="block group">
  <Card.Root
    class="py-0 overflow-hidden transition-transform duration-100 ease-in-out group-hover:scale-105"
  >
    <Card.Content class="px-0" style="border-radius: inherit">
      <AspectRatio ratio={1 / 1}>
        {#if podcastMeta.image}
          <img
            src={podcastMeta.image}
            alt={podcastMeta.title}
            class="size-full object-cover"
            style:view-transition-name={`podcast-${podcastMeta.podcastId}`}
          />
        {:else}
          <Skeleton class="size-full rounded-none" />
        {/if}
      </AspectRatio>
    </Card.Content>
  </Card.Root>
  <div class="mt-2 px-0.5">
    <p class="text-sm font-medium leading-tight line-clamp-2">{podcastMeta.title ?? ""}</p>
    {#if podcastMeta.author}
      <p class="text-xs text-muted-foreground mt-0.5 line-clamp-1">{podcastMeta.author}</p>
    {/if}
  </div>
</a>
