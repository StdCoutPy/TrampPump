// src/audio/AudioManager.ts

class AudioManager {
  private static instance: AudioManager;
  private audioCache: Map<string, HTMLAudioElement>;

  private constructor() {
    this.audioCache = new Map();
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  public registerSound(key: string, src: string): void {
    if (this.audioCache.has(key)) {
      console.warn(`Sound with key "${key}" already exists.`);
    } else {
      const audio = new Audio(src);
      this.audioCache.set(key, audio);
    }
  }

  public playSound(key: string, loop: boolean = false): void {
    const audio = this.audioCache.get(key);
    if (audio) {
      audio.loop = loop;
      audio.play().catch(error => console.error('Audio play error:', error));
    } else {
      console.warn(`Sound with key "${key}" is not registered.`);
      // Placeholder sound
      this.playPlaceholderSound();
    }
  }

  public stopSound(key: string): void {
    const audio = this.audioCache.get(key);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    } else {
      console.warn(`Sound with key "${key}" is not registered.`);
    }
  }

  public setVolume(volume: number): void {
    if (volume < 0 || volume > 1) {
      console.warn('Volume must be between 0 and 1.');
      return;
    }
    this.audioCache.forEach(audio => {
      audio.volume = volume;
    });
  }

  public mute(muted: boolean): void {
    this.audioCache.forEach(audio => {
      audio.muted = muted;
    });
  }

  private playPlaceholderSound(): void {
    const placeholderAudio = new Audio('path/to/placeholder/audio.mp3');
    placeholderAudio.play();
  }
}

export default AudioManager;
