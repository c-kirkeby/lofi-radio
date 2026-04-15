<script lang="ts">
  import { cn } from "$lib/utils.js";
  import { buttonVariants } from "@/components/ui/button";
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends HTMLAttributes<HTMLElement> {}

  let { class: className, ...restProps }: Props = $props();
</script>

<media-mute-button
  data-slot="audio-player-mute-button"
  class={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), className)}
  {...restProps}
></media-mute-button>
