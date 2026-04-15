<script lang="ts">
  import { cn } from "$lib/utils.js";
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends HTMLAttributes<HTMLElement> {}

  let { class: className, ...restProps }: Props = $props();
</script>

<media-time-range
  data-slot="audio-player-time-range"
  class={cn("flex-1", className)}
  {...restProps}
></media-time-range>
