import {
  progressCollection,
  episodesCollection,
  podcastsCollection,
  getQueueOrdered,
  dequeue,
  type QueueInput,
} from "@/db/collections";

export interface PlayerEpisode {
  src: string;
  title: string;
  show: string;
  id: string;
  feedId: number;
  image: string | null;
}

/** How often (in ms) to persist playback position to progressCollection. */
const PROGRESS_SAVE_INTERVAL_MS = 5_000;

export class Player {
  title = $state<string | null>(null);
  show = $state<string | null>(null);
  id = $state<string | null>(null);
  feedId = $state<number | null>(null);
  image = $state<string | null>(null);
  src = $state<string | null>(null);
  currentTime = $state(0);
  duration = $state(0);

  /** Reference to the <audio slot="media"> element, bound by the Player component. */
  audio = $state<HTMLAudioElement | null>(null);

  /** Reference to the <media-controller> element, bound by the Player component. */
  mediaController = $state<HTMLElement | null>(null);

  /** Timestamp of the last progress save to progressCollection. */
  #lastSavedAt = 0;

  /**
   * Load and immediately play an episode.
   * Sets metadata fields and imperatively updates the audio element src so
   * media-chrome picks up the new source without re-mounting the component.
   * Restores saved playback position if the episode was partially played.
   */
  load(episode: PlayerEpisode, autoplay = true) {
    this.title = episode.title;
    this.show = episode.show;
    this.image = episode.image;
    this.id = episode.id;
    this.feedId = episode.feedId;
    this.src = episode.src;

    if (this.audio) {
      this.audio.src = episode.src;

      // Restore saved position if episode was partially played but not finished
      const saved = progressCollection.get(episode.src);
      if (saved && !saved.played && saved.position > 0) {
        this.audio.currentTime = saved.position;
      }

      if (autoplay) void this.audio.play();
    }

    this.#setupMediaSession(episode);
  }

  /**
   * Load an episode into the player without starting playback.
   * Used when queuing the first episode while nothing is playing.
   */
  loadPaused(episode: PlayerEpisode) {
    this.load(episode, false);
  }

  /**
   * Load an episode from a queue item. Resolves episode and podcast data
   * from the in-memory collections. Skips gracefully if data not yet loaded.
   */
  loadFromQueue(queueItem: QueueInput, autoplay = true): boolean {
    const episode = episodesCollection.get(queueItem.url);
    const podcast = podcastsCollection.get(queueItem.feedId);

    if (!episode || !podcast) {
      console.warn(
        "[Player] loadFromQueue: episode or podcast not yet in collection, skipping",
        queueItem,
      );
      return false;
    }

    this.load(
      {
        src: episode.url,
        title: episode.title ?? "Untitled",
        show: podcast.title,
        id: String(podcast.feedId),
        feedId: podcast.feedId,
        image: episode.image ?? podcast.image,
      },
      autoplay,
    );
    return true;
  }

  playpause() {
    if (!this.audio) return;

    if (this.audio.paused) {
      void this.audio.play();
    } else {
      this.audio.pause();
    }
  }

  /** Pause playback and hide the player bar. */
  close() {
    this.audio?.pause();
    this.title = null;
    this.show = null;
    this.image = null;
    this.src = null;
    this.feedId = null;
    this.currentTime = 0;
    this.duration = 0;

    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = "none";
    }
  }

  /**
   * Stop the current episode and advance to the next item in the queue.
   * If the queue is empty, close the player instead.
   * Use this when the user explicitly dismisses the current episode
   * (close button, remove-from-queue while playing, Escape key).
   */
  skipToNext() {
    const next = getQueueOrdered()[0];
    if (next) {
      this.loadFromQueue(next);
    } else {
      this.close();
    }
  }

  onplay() {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = "playing";
    }
  }

  ontimeupdate() {
    if (!this.audio) return;

    const currentTime = this.audio.currentTime;
    const duration = isFinite(this.audio.duration) ? this.audio.duration : 0;

    this.currentTime = currentTime;
    this.duration = duration;

    if ("mediaSession" in navigator && duration > 0 && currentTime <= duration) {
      navigator.mediaSession.setPositionState({
        duration,
        position: currentTime,
      });
    }

    // Persist progress every PROGRESS_SAVE_INTERVAL_MS
    const now = Date.now();
    if (this.src && this.feedId !== null && now - this.#lastSavedAt >= PROGRESS_SAVE_INTERVAL_MS) {
      this.#lastSavedAt = now;
      this.#saveProgress(this.src, this.feedId, currentTime, duration, false);
    }
  }

  onpause() {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = "paused";
    }
    // Save progress immediately on pause
    if (this.src && this.feedId !== null && this.audio) {
      this.#saveProgress(
        this.src,
        this.feedId,
        this.audio.currentTime,
        isFinite(this.audio.duration) ? this.audio.duration : 0,
        false,
      );
    }
  }

  onended() {
    if (!this.src || this.feedId === null) {
      this.close();
      return;
    }

    const finishedUrl = this.src;
    const finishedFeedId = this.feedId;
    const finalDuration = this.duration;

    // Mark as played
    this.#saveProgress(finishedUrl, finishedFeedId, finalDuration, finalDuration, true);

    // Remove from queue
    dequeue(finishedUrl);

    // Check if there's a next item in the queue
    const remaining = getQueueOrdered();
    const next = remaining[0];

    if (next) {
      this.loadFromQueue(next);
    } else {
      this.close();
    }
  }

  #saveProgress(url: string, feedId: number, position: number, duration: number, played: boolean) {
    const entry = { url, feedId, position, duration, played, updatedAt: new Date() };
    if (progressCollection.has(url)) {
      progressCollection.update(url, (draft) => {
        draft.position = position;
        draft.duration = duration;
        draft.played = played;
        draft.updatedAt = entry.updatedAt;
      });
    } else {
      progressCollection.insert(entry);
    }
  }

  #setupMediaSession(episode: PlayerEpisode) {
    if (!("mediaSession" in navigator)) return;

    const artwork: MediaImage[] = episode.image ? [{ src: episode.image }] : [];

    navigator.mediaSession.metadata = new MediaMetadata({
      title: episode.title,
      artist: episode.show,
      artwork,
    });

    navigator.mediaSession.setActionHandler("play", () => {
      void this.audio?.play();
    });

    navigator.mediaSession.setActionHandler("pause", () => {
      this.audio?.pause();
    });

    navigator.mediaSession.setActionHandler("seekto", (details) => {
      if (!this.audio || !details.seekTime) return;

      if (details.fastSeek) {
        this.audio.currentTime = details.seekTime;
      } else {
        this.audio.currentTime = details.seekTime;
      }
    });

    navigator.mediaSession.setActionHandler("seekbackward", (details) => {
      if (!this.audio) return;
      this.audio.currentTime = Math.max(0, this.audio.currentTime - (details.seekOffset ?? 15));
    });

    navigator.mediaSession.setActionHandler("seekforward", (details) => {
      if (!this.audio) return;
      this.audio.currentTime = Math.min(
        this.audio.duration,
        this.audio.currentTime + (details.seekOffset ?? 30),
      );
    });

    navigator.mediaSession.setActionHandler("stop", () => {
      this.close();
    });
  }
}

export const player = new Player();
