<script lang="ts">
  import { cn } from "$lib/utils.js";
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends HTMLAttributes<HTMLElement> {
    children?: Snippet;
  }

  let { class: className, children, ...restProps }: Props = $props();
</script>

<media-control-bar
  data-slot="audio-player-control-bar"
  class={cn("flex items-center gap-1", className)}
  {...restProps}
>
  {@render children?.()}
</media-control-bar>
