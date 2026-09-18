/**
 * @module BossManager
 * Менеджер, отвечающий за хранение, загрузку и выгрузку текущего активного босса в игре.
 */

import { type IBoss } from '../models/IBoss';
import BossRegistry from './BossRegistry';
import BossFactory from '../factories/BossFactory';

export default class BossManager {
    // Делаем свойство статическим, так как вы вызываете методы напрямую у класса: BossManager.getActiveBoss()
    private static activeBoss: IBoss | null = null;

    /**
     * Возвращает текущего активного босса из памяти.
     */
    public static getActiveBoss(): IBoss | null {
        return this.activeBoss;
    }

    /**
     * Загружает босса в память по его идентификатору.
     */
    public static loadBoss(bossId: string): void {
        console.log(`[BossManager] Попытка загрузить босса с ID: ${bossId}`);
        
        // 1. Пытаемся найти шаблон босса в реестре регистрации
        // Замените строчку с ошибкой на этот вариант:
        const bossConfig = (BossRegistry as any).getBoss ? (BossRegistry as any).getBoss(bossId) : null;
        
        if (bossConfig) {
            // 2. С помощью фабрики создаем живой объект босса
            this.activeBoss = BossFactory.createBoss(bossConfig);
            
            // Гарантируем, что здоровье при загрузке заполнено на максимум
            if (this.activeBoss) {
                this.activeBoss.currentHealth = this.activeBoss.maxHealth;
            }
            console.log(`[BossManager] Босс '${this.activeBoss?.name}' успешно загружен в оперативную память!`);
        } else {
            // Если в реестре пусто, создаем босса напрямую из переданного ID в качестве защиты
            console.warn(`[BossManager] Предупреждение: Босс с ID '${bossId}' не найден в реестре. Создаем заглушку.`);
            this.activeBoss = {
                id: bossId,
                name: 'Генеральный Босс',
                country: 'Core',
                maxHealth: 100,
                currentHealth: 500,
                level: 1,
                rewardMultiplier: 1.0,
                state: 'Idle'
            };
        }
    }

    /**
     * Выгружает текущего босса из памяти.
     */
    public static unloadBoss(): void {
        console.log(`[BossManager] Босс '${this.activeBoss?.name}' выгружен из памяти.`);
        this.activeBoss = null;
    }
}
