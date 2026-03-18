/**
 * Audio manager using Web Audio API.
 * Supports looping background music, ambient sound effects (with distance-based
 * volume), and one-shot sound effects.
 */

/** Handle returned when creating an ambient/looping SFX */
export interface SfxHandle {
  /** Set volume (0–1). Will be further scaled by distance. */
  setVolume(v: number): void;
  /** Stop and clean up */
  stop(): void;
}

export interface MusicPlaybackSnapshot {
  url: string;
  offsetSeconds: number;
  volume: number;
  muted: boolean;
  wasPlaying: boolean;
}

export class AudioManager {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;      // master music gain
  private sfxGainNode: GainNode | null = null;    // master SFX gain
  private currentSource: AudioBufferSourceNode | null = null;
  private currentBuffer: AudioBuffer | null = null;
  private _volume = 0.15;
  private _muted = false;
  private _playing = false;
  private _started = false;
  private currentUrl: string | null = null;
  private playbackStartedAt = 0;
  private pausedOffset = 0;

  /** Cache of decoded audio buffers by URL */
  private bufferCache = new Map<string, AudioBuffer>();

  /** Active ambient SFX handles for cleanup */
  private activeSfx: Set<{ source: AudioBufferSourceNode; gain: GainNode }> = new Set();

  /** Must be called after a user gesture to satisfy autoplay policy */
  unlock() {
    if (this.audioContext) return;
    this.audioContext = new AudioContext();

    // Music gain
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = this._muted ? 0 : this._volume;
    this.gainNode.connect(this.audioContext.destination);

    // SFX gain (separate so music mute doesn't kill SFX, though we do mute both)
    this.sfxGainNode = this.audioContext.createGain();
    this.sfxGainNode.gain.value = this._muted ? 0 : 1;
    this.sfxGainNode.connect(this.audioContext.destination);

    this._started = true;

    // If we queued a play before unlock, start now
    if (this._playing && this.currentBuffer) {
      this.startPlayback();
    }
  }

