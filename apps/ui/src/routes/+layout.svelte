<script lang="ts">
  import "./layout.css";
  import { ModeWatcher } from "mode-watcher";
  import Player from "$lib/components/player.svelte";
  import Search from "$lib/components/search.svelte";
  import Separator from "@/components/ui/separator/separator.svelte";
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

<div class="min-h-screen p-6 pb-24 mx-auto container max-w-8xl">
  <div class="flex justify-end">
    <Search />
  </div>
  <Separator class="my-4" />
  {@render children()}
</div>

<Player />
