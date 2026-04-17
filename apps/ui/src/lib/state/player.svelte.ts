export interface PlayerEpisode {
  src: string;
  title: string;
  show: string;
  image: string | null;
}

export class Player {
  title = $state<string | null>(null);
  show = $state<string | null>(null);
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
    this.src = episode.src;

    if (this.audio) {
      this.audio.src = episode.src;
      void this.audio.play();
    }
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
  }
}

export const player = new Player();
