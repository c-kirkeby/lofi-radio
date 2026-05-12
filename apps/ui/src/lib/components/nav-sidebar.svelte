<script lang="ts">
  import { page } from "$app/state";
  import * as Sidebar from "$lib/components/ui/sidebar";
  import { LayoutGrid, ListVideo, MicIcon } from "@lucide/svelte";
  import type { ComponentProps } from "svelte";

  let {
    ref = $bindable(null),
    collapsible = "icon",
    ...restProps
  }: ComponentProps<typeof Sidebar.Root> = $props();
  const navItems = [
    { label: "Podcasts", icon: LayoutGrid, href: "/" },
    { label: "Queue", icon: ListVideo, href: "/queue" },
  ];
</script>

<Sidebar.Root bind:ref {collapsible} {...restProps}>
  <Sidebar.Header>
    <Sidebar.Menu>
      <Sidebar.MenuItem>
        <Sidebar.MenuButton size="lg" class="md:h-8 md:p-0">
          {#snippet child({ props })}
            <a href="/" {...props}>
              <div
                class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
              >
                <MicIcon class="size-4" />
              </div>
              <div class="grid flex-1 text-start text-sm leading-tight">
                <span class="truncate font-medium">Lofi Radio</span>
              </div>
            </a>
          {/snippet}
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    </Sidebar.Menu>
  </Sidebar.Header>
  <Sidebar.Group>
    <Sidebar.GroupContent>
      <Sidebar.Content>
        {#each navItems as item (item.href)}
          <Sidebar.MenuItem>
            <Sidebar.MenuButton
              isActive={page.url.pathname === item.href}
              tooltipContent={item.label}
            >
              {#snippet child({ props })}
                <a href={item.href} {...props}>
                  <item.icon />
                  <span>{item.label}</span>
                </a>
              {/snippet}
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
        {/each}
      </Sidebar.Content>
    </Sidebar.GroupContent>
  </Sidebar.Group>
</Sidebar.Root>
