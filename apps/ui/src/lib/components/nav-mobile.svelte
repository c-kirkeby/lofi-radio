<script lang="ts">
  import { page } from "$app/state";
  import { resolve } from "$app/paths";
  import { LayoutGrid, ListVideo } from "@lucide/svelte";
  import { cn } from "@/utils";

  const navItems = [
    { label: "Podcasts", icon: LayoutGrid, href: resolve("/") },
    { label: "Queue", icon: ListVideo, href: resolve("/queue") },
  ];
</script>

<!-- Mobile bottom nav: fixed at very bottom, always below player (md:hidden) -->
<nav
  class="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-background border-t border-border"
  aria-label="Main navigation"
>
  <ul class="flex items-stretch h-14">
    {#each navItems as item (item.href)}
      {@const active = page.url.pathname === item.href}
      <li class="flex-1">
        <a
          href={item.href}
          class={cn(
            "flex flex-col items-center justify-center h-full gap-1 text-xs font-medium transition-colors",
            {
              "text-foreground": active,
              "text-muted-foreground hover:text-foreground": !active,
            },
          )}
        >
          <item.icon class="size-5" />
          <span>{item.label}</span>
        </a>
      </li>
    {/each}
  </ul>
</nav>
