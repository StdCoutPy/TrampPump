// src/assets/AssetManager.ts

class AssetManager {
  private static instance: AssetManager;
  private assetsCache: Map<string, any>;

  private constructor() {
    this.assetsCache = new Map();
  }

  public static getInstance(): AssetManager {
    if (!AssetManager.instance) {
      AssetManager.instance = new AssetManager();
    }
    return AssetManager.instance;
  }

  public registerAsset(key: string, asset: any): void {
    if (this.assetsCache.has(key)) {
      console.warn(`Asset with key "${key}" already exists.`);
    } else {
      this.assetsCache.set(key, asset);
    }
  }

  public loadAsset(key: string): any {
    if (this.assetsCache.has(key)) {
      return this.assetsCache.get(key);
    } else {
      console.warn(`Asset with key "${key}" is not registered.`);
      // Placeholder asset
      return this.createPlaceholderAsset(key);
    }
  }

  public unloadAsset(key: string): void {
    if (this.assetsCache.has(key)) {
      this.assetsCache.delete(key);
    } else {
      console.warn(`Asset with key "${key}" is not found.`);
    }
  }

  private createPlaceholderAsset(key: string): any {
    // Placeholder asset logic
    return { placeholder: true, key };
  }
}

export default AssetManager;
