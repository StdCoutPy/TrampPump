/**
 * @module GamePlay
 * Менеджер управления, отвечающий за обработку ввода от пользователя.
 */
import { EventBus } from '../core/EventBus'; // Импортируем класс для типа данных

export default class InputManager {
    // Явно указываем типы для наших слушателей событий
    private mouseDownListener!: (event: MouseEvent) => void;
    private mouseUpListener!: (event: MouseEvent) => void;
    private touchStartListener!: (event: TouchEvent) => void;
    private touchEndListener!: (event: TouchEvent) => void;

    constructor(private eventBus: EventBus) {
        // Конструктор класса
    }

    /**
     * Инициализация логики ввода и добавление слушателей событий мыши и касаний.
     */
    public initialize(): void {
        this.mouseDownListener = (event: MouseEvent) => {
            this.handleInput(event.clientX, event.clientY);
        };

        this.mouseUpListener = (event: MouseEvent) => {
            // Сюда добавится логика отпускания кнопки
        };

        this.touchStartListener = (event: TouchEvent) => {
            if (event.touches.length > 0) {
                const touch = event.touches[0];
                this.handleInput(touch.clientX, touch.clientY);
            }
        };

        this.touchEndListener = (event: TouchEvent) => {
            // Сюда добавится логика завершения касания
        };

        window.addEventListener('mousedown', this.mouseDownListener);
        window.addEventListener('mouseup', this.mouseUpListener);
        window.addEventListener('touchstart', this.touchStartListener);
        window.addEventListener('touchend', this.touchEndListener);
    }

    /**
     * Обработка ввода и публикация события через Event Bus.
     * @param x Координата X клика/тапа
     * @param y Координата Y клика/тапа
     */
    private handleInput(x: number, y: number): void {
        this.eventBus.emit('user_input', { x, y });
    }

    /**
     * Очистка ресурсов при уничтожении менеджера, чтобы не было утечек памяти.
     */
    public destroy(): void {
        if (this.mouseDownListener) {
            window.removeEventListener('mousedown', this.mouseDownListener);
        }

        if (this.mouseUpListener) {
            window.removeEventListener('mouseup', this.mouseUpListener);
        }

        if (this.touchStartListener) {
            window.removeEventListener('touchstart', this.touchStartListener);
        }

        if (this.touchEndListener) {
            window.removeEventListener('touchend', this.touchEndListener);
        }
    }
}
