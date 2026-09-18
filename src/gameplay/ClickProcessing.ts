/**
 * @module GamePlay
 * Система обработки нажатий, отвечающая за валидацию и публикацию игрового события "валидный удар".
 */
import { EventBus } from '../core/EventBus';

interface UserInput {
    x: number;
    y: number;
}

export default class ClickProcessing {
    constructor(private eventBus: EventBus) {
        // Подписываемся на события Input System
        this.eventBus.on('user_input', this.handleUserInput.bind(this));
    }

    /**
     * Обработка входных данных и валидация события.
     * @param inputData Координаты клика/тапа
     */
    private handleUserInput(inputData: UserInput): void {
        // Валидация координат
        if (this.isValidInput(inputData)) {
            this.publishValidClick(inputData);
        }
    }

    /**
     * Проверка корректности координат.
     * @param inputData Координаты клика/тапа
     * @returns Валидность координат
     */
    private isValidInput(inputData: UserInput): boolean {
        // Пример валидации: координаты должны быть положительными числами
        return inputData.x >= 0 && inputData.y >= 0;
    }

    /**
     * Публикация события ValidClick через Event Bus.
     * @param inputData Координаты клика/тапа
     */
    private publishValidClick(inputData: UserInput): void {
        this.eventBus.emit('valid_click', inputData);
    }
}
