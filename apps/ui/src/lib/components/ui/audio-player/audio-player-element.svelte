<script lang="ts">
  import type { HTMLAudioAttributes } from "svelte/elements";

  type SpeechAudioData = {
    base64: string;
    mediaType: string;
  };

  type Props = Omit<HTMLAudioAttributes, "src"> &
    ({ data: SpeechAudioData } | { src: string });

  let { ...props }: Props = $props();

  let src = $derived(
    "src" in props
      ? props.src
      : `data:${props.data.mediaType};base64,${props.data.base64}`
  );
</script>

<audio data-slot="audio-player-element" {src} {...props}></audio>
