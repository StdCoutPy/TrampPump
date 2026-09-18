/**
 * @module ISaveProvider
 * Интерфейс для провайдера сохранений.
 */

export interface SaveData {
    version: number;
    data: any;
}

export enum SaveVersion {
    V1 = 1,
}

export default interface ISaveProvider {
    save(data: SaveData): void;
    load(): SaveData | null;
    delete(): void;
    has(): boolean;
    getVersion(): SaveVersion | null;
}
