<script lang="ts">
  import { cn } from "$lib/utils.js";
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends HTMLAttributes<HTMLElement> {}

  let { class: className, ...restProps }: Props = $props();
</script>

<media-duration-display
  data-slot="audio-player-duration-display"
  class={cn("px-2 text-muted-foreground text-xs tabular-nums", className)}
  {...restProps}
></media-duration-display>
