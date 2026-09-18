/**
 * @module Main
 * Точка входа приложения (Entry Point). Драйвит жизненный цикл Application.
 */

import { createApp } from 'vue';
import App from './App.vue';
import { Application } from './Application';
import { GlobalLogger } from './core/Logger';

// Импортируем утилиты ядра (без ConfigManager) [см. контекст]
import { AssetManager, AudioManager, PlatformManager } from './core'; 

// Импортируем ConfigManager напрямую из его родной папки [см. контекст]
import ConfigManager from './config/ConfigManager'; 

// Создаем удобную функцию-помощник log, чтобы не переписывать код ниже
const log = (message: string) => GlobalLogger.info("Main", message);

async function main(): Promise<void> {
    try {
        log("Starting application bootstrapping process...");

        // 1. Регистрация картинок (Assets)
        log("Registering core game assets...");
        const assetManager = AssetManager.getInstance();
        assetManager.registerAsset('placeholder-image', 'path/to/placeholder/image.png');

        // 2. Регистрация и запуск звуков (Audio)
        log("Initializing audio system...");
        const audioManager = AudioManager.getInstance();
        audioManager.registerSound('placeholder-sound', 'path/to/placeholder/audio.mp3');
        audioManager.playSound('placeholder-sound');

        // 3. Загрузка конфигурации (Обходим строгую проверку типов через as any)
        log("Initializing config system...");
        const configManager = (ConfigManager as any).getInstance(); 
        const config = await configManager.loadConfig('/config/balance.json');
        console.log('Loaded config:', config);

        // 4. Настройка платформенных утилит (Mobile, Orientation)
        log("Initializing Platform system...");
        const platformManager = PlatformManager.getInstance();
        console.log('Is Mobile:', platformManager.isMobile());
        console.log('Orientation:', platformManager.getOrientation());

        platformManager.onWindowResize(() => {
            console.log('Window resized');
        });

        platformManager.onVisibilityChange(() => {
            console.log('Visibility change detected');
        });

        // 5. Создание и инициализация логического движка игры
        const app = new Application();
        log("Application instance created successfully.");

        await app.initialize(); // Ждем завершения создания CombatManager и босса [см. контекст]
        log("Application lifecycle phase: Initialize completed successfully.");

        app.start();
        log("Application lifecycle phase: Start completed successfully.");

        // 6. Запуск визуального интерфейса на Vue 3
        log("Mounting Vue UI Layer...");
        createApp(App).mount('#app');

        log("Application running in main loop...");

    } catch (error) {
        console.error("FATAL ERROR during application bootstrap:", error);
    }
}

// Запуск приложения
main();
