<script lang="ts">
  import * as Card from "@/components/ui/card";
  import { AspectRatio } from "@/components/ui/aspect-ratio";
  import { Skeleton } from "@/components/ui/skeleton";
  import ShowCard from "$lib/components/show-card.svelte";
  import type { OPMLFeed } from "$lib/opml";

  let {
    shows,
    loading = false,
    skeletonCount = 12,
  }: {
    shows: OPMLFeed[];
    loading?: boolean;
    skeletonCount?: number;
  } = $props();
</script>

<div class="grid grid-cols-8 gap-4">
  {#if loading}
    {#each { length: skeletonCount } as _, i (i)}
      <Card.Root class="py-0 overflow-hidden">
        <Card.Content class="px-0">
          <AspectRatio ratio={1 / 1}>
            <Skeleton class="size-full rounded-none" />
          </AspectRatio>
        </Card.Content>
      </Card.Root>
    {/each}
  {:else}
    {#each shows as show (show.id ?? show.xmlUrl)}
      <ShowCard {show} />
    {/each}
  {/if}
</div>
