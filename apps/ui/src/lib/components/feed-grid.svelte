<script lang="ts">
  import FeedCard from "$lib/components/feed-card.svelte";
  import type { Feed } from "@/feed/parser";

  let {
    feeds,
  }: {
    feeds: Feed[];
  } = $props();
</script>

<div
  class="grid xl:grid-cols-8 lg:grid-cols-7 md:grid-cols-5 grid-cols-3 gap-2 md:gap-4"
>
  {#each feeds as feed}
    <FeedCard {feed} />
  {/each}
</div>
