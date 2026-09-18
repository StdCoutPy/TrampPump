/**
 * @module AppConfig
 * Строгая типизация для всех настроек приложения. Единый контракт данных.
 */

/**
 * Общие настройки для ядра и его компонентов.
 */
export interface CoreSettings {
    // Настройки логирования: минимальный уровень, который будет обрабатываться ядром.
    minLogLevel: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'; 
    // Идентификатор модуля, которому принадлежит это приложение.
    applicationPrefix: string; 
}

/**
 * Настройки для аудиосистемы.
 */
export interface AudioSettings {
    masterVolume: number; // от 0.0 до 1.0
    sfxVolume: number;
}

/**
 * Полный объект конфигурации приложения.
 */
export default interface AppConfig {
    core: CoreSettings;
    audio: AudioSettings;
    // Здесь будут добавляться другие секции, такие как network, graphics и т.д.
}

/**
 * Возвращает текущую, встроенную тестовую конфигурацию. 
 * В будущем эта функция будет заменена на загрузку из файла или сети.
 */
export function getEmbeddedDefaultConfig(): AppConfig {
    return {
        core: {
            minLogLevel: 'DEBUG',
            applicationPrefix: "MyApp"
        },
        audio: {
            masterVolume: 1.0,
            sfxVolume: 0.8
        }
    };
}
