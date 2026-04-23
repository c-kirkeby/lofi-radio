<script lang="ts">
  import PodcastCard from "$lib/components/podcast-card.svelte";
  import type { PodcastInput } from "@/db/collections";

  let {
    podcasts,
  }: {
    podcasts: PodcastInput[];
  } = $props();
</script>

<div
  class="grid xl:grid-cols-8 lg:grid-cols-7 md:grid-cols-5 grid-cols-3 gap-2 md:gap-4"
>
  {#each podcasts as podcast}
    <PodcastCard {podcast} />
  {/each}
</div>
