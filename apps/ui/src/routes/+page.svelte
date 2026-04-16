<script lang="ts">
  import { onMount } from "svelte";
  import ShowGrid from "$lib/components/show-grid.svelte";
  import { OPMLParser } from "$lib/opml";
  import type { OPMLFeed } from "$lib/opml";
  import { getCachedShows, cacheShows } from "$lib/db/shows";
  import podcastsOpml from "$lib/podcasts.opml?raw";

  let shows = $state<OPMLFeed[]>([]);
  let loading = $state(true);

  onMount(async () => {
    try {
      // Try to load from IndexedDB first
      const cached = await getCachedShows();
      if (cached.length > 0) {
        shows = cached;
        loading = false;
        return;
      }

      // Fall back to parsing the bundled OPML file
      const parser = new OPMLParser();
      const doc = parser.parse(podcastsOpml);
      shows = doc.feeds;

      // Persist to IndexedDB for subsequent loads and get back shows with assigned ids
      // $state.snapshot() strips the reactive proxy so structured clone can serialise it
      shows = await cacheShows($state.snapshot(shows));
    } catch (err) {
      console.error("Failed to load shows:", err);
    } finally {
      loading = false;
    }
  });
</script>

<div class="min-h-screen p-6 pb-24 mx-auto container">
  <h1 class="mb-6 text-2xl font-semibold tracking-tight">Podcasts</h1>
  <ShowGrid {shows} {loading} />
</div>

