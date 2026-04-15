<script lang="ts">
  import { cn } from "$lib/utils.js";
  import { buttonVariants } from "@/components/ui/button";
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends HTMLAttributes<HTMLElement> {
    seekOffset?: number;
  }

  let { class: className, seekOffset = 10, ...restProps }: Props = $props();
</script>

<media-seek-backward-button
  data-slot="audio-player-seek-backward-button"
  seekoffset={seekOffset}
  class={cn(buttonVariants({ variant: "outline", size: "icon-sm" }), className)}
  {...restProps}
></media-seek-backward-button>
