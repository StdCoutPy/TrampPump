// src/platform/PlatformManager.ts

class PlatformManager {
  private static instance: PlatformManager;

  private constructor() {}

  public static getInstance(): PlatformManager {
    if (!PlatformManager.instance) {
      PlatformManager.instance = new PlatformManager();
    }
    return PlatformManager.instance;
  }

  public isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  public getOrientation(): string {
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  }

  public onWindowResize(callback: () => void): void {
    window.addEventListener('resize', callback);
  }

  public offWindowResize(callback: () => void): void {
    window.removeEventListener('resize', callback);
  }

  public onVisibilityChange(callback: () => void): void {
    document.addEventListener('visibilitychange', callback);
  }

  public offVisibilityChange(callback: () => void): void {
    document.removeEventListener('visibilitychange', callback);
  }

  public isFullscreen(): boolean {
    return document.fullscreenElement !== null;
  }

  public requestFullscreen(): void {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }   
  }

  public exitFullscreen(): void {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } 
  }
}

export default PlatformManager;
