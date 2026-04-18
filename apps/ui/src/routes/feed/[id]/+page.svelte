<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { getCachedShows } from "$lib/db/shows";
  import { fetchFeed, parseDuration } from "$lib/feeds";
  import type { CachedFeed, FeedEntryExtended } from "$lib/feeds";
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
  import DOMPurify from "dompurify";
  import ItemSeparator from "@/components/ui/item/item-separator.svelte";

  const id = $derived(Number(page.params.id));

  let feed = $state<CachedFeed | null>(null);
  let feedImage = $state<string | null>(null);
  let feedTitle = $state<string | null>(null);
  let feedAuthor = $state<string | null>(null);
  let feedDescription = $state<string | null>(null);
  let feedDescriptionHtml = $state<string | null>(null);
  let feedLink = $state<string | null>(null);
  let feedCategories = $state<string[]>([]);
  let descriptionExpanded = $state(false);
  let loading = $state(true);
  let error = $state<string | null>(null);

  const DESCRIPTION_LIMIT = 200;

  const descriptionTruncated = $derived(
    !!feedDescription && feedDescription.length > DESCRIPTION_LIMIT,
  );

  function sanitizeDescription(raw: string): { html: string; text: string } {
    const html = DOMPurify.sanitize(raw, {
      ALLOWED_TAGS: ["p", "a"],
      ALLOWED_ATTR: ["href"],
    });

    const tmp = document.createElement("template");
    tmp.innerHTML = html;
    return { html, text: tmp.content.textContent ?? "" };
  }

  onMount(async () => {
    try {
      const shows = await getCachedShows();
      const show = shows.find((s) => s.id === id);

      if (!show) {
        error = "Show not found.";
        return;
      }

      const data = await fetchFeed(show.id!, show.xmlUrl);
      if (!data) {
        error = "Failed to load feed.";
        return;
      }

      feed = data;
      feedImage = (data as CachedFeed & { image?: string }).image ?? null;
      feedTitle = data.title ?? show.text;
      feedLink = data.link ?? null;

      const d = data as CachedFeed & {
        author?: { name?: string; email?: string } | string;
        itunesAuthor?: string;
        itunesSummary?: string;
        itunesCategories?: string[];
      };
      feedAuthor =
        typeof d.author === "string"
          ? d.author
          : (d.author?.name ?? d.author?.email ?? d.itunesAuthor ?? null);

      const rawDesc = data.description ?? d.itunesSummary ?? null;
      const rawDescStr =
        typeof rawDesc === "string"
          ? rawDesc
          : typeof rawDesc === "object" && rawDesc !== null
            ? (((rawDesc as Record<string, unknown>)["#text"] as
                | string
                | undefined) ?? null)
            : null;

      if (rawDescStr) {
        const { html, text } = sanitizeDescription(rawDescStr);
        feedDescriptionHtml = html;
        feedDescription = text;
      }
      feedCategories = d.itunesCategories ?? [];
    } catch (err) {
      console.error(err);
      error = "An unexpected error occurred.";
    } finally {
      loading = false;
    }
  });

  function playEpisode(entry: FeedEntryExtended) {
    const enc = entry.enclosure;
    const src = enc?.["@_url"] ?? enc?.url ?? null;
    if (!src) return;
    player.load({
      src,
      title: entry.title ?? "Unknown episode",
      show: feedTitle ?? "",
      image: feedImage,
    });
  }

  function formatDate(published: string | undefined): string {
    if (!published) return "";
    return new Date(published).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
</script>

<div class="min-h-screen p-6 pb-24 mx-auto container max-w-8xl">
  {#if loading}
    <!-- Header skeleton -->
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
  {:else if error}
    <p class="text-destructive">{error}</p>
  {:else if feed}
    <!-- Feed header -->
    <div class="flex gap-8 mb-8">
      {#if feedImage}
        <img
          src={feedImage}
          alt={feedTitle ?? ""}
          class="size-48 rounded-xl object-cover shrink-0"
        />
      {/if}
      <div class="flex flex-col justify-start pt-1 gap-2 min-w-0">
        <h1 class="text-2xl font-semibold tracking-tight">{feedTitle}</h1>
        <div class="flex flex-row gap-2">
          {#each feedCategories as category (category)}
            <Badge variant="secondary">{category}</Badge>
          {/each}
        </div>
        <div
          class="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-muted-foreground"
        >
          {#if feedAuthor}
            <span class="flex items-center gap-1.5">
              <Mic class="size-3.5 shrink-0" />
              {feedAuthor}
            </span>
          {/if}
          {#if feedLink}
            <a
              href={feedLink}
              target="_blank"
              rel="noopener noreferrer"
              class="hover:text-foreground flex items-center gap-1.5 transition-colors min-w-0"
            >
              <Link class="size-3.5 shrink-0" />
              <span class="truncate text-foreground">{feedLink}</span>
            </a>
          {/if}
        </div>
        {#if feedDescriptionHtml}
          <div class="text-sm text-muted-foreground">
            <div
              class={[
                "[&_p]:mb-2 [&_p:last-child]:mb-0 [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:opacity-80",
                !descriptionExpanded && descriptionTruncated
                  ? "line-clamp-4"
                  : "",
              ].join(" ")}
            >
              {@html feedDescriptionHtml}
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
      {#each feed.entries ?? [] as entry, index (entry.id ?? entry.title)}
        {@const ext = entry as FeedEntryExtended}
        {@const duration = parseDuration(ext.duration)}
        {@const encType = ext.enclosure?.["@_type"] ?? ""}
        {#if encType.startsWith("audio/")}
          <Item class="py-0">
            <ItemContent>
              <ItemTitle>{entry.title ?? "Untitled"}</ItemTitle>
              <ItemDescription>
                {formatDate(entry.published)}{#if duration && entry.published}
                  ·
                {/if}{duration}
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button
                onclick={() => playEpisode(ext)}
                variant="ghost"
                size="icon"
                aria-label="Play {entry.title}"
              >
                <Play class="size-4" />
              </Button>
            </ItemActions>
            {#if index !== (feed.entries?.length ?? 0) - 1}
              <ItemSeparator />
            {/if}
          </Item>
        {/if}
      {/each}
    </ItemGroup>
  {/if}
</div>
