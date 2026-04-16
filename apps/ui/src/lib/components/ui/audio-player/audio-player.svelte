<script lang="ts">
  import "media-chrome";
  import { cn } from "$lib/utils.js";
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends HTMLAttributes<HTMLElement> {
    children?: Snippet;
    /** Bindable ref to the underlying <audio> element. */
    audio?: HTMLAudioElement | null;
    /** Bindable ref to the <media-controller> element. */
    mediaController?: HTMLElement | null;
  }

  let {
    class: className,
    children,
    audio = $bindable(null),
    mediaController = $bindable(null),
    style,
    ...restProps
  }: Props = $props();
</script>

<media-controller
  audio
  data-slot="audio-player"
  class={cn("w-full", className)}
  bind:this={mediaController}
  style="
    --media-button-icon-width: 1rem;
    --media-button-icon-height: 1rem;
    --media-icon-color: var(--foreground);
    --media-font: var(--font-sans);
    --media-font-size: 10px;
    --media-control-background: transparent;
    --media-control-hover-background: var(--color-accent);
    --media-control-padding: 0;
    --media-background-color: transparent;
    --media-primary-color: var(--color-primary);
    --media-secondary-color: var(--color-secondary);
    --media-text-color: var(--color-foreground);
    --media-tooltip-background: var(--color-background);
    --media-range-bar-color: var(--color-primary);
    --media-tooltip-arrow-display: none;
    --media-tooltip-border-radius: var(--radius-md);
    --media-preview-time-text-shadow: none;
    --media-preview-time-background: var(--color-background);
    --media-preview-time-border-radius: var(--radius-md);
    --media-range-track-background: var(--color-secondary);
    {style ?? ''}
  "
  {...restProps}
>
  <audio
    slot="media"
    preload="metadata"
    crossorigin="anonymous"
    data-slot="audio-player-element"
    bind:this={audio}
  ></audio>
  {@render children?.()}
</media-controller>