  async loadAndPlay(url: string, startAtSeconds = 0) {
    this._playing = true;
    this.currentUrl = url;
    this.pausedOffset = Math.max(0, startAtSeconds);

    // Stop any current music
    this.stopPlayback();

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();

      // Ensure audioContext exists (it may not if no user gesture yet)
      if (!this.audioContext) {
        // Stash the buffer; we'll play once unlocked
        const tempCtx = new OfflineAudioContext(2, 44100, 44100);
        this.currentBuffer = await tempCtx.decodeAudioData(arrayBuffer);
        return;
      }

      this.currentBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      if (this._playing) {
        this.startPlayback(this.pausedOffset);
      }
    } catch (err) {
      console.warn("Failed to load audio:", url, err);
    }
  }

  private getCurrentOffsetSeconds() {
    if (!this.audioContext || !this.currentBuffer) {
      return this.pausedOffset;
    }
    if (!this.currentSource) {
      return this.pausedOffset;
    }
    const duration = this.currentBuffer.duration || 0;
    if (duration <= 0) return this.pausedOffset;
    const elapsed = this.audioContext.currentTime - this.playbackStartedAt;
    const offset = elapsed % duration;
    return Number.isFinite(offset) ? offset : this.pausedOffset;
  }

  private startPlayback(startAtSeconds = 0) {
    if (!this.audioContext || !this.gainNode || !this.currentBuffer) return;

    this.stopPlayback();

    const source = this.audioContext.createBufferSource();
    source.buffer = this.currentBuffer;
    source.loop = true;
    source.connect(this.gainNode);
    const duration = this.currentBuffer.duration || 0;
    const safeOffset =
      duration > 0
        ? ((Math.max(0, startAtSeconds) % duration) + duration) % duration
        : 0;
    source.start(0, safeOffset);
    this.currentSource = source;
    this.pausedOffset = safeOffset;
    this.playbackStartedAt = this.audioContext.currentTime - safeOffset;
  }

  private stopPlayback() {
    if (this.currentSource) {
      try {
        this.currentSource.stop();
      } catch {
        // already stopped
      }
      this.currentSource.disconnect();
      this.currentSource = null;
    }
  }

  stop() {
    this._playing = false;
    this.pausedOffset = 0;
    this.stopPlayback();
  }

  pause() {
    this.pausedOffset = this.getCurrentOffsetSeconds();
    this._playing = false;
    this.stopPlayback();
  }

  async resume() {
    if (!this.currentUrl || !this.currentBuffer) return;
    this._playing = true;
    if (!this.audioContext) {
      await this.loadAndPlay(this.currentUrl, this.pausedOffset);
      return;
    }
    this.startPlayback(this.pausedOffset);
  }

  get volume() {
    return this._volume;
  }
  set volume(v: number) {
    this._volume = Math.max(0, Math.min(1, v));
    if (this.gainNode && !this._muted) {
      this.gainNode.gain.value = this._volume;
    }
  }

  get muted() {
    return this._muted;
  }

  setMuted(next: boolean) {
    this._muted = !!next;
    if (this.gainNode) {
      this.gainNode.gain.value = this._muted ? 0 : this._volume;
    }
    if (this.sfxGainNode) {
      this.sfxGainNode.gain.value = this._muted ? 0 : 1;
    }
  }

  toggleMute() {
    this.setMuted(!this._muted);
    return this._muted;
  }

  get isStarted() {
    return this._started;
  }

  capturePlaybackSnapshot(): MusicPlaybackSnapshot | null {
    if (!this.currentUrl) return null;
    return {
      url: this.currentUrl,
      offsetSeconds: this.getCurrentOffsetSeconds(),
      volume: this._volume,
      muted: this._muted,
      wasPlaying: this._playing || !!this.currentSource,
    };
  }

  async restorePlaybackSnapshot(snapshot: MusicPlaybackSnapshot | null) {
    if (!snapshot) return;
    this.volume = snapshot.volume;
    this.setMuted(snapshot.muted);
    if (this.currentUrl !== snapshot.url || !this.currentBuffer) {
      await this.loadAndPlay(snapshot.url, snapshot.offsetSeconds);
      if (!snapshot.wasPlaying) {
        this.pause();
      }
      return;
    }

    this.pausedOffset = Math.max(0, snapshot.offsetSeconds);
    if (snapshot.wasPlaying) {
      this._playing = true;
      if (!this.audioContext) {
        await this.loadAndPlay(snapshot.url, snapshot.offsetSeconds);
      } else {
        this.startPlayback(snapshot.offsetSeconds);
      }
      return;
    }

    this._playing = false;
    this.stopPlayback();
  }

  // =========================================================================
  // SFX: Ambient loops + one-shots
  // =========================================================================

  /** Load and decode an audio buffer (cached) */
  async loadBuffer(url: string): Promise<AudioBuffer | null> {
    if (this.bufferCache.has(url)) return this.bufferCache.get(url)!;

    try {
      const resp = await fetch(url);
      const arrayBuf = await resp.arrayBuffer();
      const ctx = this.audioContext ?? new OfflineAudioContext(2, 44100, 44100);
      const decoded = await ctx.decodeAudioData(arrayBuf);
      this.bufferCache.set(url, decoded);
      return decoded;
    } catch (err) {
      console.warn("Failed to load SFX:", url, err);
      return null;
    }
  }

  /**
   * Play a looping ambient sound. Returns a handle to control volume / stop.
   * Volume should be set externally based on distance from listener.
   */
  async playAmbient(url: string, initialVolume = 0.5): Promise<SfxHandle | null> {
    const buffer = await this.loadBuffer(url);
    if (!buffer || !this.audioContext || !this.sfxGainNode) return null;

    const gain = this.audioContext.createGain();
    gain.gain.value = initialVolume;
    gain.connect(this.sfxGainNode);

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(gain);
    source.start(0);

    const entry = { source, gain };
    this.activeSfx.add(entry);

    return {
      setVolume: (v: number) => {
        gain.gain.value = Math.max(0, Math.min(1, v));
      },
      stop: () => {
        try { source.stop(); } catch { /* already stopped */ }
        source.disconnect();
        gain.disconnect();
        this.activeSfx.delete(entry);
      },
    };
  }

  /** Play a one-shot sound effect (not looped) */
  async playOneShot(url: string, volume = 0.6): Promise<void> {
    const buffer = await this.loadBuffer(url);
    if (!buffer || !this.audioContext || !this.sfxGainNode) return;

    const gain = this.audioContext.createGain();
    gain.gain.value = volume;
    gain.connect(this.sfxGainNode);

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(gain);
    source.start(0);
    source.onended = () => {
      source.disconnect();
      gain.disconnect();
    };
  }

  destroy() {
    this.stop();
    // Stop all SFX
    for (const entry of this.activeSfx) {
      try { entry.source.stop(); } catch { /* ok */ }
      entry.source.disconnect();
      entry.gain.disconnect();
    }
    this.activeSfx.clear();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
