<script lang="ts">
  import "./layout.css";
  import { ModeWatcher } from "mode-watcher";
  import Player from "$lib/components/player.svelte";
  import Search from "$lib/components/search.svelte";
  import NavMobile from "$lib/components/nav-mobile.svelte";
  import NavSidebar from "$lib/components/nav-sidebar.svelte";
  import Separator from "@/components/ui/separator/separator.svelte";
  import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
  import { onNavigate } from "$app/navigation";

  let { children } = $props();

  // Sidebar open: collapsed (icon-only) at md, expanded at lg+
  let sidebarOpen = $state(false);

  function syncSidebarOpen() {
    sidebarOpen = window.matchMedia("(min-width: 1024px)").matches;
  }

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

<svelte:window onresize={syncSidebarOpen} />

<ModeWatcher />

<SidebarProvider bind:open={sidebarOpen} class="min-h-screen">
  <!-- Desktop sidebar: hidden on mobile -->
  <NavSidebar collapsible="icon" />

  <!-- Main content inset — grows to fill remaining space -->
  <SidebarInset>
    <div class="p-6 pb-32 md:pb-6 mx-auto container max-w-8xl">
      <div class="flex justify-end">
        <Search />
      </div>
      <Separator class="my-4" />
      {@render children()}
    </div>
  </SidebarInset>
</SidebarProvider>

<!-- Player: fixed bottom, sits above mobile nav (z-10, bottom offset on mobile) -->
<Player />

<!-- Mobile nav: fixed at very bottom, always visible on mobile (z-30) -->
<NavMobile />
