<script lang="ts">
  import {
    AudioPlayer,
    AudioPlayerControlBar,
    AudioPlayerDurationDisplay,
    AudioPlayerMuteButton,
    AudioPlayerPlayButton,
    AudioPlayerSeekBackwardButton,
    AudioPlayerSeekForwardButton,
    AudioPlayerTimeDisplay,
    AudioPlayerTimeRange,
    AudioPlayerVolumeRange,
  } from "@/components/ui/audio-player";
  import { buttonVariants } from "@/components/ui/button";

  let { src, title, show, image } = $props();
</script>

<div class="fixed bottom-0 w-full flex items-center gap-3 p-2 bg-background border-t border-border">
  {#if image}
    <img
      src={image}
      alt="Episode thumbnail"
      class="size-14 rounded-md object-cover shrink-0"
    />
  {/if}
  <div class="flex flex-col min-w-0 flex-1">
    <div class="info text-sm truncate">
      <strong>{title}</strong>
      <span class="text-muted-foreground">{show}</span>
    </div>
    <AudioPlayer {src}>
      <AudioPlayerControlBar>
        <AudioPlayerPlayButton class={buttonVariants({ size: "icon-lg" })} />
        <AudioPlayerSeekBackwardButton
          class={buttonVariants({ size: "icon-lg" })}
        />
        <AudioPlayerSeekForwardButton
          class={buttonVariants({ size: "icon-lg" })}
        />
        <AudioPlayerTimeDisplay />
        <AudioPlayerTimeRange />
        <AudioPlayerDurationDisplay />
        <AudioPlayerMuteButton />
        <AudioPlayerVolumeRange />
      </AudioPlayerControlBar>
    </AudioPlayer>
  </div>
</div>
