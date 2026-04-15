<script lang="ts">
  import { cn } from "$lib/utils.js";
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends HTMLAttributes<HTMLElement> {}

  let { class: className, ...restProps }: Props = $props();
</script>

<media-volume-range
  data-slot="audio-player-volume-range"
  class={cn("w-20", className)}
  {...restProps}
></media-volume-range>
