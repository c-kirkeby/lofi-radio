<script lang="ts">
  import "./layout.css";
  import { ModeWatcher } from "mode-watcher";
  import Player from "$lib/components/player.svelte";
  import { onNavigate } from "$app/navigation";

  let { children } = $props();

  onNavigate((navigation) => {
    if (!document.startViewTransition) return;

    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
    });
  });
</script>

<ModeWatcher />

<div class="pb-24">
  {@render children()}
</div>

<Player />
