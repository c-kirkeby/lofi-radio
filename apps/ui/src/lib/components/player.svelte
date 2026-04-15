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

  let { src, title, show } = $props();
</script>

<div class="fixed bottom-0 w-full grid gap-1 px-2 py-1">
  <div class="info text-sm">
    <strong>{title}</strong>
    <span class="text-muted-foreground">{show}</span>
  </div>
  <AudioPlayer {src}>
    <AudioPlayerControlBar>
      <AudioPlayerPlayButton />
      <AudioPlayerSeekBackwardButton />
      <AudioPlayerSeekForwardButton />
      <AudioPlayerTimeDisplay />
      <AudioPlayerTimeRange />
      <AudioPlayerDurationDisplay />
      <AudioPlayerMuteButton />
      <AudioPlayerVolumeRange />
    </AudioPlayerControlBar>
  </AudioPlayer>
</div>
