<script lang="ts">
  import "./layout.css";
  import { ModeWatcher } from "mode-watcher";
  import Player from "$lib/components/player.svelte";
  import Search from "$lib/components/search.svelte";
  import Separator from "@/components/ui/separator/separator.svelte";
  import * as Sidebar from "$lib/components/ui/sidebar";
  import SidebarTrigger from "$lib/components/ui/sidebar/sidebar-trigger.svelte";
  import { onNavigate } from "$app/navigation";
  import AppSidebar from "@/components/app-sidebar.svelte";
  import { onMount } from "svelte";
  import { pwaInfo } from "virtual:pwa-info";
  import { toast } from "svelte-sonner";
  import { Toaster } from "$lib/components/ui/sonner";

  let { children } = $props();

  let webManifestLink = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : "");

  onMount(async () => {
    if (pwaInfo) {
      const { registerSW } = await import("virtual:pwa-register");
      const updateSW = registerSW({
        immediate: true,
        onNeedRefresh() {
          toast("Update available", {
            description: "A new version of the app is ready to install.",
            duration: Infinity,
            action: {
              label: "Update",
              onClick: () => updateSW(true),
            },
            cancel: {
              label: "Dismiss",
              onClick: () => {},
            },
          });
        },
      });
    }
  });

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

<svelte:head>
  {@html webManifestLink}
</svelte:head>

<ModeWatcher />
<Toaster />

<Sidebar.Provider>
  <AppSidebar collapsible="icon" />
  <Sidebar.Inset>
    <header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <div class="flex flex-1 items-center gap-2">
        <SidebarTrigger class="-ml-1" />
        <Separator orientation="vertical" class="mx-2 h-4" />
      </div>
      <div class="ms-auto">
        <Search />
      </div>
    </header>
    <main class="flex flex-1 flex-col gap-4 p-6 pb-24 container mx-auto">
      {@render children()}
    </main>
  </Sidebar.Inset>
</Sidebar.Provider>

<Player />
