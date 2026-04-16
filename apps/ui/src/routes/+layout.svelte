<script lang="ts">
  export const ssr = false;

  import "./layout.css";
  import favicon from "$lib/assets/favicon.svg";
  import { ModeWatcher } from "mode-watcher";
  import Player from "$lib/components/player.svelte";

  let { children } = $props();
</script>

<ModeWatcher />
<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="pb-24">
  {@render children()}
</div>

<Player />
