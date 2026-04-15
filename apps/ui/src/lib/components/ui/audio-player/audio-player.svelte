<script lang="ts">
  import "media-chrome";
  import { cn } from "$lib/utils.js";
  import type { Snippet } from "svelte";
  import type { HTMLAttributes, HTMLAudioAttributes } from "svelte/elements";

  type SpeechAudioData = {
    base64: string;
    mediaType: string;
  };

  interface Props extends HTMLAttributes<HTMLElement> {
    children?: Snippet;
    /** URL src for the audio element */
    src?: string;
    /** AI SDK SpeechResult data (base64 + mediaType) as an alternative to src */
    data?: SpeechAudioData;
    /** Additional attributes forwarded to the underlying <audio> element */
    audioProps?: Omit<HTMLAudioAttributes, "src">;
  }

  let {
    class: className,
    children,
    src,
    data,
    audioProps,
    style,
    ...restProps
  }: Props = $props();

  let resolvedSrc = $derived(
    src ?? (data ? `data:${data.mediaType};base64,${data.base64}` : undefined),
  );
</script>

<media-controller
  audio
  data-slot="audio-player"
  class={cn("w-full", className)}
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
    src={resolvedSrc}
    data-slot="audio-player-element"
    {...audioProps}
  ></audio>
  {@render children?.()}
</media-controller>
