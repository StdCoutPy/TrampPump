/**
 * @module Logger
 * Централизованная система логирования проекта. Отвечает за приём, фильтрацию и вывод всех системных сообщений.
 */

import { LogLevel } from './LogLevel';

/**
 * Конфигурационный объект, который контролирует глобальные настройки логирования.
 */
export interface LoggerConfig {
    /** Минимальный уровень сообщения, который будет выведен. Все менее значимые сообщения игнорируются. */
    minLevel: LogLevel;
    /** Префикс, добавляемый к каждой записи лога (например, название мода или службы). */
    applicationPrefix: string;
}

/**
 * Класс Logger представляет собой главный фасад для всех систем проекта. Он принимает сообщения, фильтрует их по уровню и отправляет в "Синкинг" (Sink) для физического вывода.
 * Это обеспечивает высокий уровень изоляции и готовность к смене бэкенда логгирования.
 */
export default class Logger {
    private static instance: Logger;
    private readonly config: LoggerConfig;

    /**
     * Приватный конструктор класса. Используется паттерном Singleton для обеспечения единственного центра контроля логирования.
     * @param initialConfig Конфигурация приложения, полученная от инициализатора.
     */
    private constructor(initialConfig: LoggerConfig) {
        this.config = initialConfig;
    }

    /**
     * Статический метод для получения единственного экземпляра Logger.
     * Всегда должен использоваться этот метод для доступа к системе логирования.
     */
    public static getInstance(config: LoggerConfig): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger(config);
        } else if (JSON.stringify(Logger.instance?.config) !== JSON.stringify(config)) {
             // Внимание: Если вызвали getInstance с разными конфигами, может возникнуть логический баг.
            console.error("Attempted to change Logger configuration after initialization.");
        }
        return Logger.instance;
    }

    /**
     * Основная внутренняя методика, которая обрабатывает сообщение перед его выводом.
     * @private
     */
    private writeLog(level: LogLevel, category: string, message: string): void {
        if (LogLevel[level] < LogLevel[this.config.minLevel]) {
            // Отбрасываем сообщения, которые ниже минимально требуемого уровня.
            return;
        }

        // Создаем единый и информативный формат сообщения.
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${category}][LEVEL_${LogLevel[level] || 'INFO'}]: ${message}`;
        
        // Здесь должна быть интеграция с внешним I/O драйвером (Sink). 
        // В данной фазе имитируем вывод в консоль, но через строго контролируемый метод.
        this.flushToSink(logMessage); 
    }

    /**
     * Имитирует отправку обработанного лога во внешнюю систему (консоль, файл, сетевой сервис).
     * Этот метод полностью изолирован от остальной логики приложения.
     */
    private flushToSink(logMessage: string): void {
        // В целях разработки и PoC используем консоль, но в Production эта ветка уйдет на бэкенд.
        console.log(`>>>> CORE OUTPUT: ${logMessage}`);
    }

    // --- Публичный фасад для всех частей приложения (Category: 'Core') ---

    /**
     * Уровень Трейс. Максимальная детализация, полезно при отладке самых мелких движений кода.
     */
    public trace(category: string, message: string): void {
        this.writeLog(LogLevel.Trace, category, message);
    }

    /**
     * Уровень Дебаг. Подробная информация о выполнении кода, часто используется разработчиками ядра.
     */
    public debug(category: string, message: string): void {
        this.writeLog(LogLevel.Debug, category, message);
    }

    /**
     * Уровень Инфо. Подтверждение нормального хода выполнения приложения. Используется для отслеживания ключевых событий жизненного цикла.
     */
    public info(category: string, message: string): void {
        this.writeLog(LogLevel.Info, category, message);
    }

    /**
     * Уровень Предупреждение. Неожиданное, но не критичное событие, требующее возможного вмешательства оператора.
     */
    public warn(category: string, message: string): void {
        this.writeLog(LogLevel.Warn, category, message);
    }

    /**
     * Уровень Ошибка. Критический инцидент, который повлиял на функциональность.
     */
    public error(category: string, message: string): void {
        this.writeLog(LogLevel.Error, category, message);
    }
}

/**
 * Глобальный фасад для удобного доступа в коде приложения. 
 * В будущем он будет просто возвращать экземпляр Logger, инициализированный в главном модуле.
 */
export const GlobalLogger = Logger.getInstance({
    minLevel: LogLevel.Debug, // Начинаем с Debug для отладки ядра
    applicationPrefix: "MyApp"
});
