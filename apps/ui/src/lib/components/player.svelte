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
  import { X } from "@lucide/svelte";
  import { Button, buttonVariants } from "@/components/ui/button";

  let { src, title, show, image } = $props();
</script>

<div
  class="fixed bottom-0 w-full flex items-center gap-3 p-2 bg-background border-t border-border"
>
  {#if image}
    <img
      src={image}
      alt="Episode thumbnail"
      class="size-14 rounded-md object-cover shrink-0"
    />
  {/if}
  <div class="min-w-0 flex-1 relative">
    <AudioPlayer {src}>
      <div class="flex items-center gap-2">
        <div class="flex items-center">
          <AudioPlayerSeekBackwardButton
            class={buttonVariants({ size: "icon-lg", variant: "ghost" })}
          />
          <AudioPlayerPlayButton
            class={buttonVariants({ size: "icon-lg", variant: "ghost" })}
          />
          <AudioPlayerSeekForwardButton
            class={buttonVariants({ size: "icon-lg", variant: "ghost" })}
          />
        </div>
        <div class="flex flex-col min-w-0 flex-1">
          <div class="info text-sm truncate text-center">
            <strong>{title}</strong>
            <span class="text-muted-foreground">{show}</span>
          </div>
          <AudioPlayerControlBar>
            <AudioPlayerTimeDisplay />
            <AudioPlayerTimeRange />
            <AudioPlayerDurationDisplay />
            <AudioPlayerMuteButton />
            <AudioPlayerVolumeRange />
          </AudioPlayerControlBar>
        </div>
      </div>
    </AudioPlayer>
    <Button class="absolute top-0 right-0" variant="ghost" size="icon-sm">
      <X />
    </Button>
  </div>
</div>
