/**
 * @module SaveManager
 * Управление сохранением и загрузкой данных.
 */

import ISaveProvider from './ISaveProvider';
import SaveData from './SaveData';
import {SaveVersion} from './SaveVersion';
import LocalStorageProvider from './LocalStorageProvider'

class SaveManager {
    private saveProvider: ISaveProvider;
    private static instance: SaveManager;

    constructor(saveProvider: ISaveProvider) {
        this.saveProvider = saveProvider;
    }

    public static getInstance(saveProvider: ISaveProvider): SaveManager {
        if (!SaveManager.instance) {
            SaveManager.instance = new SaveManager(saveProvider);
        }
        return SaveManager.instance;
    }

    public saveData(data: SaveData): void {
        try {
            this.saveProvider.save(data);
        } catch (error) {
            console.error('Failed to save data:', error);
        }
    }

    public loadData(): SaveData | null {
        try {
            return this.saveProvider.load();
        } catch (error) {
            console.error('Failed to load data:', error);
            return null;
        }
    }

    public deleteSave(): void {
        try {
            this.saveProvider.delete();
        } catch (error) {
            console.error('Failed to delete save:', error);
        }
    }

    public hasSave(): boolean {
        try {
            return this.saveProvider.has();
        } catch (error) {
            console.error('Failed to check save existence:', error);
            return false;
        }
    }

    public getSaveVersion(): SaveVersion | null {
        try {
            return this.saveProvider.getVersion();
        } catch (error) {
            console.error('Failed to get save version:', error);
            return null;
        }
    }
}

export default SaveManager.getInstance(new LocalStorageProvider());
