<script lang="ts">
  import Player from "$lib/components/player.svelte";
  import { tracks } from "$lib/tracks";
  import { Button } from "@/components/ui/button";

  let selected = $state<(typeof tracks)[0] | null>(null);
</script>

<h1>Welcome to SvelteKit</h1>
{#each tracks as track}
  <Button onclick={() => (selected = track)}>{track.title}</Button>
{/each}

{#if selected}
  <Player {...selected} />
{/if}
