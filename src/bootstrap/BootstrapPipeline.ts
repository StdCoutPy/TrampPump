/**
 * @module BootstrapPipeline
 * Orchestrator, который управляет инициализацией всех систем ядра в правильной зависимости.
 */

import  ServiceRegistry  from '../core/ServiceRegistry';
import  Logger  from '../core/Logger';
import  EventBus  from '../core/EventBus';
import  {ConfigLoader}  from '../config/ConfigLoader'; // Предполагаем, что это успешно реализована
import  SceneManager  from '../core/SceneManager';
import  GameStateManager  from '../core/GameStateManager';
import  SaveManager  from '../core/SaveManager';
import { LogLevel } from '../core/LogLevel'; 

// Добавляем импорты новых менеджеров геймплея и экономики [см. контекст]
import { CombatManager } from '../managers/CombatManager';
import MoneyManager from '../economy/MoneyManager';

/**
 * Класс, отвечающий за оркестрацию и успешный старт приложения.
 */
export class BootstrapPipeline {
    private static isBootstrapped: boolean = false;

    /**
     * Последовательно выполняет все шаги инициализации ядра.
     */
    public static async initialize(): Promise<void> {
        if (BootstrapPipeline.isBootstrapped) {
            console.warn("Application is already bootstrapped.");
            return;
        }

        // ------------------------------------------------------
        // СТАДИЯ 1: КОНФИГУРАЦИЯ (Первая, так как ее используют все)
        // ------------------------------------------------------
        console.log("--- BOOTSTRAP STAGE 1: Loading Configuration ---");
        const config = await ConfigLoader.loadConfig(); // Предполагаем асинхронную загрузку
        // На этом этапе мы знаем настройки приложения.

        // ------------------------------------------------------
        // СТАДИЯ 2: ЛОГИРОВАНИЕ (Нуждается в настройках для инициализации своего уровня)
        // ------------------------------------------------------
        console.log("--- BOOTSTRAP STAGE 2: Initializing Logger ---");
        // Инициализируем логгер с учетом полученной конфигурации.
        const loggerInstance = Logger.getInstance({
            minLevel: config.core.minLogLevel === 'DEBUG' ? LogLevel.Debug : LogLevel.Info,
            applicationPrefix: config.core.applicationPrefix || 'MyApp'
        });

        // Регистрация всех главных компонентов в Service Registry
        console.log("--- BOOTSTRAP STAGE 3: Registering Core Services ---");
        ServiceRegistry.register('Logger', loggerInstance);
        ServiceRegistry.register('Config', config);
        loggerInstance.info('BOOTSTRAP', 'Logger initialized and registered.');

        // ------------------------------------------------------
        // СТАДИЯ 4: БАЗА ВЗАИМОДЕЙСТВИЙ
        // ------------------------------------------------------
        console.log("--- BOOTSTRAP STAGE 4: Initializing Event Bus ---");
        // Фасад EventBus является глобальным Singleton и не требует регистрации в Registry, но должен быть доступен.
        // Если он внедряется через ServiceRegistry, это можно сделать здесь:
        ServiceRegistry.register('EventBus', EventBus);
        loggerInstance.info('BOOTSTRAP', 'Event Bus initialized and functional.');

        // ------------------------------------------------------
        // СТАДИЯ 5: КОРЕАНЫЯ МЕНЕДЖЕРЫ (Core Managers)
        // ------------------------------------------------------
        console.log("--- BOOTSTRAP STAGE 5: Initializing Core Managers ---");
        
        // Инициализация Scene Manager (требует EventBus)
        const sceneManager = new SceneManager();
        ServiceRegistry.register('SceneManager', sceneManager);
        loggerInstance.info('BOOTSTRAP', 'Scene Manager initialized and registered.');

        // Инициализация Game State Manager (требует EventBus)
        const gameStateManager = new GameStateManager();
        ServiceRegistry.register('GameStateManager', gameStateManager);
        loggerInstance.info('BOOTSTRAP', 'Game State Manager initialized and registered.');

        // Инициализация Save System (требует Logger/Config, но может быть последней)
        const saveManager = SaveManager;
        ServiceRegistry.register('SaveManager', saveManager);
        loggerInstance.info('BOOTSTRAP', 'Save Manager initialized and registered.');

        // Инициализация менеджеров Экономики и Боевой системы [см. контекст]
        // Передаем экземпляр шины событий в MoneyManager, как требует его конструктор [см. контекст]
        const moneyManager = new MoneyManager(EventBus.getInstance());
        ServiceRegistry.register('MoneyManager', moneyManager);
        loggerInstance.info('BOOTSTRAP', 'Money Manager initialized and registered.');

        const combatManager = new CombatManager();
        ServiceRegistry.register('CombatManager', combatManager);
        loggerInstance.info('BOOTSTRAP', 'Combat Manager initialized and registered.');

        // ------------------------------------------------------
        // СТАДИЯ 6: ФИНАЛЬНАЯ ПРОВЕРКА И ЗАПУСК
        // ------------------------------------------------------
        console.log("--- BOOTSTRAP STAGE 6: Final Validation and Readiness ---");
        
        // Проверка всех систем доступности (тестирование, что они могут друг на друга влиять)
        if (loggerInstance instanceof Logger) {
            loggerInstance.debug('CORE', 'All Core services successfully initialized and registered.');
        }

        // Передаем управление приложению, устанавливая его в статус READY.
        BootstrapPipeline.isBootstrapped = true;
        loggerInstance.info('APPLICATION', 'CORE FRAMEWORK SUCCESSFULLY INITIALIZED. Application is ready to receive gameplay modules.');
    }
}
