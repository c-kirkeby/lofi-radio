<script lang="ts">
  import { X } from "@lucide/svelte";
  import { Button, buttonVariants } from "@/components/ui/button";
  import { player } from "$lib/state/player.svelte";
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
  } from "./ui/audio-player";
</script>

<svelte:window
  onkeydown={(event) => {
    switch (event.key) {
      case "Escape":
        event.preventDefault();
        player.close();
        break;
      case " ":
        event.preventDefault();
        player.playpause();
        break;
    }
  }}
/>

<div
  class="fixed bottom-0 w-full flex items-center gap-3 p-2 bg-background border-t border-border z-10 transition-transform duration-200"
  class:translate-y-full={!player.src}
>
  {#if player.image}
    <img
      src={player.image}
      alt="Episode thumbnail"
      class="size-14 rounded-md object-cover shrink-0"
    />
  {/if}

  <div class="min-w-0 flex-1 relative">
    <AudioPlayer
      bind:audio={player.audio}
      bind:mediaController={player.mediaController}
    >
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
            <strong>{player.title}</strong>
            <span class="text-muted-foreground">{player.show}</span>
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

    <Button
      class="absolute top-0 right-0"
      variant="ghost"
      size="icon-sm"
      onclick={() => player.close()}
    >
      <X />
    </Button>
  </div>
</div>
