<script lang="ts">
  import Pause from "@lucide/svelte/icons/pause";
  import Play from "@lucide/svelte/icons/play";
  import { Button } from "@/components/ui/button";
  import { Slider } from "@/components/ui/slider";

  let { src, title, show } = $props();

  let time = $state(0);
  let duration = $state(0);
  let paused = $state(true);

  // Tracks the slider position while dragging, falls back to actual playback time
  let scrubValue = $state<number | undefined>(undefined);
  let sliderPosition = $derived(scrubValue ?? time);

  function format(time: number) {
    if (isNaN(time)) return "...";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
</script>

<div class="fixed bottom-0 grid grid-cols-2 gap-1 p-1">
  <audio
    {src}
    bind:currentTime={time}
    bind:duration
    bind:paused
    onended={() => (time = 0)}
  ></audio>
  <Button
    aria-label={paused ? "play" : "pause"}
    class="rounded-full"
    size="icon"
    onclick={() => (paused = !paused)}
  >
    {#if paused}
      <Play />
    {:else}
      <Pause />
    {/if}
  </Button>
  <div class="info">
    <div class="description">
      <strong> {title}</strong>
      <span>{show}</span>
    </div>
    <div class="time">
      <span>{format(time)}</span>
      <Slider
        type="single"
        value={sliderPosition}
        min={0}
        max={duration || 1}
        step={1}
        onValueChange={(value: number) => (scrubValue = value)}
        onValueCommit={(value: number) => {
          time = value;
          scrubValue = undefined;
        }}
      />
    </div>
  </div>
</div>
