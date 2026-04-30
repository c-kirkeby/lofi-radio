export interface PlayerEpisode {
  src: string;
  title: string;
  show: string;
  id: string;
  image: string | null;
}

export class Player {
  title = $state<string | null>(null);
  show = $state<string | null>(null);
  id = $state<string | null>(null);
  image = $state<string | null>(null);
  src = $state<string | null>(null);

  /** Reference to the <audio slot="media"> element, bound by the Player component. */
  audio = $state<HTMLAudioElement | null>(null);

  /** Reference to the <media-controller> element, bound by the Player component. */
  mediaController = $state<HTMLElement | null>(null);

  /**
   * Load and immediately play an episode.
   * Sets metadata fields and imperatively updates the audio element src so
   * media-chrome picks up the new source without re-mounting the component.
   */
  load(episode: PlayerEpisode) {
    this.title = episode.title;
    this.show = episode.show;
    this.image = episode.image;
    this.id = episode.id;
    this.src = episode.src;

    if (this.audio) {
      this.audio.src = episode.src;
      void this.audio.play();
    }

    this.#setupMediaSession(episode);
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

    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = "none";
    }
  }

  onplay() {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = "playing";
    }
  }

  ontimeupdate() {
    if (!this.audio || !("mediaSession" in navigator)) return;

    navigator.mediaSession.setPositionState({
      duration: this.audio.duration,
      position: this.audio.currentTime,
    });
  }

  onpause() {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = "paused";
    }
  }

  /* Not currently working; throws an error */
  onended() {
    this.close();
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
