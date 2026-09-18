// СТЕРЕТЬ И УДАЛИТЬ СТРОКУ 1! Код должен начинаться отсюда:
class ConfigManager {
  private static instance: ConfigManager;
  private configCache: Map<string, any>;

  private constructor() {
    this.configCache = new Map();
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  public async loadConfig(url: string): Promise<any> {
    if (this.configCache.has(url)) {
      return this.configCache.get(url);
    } else {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to load config from ${url}`);
        }
        const data = await response.json();
        this.configCache.set(url, data);
        return data;
      } catch (error) {
        console.error('Config load error:', error);
        return this.getPlaceholderConfig(url);
      }
    }
  }

  private getPlaceholderConfig(url: string): any {
    return { placeholder: true, url };
  }
}

export default ConfigManager;
