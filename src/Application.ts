/**
 * @module Application
 * Главный класс логического движка игры. Управляет стадиями жизненного цикла приложения.
 */

import { BootstrapPipeline } from './bootstrap/BootstrapPipeline';
import BossManager from './managers/BossManager';
import PlaceholderBoss from './data/PlaceholderBoss';

export class Application {
    constructor() {
        // Конструктор класса
    }

    /**
     * Асинхронная инициализация всех систем игры.
     * Вызывается один раз при старте приложения.
     */
    public async initialize(): Promise<void> {
        try {
            console.log("🎮 Application: Starting core initialization pipeline...");

            // 1. Запускаем весь конвейер инициализации сервисов, шины событий и менеджеров
            await BootstrapPipeline.initialize();
            console.log("🎮 Application: Bootstrap pipeline finished successfully.");
            
            // 2. СРАЗУ ЗАГРУЖАЕМ БОССА В ПАМЯТЬ, чтобы боевой системе было кого атаковать
            if (PlaceholderBoss && PlaceholderBoss.id) {
                BossManager.loadBoss(PlaceholderBoss.id);
                console.log(`🎮 Application: Default boss '${PlaceholderBoss.name}' requested to load.`);
            } else {
                console.error("🎮 Application Error: PlaceholderBoss data is corrupted or missing ID.");
            }
            
            // 3. Устанавливаем ему начальное здоровье, если оно не выставилось автоматически
            const activeBoss = BossManager.getActiveBoss();
            if (activeBoss) {
                activeBoss.currentHealth = BossManager.getActiveBoss()?.currentHealth ?? 500;
                console.log(`🎮 Application: Active boss verified. Health set to ${activeBoss.currentHealth}/${activeBoss.maxHealth}`);
            } else {
                console.warn("🎮 Application Warning: Active boss not found in memory right after loading.");
            }

        } catch (error) {
            console.error("❌ Application Critical Error during initialize phase:", error);
            throw error; // Пробрасываем ошибку выше, чтобы сработал FATAL ERROR в main.ts
        }
    }

    /**
     * Запуск основных игровых циклов после успешной инициализации.
     */
    public start(): void {
        console.log("🎮 Игровой движок успешно запущен и полностью готов к кликам!");
    }

    /**
     * Очистка ресурсов при закрытии или перезагрузке приложения.
     */
    public destroy(): void {
        console.log("🎮 Application: Core engine destroyed and cleaned up.");
    }
}
