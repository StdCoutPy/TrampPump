/**
 * @module LocalStorageProvider
 * Реализация провайдера сохранений через localStorage.
 */

import ISaveProvider from './ISaveProvider';
import SaveData from './SaveData';
import { SaveVersion } from './SaveVersion';

class LocalStorageProvider implements ISaveProvider {
    private static SAVE_KEY = 'game-save';

    public save(data: SaveData): void {
        const serialized = JSON.stringify({ version: data.version, data: data.data });
        localStorage.setItem(LocalStorageProvider.SAVE_KEY, serialized);
    }

    public load(): SaveData | null {
        const saved = localStorage.getItem(LocalStorageProvider.SAVE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved) as SaveData;
                return { version: parsed.version, data: parsed.data };
            } catch (error) {
                console.error('Failed to parse saved data:', error);
            }
        }
        return null;
    }

    public delete(): void {
        localStorage.removeItem(LocalStorageProvider.SAVE_KEY);
    }

    public has(): boolean {
        return !!localStorage.getItem(LocalStorageProvider.SAVE_KEY);
    }

    public getVersion(): SaveVersion | null {
        const saved = localStorage.getItem(LocalStorageProvider.SAVE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved) as SaveData;
                return parsed.version as SaveVersion;
            } catch (error) {
                console.error('Failed to parse saved data:', error);
            }
        }
        return null;
    }
}

export default LocalStorageProvider;
