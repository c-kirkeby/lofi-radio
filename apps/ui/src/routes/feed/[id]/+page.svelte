<script lang="ts">
  import { page } from "$app/state";
  import { getCachedShows } from "$lib/db/shows";
  import { fetchFeed, parseDuration } from "$lib/feeds";
  import { sanitiseDescription } from "$lib/feed/parser";
  import type { Entry } from "$lib/feed/parser";
  import { player } from "$lib/state/player.svelte";
  import { Skeleton } from "@/components/ui/skeleton";
  import { Button } from "@/components/ui/button";
  import { Badge } from "@/components/ui/badge";
  import {
    ItemGroup,
    Item,
    ItemContent,
    ItemTitle,
    ItemDescription,
    ItemActions,
  } from "@/components/ui/item";
  import { Play, Mic, Link } from "@lucide/svelte";
  import ItemSeparator from "@/components/ui/item/item-separator.svelte";
  import { resolve } from "$app/paths";

  const DESCRIPTION_LIMIT = 100;

  const id = $derived(Number(page.params.id));

  const shows = await getCachedShows();
  const show = $derived(shows.find((s) => s.id === id));
  const feed = $derived(show ? await fetchFeed(show.id, show.xmlUrl) : null);

  const sanitised = $derived(
    feed?.description ? sanitiseDescription(feed.description) : null,
  );
  const descriptionTruncated = $derived(
    !!sanitised?.text && sanitised.text.length > DESCRIPTION_LIMIT,
  );
  let descriptionExpanded = $state(false);

  function playEpisode(entry: Entry) {
    if (!entry.url || !feed?.title || !feed.image || !entry.title) return;

    player.load({
      src: entry.url,
      title: entry.title,
      show: feed.title,
      id: feed.id,
      image: feed.image,
    });
  }

  function formatDate(published: string | undefined): string {
    if (!published) return "";

    const date = new Date(published);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);

    const locale = window.navigator.language;
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

    if (diffSeconds < 60) {
      return rtf.format(-diffSeconds, "second");
    } else if (diffMinutes < 60) {
      return rtf.format(-diffMinutes, "minute");
    } else if (diffHours < 24) {
      return rtf.format(-diffHours, "hour");
    } else {
      // Check if the date was "yesterday" (any time in the previous calendar day)
      const parts = rtf.formatToParts(-1, "day");
      const yesterdayLiteral = parts.map((p) => p.value).join("");

      const startOfToday = new Date(now);
      startOfToday.setHours(0, 0, 0, 0);
      const startOfYesterday = new Date(startOfToday);
      startOfYesterday.setDate(startOfToday.getDate() - 1);

      if (date >= startOfYesterday && date < startOfToday) {
        return yesterdayLiteral;
      }

      const sameYear = date.getFullYear() === now.getFullYear();
      return date.toLocaleDateString(locale, {
        ...(sameYear ? {} : { year: "numeric" }),
        month: "short",
        day: "numeric",
      });
    }
  }
</script>

<div class="min-h-screen p-6 pb-24 mx-auto container max-w-8xl">
  {#if !feed}
    <div class="flex gap-8 mb-8">
      <Skeleton class="size-48 rounded-xl shrink-0" />
      <div class="flex flex-col gap-3 justify-start pt-1 flex-1">
        <Skeleton class="h-8 w-2/3" />
        <Skeleton class="h-4 w-1/3" />
        <Skeleton class="h-4 w-1/2" />
        <Skeleton class="h-16 w-full mt-2" />
        <div class="flex gap-2 mt-1">
          <Skeleton class="h-5 w-16 rounded-full" />
          <Skeleton class="h-5 w-20 rounded-full" />
        </div>
      </div>
    </div>
    <!-- Episode list skeleton -->
    {#each { length: 8 } as _, i (i)}
      <div class="flex items-center gap-4 py-4 border-b">
        <div class="flex-1 flex flex-col gap-2">
          <Skeleton class="h-4 w-3/4" />
          <Skeleton class="h-3 w-1/4" />
        </div>
        <Skeleton class="h-8 w-16" />
      </div>
    {/each}
  {/if}

  <div class="flex flex-col items-center md:items-start md:flex-row gap-8 mb-8">
    {#if feed?.image}
      <div class="relative shrink-0">
        <div
          style="--background-image: url({feed.image})"
          class="bg-(image:--background-image) absolute bg-cover -z-10 inset-1 scale-200 rotate-45 blur-3xl md:hidden"
        ></div>
        <img
          src={feed.image}
          alt={feed.title}
          class="size-32 rounded-xl object-cover md:size-48"
          style:view-transition-name={`podcast-${feed.id}`}
        />
      </div>
    {/if}
    <div class="flex flex-col justify-start pt-1 gap-2 min-w-0">
      <h1
        class="text-2xl font-semibold tracking-tight text-center md:text-start"
      >
        {feed?.title}
      </h1>
      {#if feed?.categories?.length}
        <div class="hidden md:flex flex-row gap-2">
          {#each feed.categories as category (category)}
            <Badge variant="secondary">{category}</Badge>
          {/each}
        </div>
      {/if}
      <div
        class="flex flex-col md:flex-row font-bold flex-wrap justify-center md:justify-start items-center md:items-start gap-x-3 gap-y-1.5 text-sm text-muted-foreground"
      >
        {#if feed?.author}
          <span class="flex items-center gap-1.5">
            <Mic class="size-3.5 shrink-0" />
            {feed.author}
          </span>
        {/if}
        {#if feed?.link}
          <a
            href={feed.link}
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-foreground flex items-center gap-1.5 transition-colors min-w-0"
          >
            <Link class="size-3.5 shrink-0" />
            <span class="truncate text-foreground">{feed.link}</span>
          </a>
        {/if}
      </div>
      {#if sanitised?.html}
        <div class="text-sm text-muted-foreground">
          <div
            class={[
              "[&_p]:mb-2 [&_p:last-child]:mb-0 [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:opacity-80",
              !descriptionExpanded && descriptionTruncated
                ? "line-clamp-4"
                : "",
            ].join(" ")}
          >
            {@html sanitised.html}
          </div>
          {#if descriptionTruncated}
            <button
              onclick={() => (descriptionExpanded = !descriptionExpanded)}
              class="mt-1 text-foreground underline-offset-4 hover:underline text-xs font-medium"
            >
              {descriptionExpanded ? "Show less" : "Read more"}
            </button>
          {/if}
        </div>
      {/if}
    </div>
  </div>

  <!-- Episode list -->
  <ItemGroup>
    {#each feed?.entries ?? [] as entry, index (entry.id ?? entry.title)}
      {@const duration = parseDuration(entry.duration)}
      <Item class="py-0">
        <ItemContent class="grid grid-cols-5">
          <ItemTitle class="col-span-3">{entry.title ?? "Untitled"}</ItemTitle>
          <ItemDescription>
            {formatDate(entry.published)}
          </ItemDescription>
          <ItemDescription>
            {duration}
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Play {entry.title}"
            onclick={() => playEpisode(entry)}
          >
            <Play class="size-4" />
          </Button>
        </ItemActions>
        {#if index !== (feed?.entries?.length ?? 0) - 1}
          <ItemSeparator />
        {/if}
      </Item>
    {/each}
  </ItemGroup>
</div>
