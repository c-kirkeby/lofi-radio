<script lang="ts">
  import { cn } from "$lib/utils.js";
  import { buttonVariants } from "@/components/ui/button";
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends HTMLAttributes<HTMLElement> {}

  let { class: className, ...restProps }: Props = $props();
</script>

<media-play-button
  data-slot="audio-player-play-button"
  class={cn(buttonVariants({ variant: "outline", size: "icon-sm" }), className)}
  {...restProps}
></media-play-button>
