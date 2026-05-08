<script lang="ts">
  import * as Card from "@/components/ui/card";
  import { AspectRatio } from "@/components/ui/aspect-ratio";
  import { Skeleton } from "@/components/ui/skeleton";
  import { resolve } from "$app/paths";
  import type { PodcastInput } from "@/db/collections";
  import { CircleCheck, Plus } from "@lucide/svelte";

  let {
    podcast,
    onsubscribe,
    onunsubscribe,
  }: {
    podcast: PodcastInput;
    onsubscribe?: () => void;
    onunsubscribe?: () => void;
  } = $props();
</script>

<a href={resolve(`/podcast/${podcast.feedId}`)} class="block group">
  <Card.Root
    class="py-0 overflow-hidden transition-transform duration-100 ease-in-out group-hover:scale-105"
  >
    <Card.Content class="px-0 relative" style="border-radius: inherit">
      <AspectRatio ratio={1 / 1}>
        {#if podcast.image}
          <img
            src={podcast.image}
            alt={podcast.title}
            class="size-full object-cover"
            style:view-transition-name={`podcast-${podcast.feedId}`}
          />
        {:else}
          <Skeleton class="size-full rounded-none" />
        {/if}
      </AspectRatio>

      <!-- Subscribe toggle overlay -->
      {#if podcast.subscribed}
        <!-- Always visible: green checkmark, click to unsubscribe -->
        <button
          class="absolute bottom-1.5 right-1.5 rounded-full bg-white/80 backdrop-blur-sm p-0.5 text-green-500 drop-shadow transition-opacity"
          aria-label="Unsubscribe from {podcast.title}"
          onclick={(e) => { e.preventDefault(); onunsubscribe?.(); }}
        >
          <CircleCheck class="size-5" fill="white" />
        </button>
      {:else}
        <!-- Only visible on hover: plus icon -->
        <button
          class="absolute bottom-1.5 right-1.5 rounded-full bg-white/80 backdrop-blur-sm p-0.5 text-foreground drop-shadow opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Subscribe to {podcast.title}"
          onclick={(e) => { e.preventDefault(); onsubscribe?.(); }}
        >
          <Plus class="size-5" />
        </button>
      {/if}
    </Card.Content>
  </Card.Root>
  <div class="mt-2 px-0.5">
    <p class="text-sm font-medium leading-tight line-clamp-2">
      {podcast.title ?? ""}
    </p>
    {#if podcast.author}
      <p class="text-xs text-muted-foreground mt-0.5 line-clamp-1">
        {podcast.author}
      </p>
    {/if}
  </div>
</a>
