/**
 * @module EventBus
 * Центральная система обмена событиями для всего проекта.
 */

type EventName = string;
type EventHandler = (...args: any[]) => void;

/**
 * Реализация EventBus в виде Singleton.
 */
export class EventBus {
    private static instance: EventBus;
    private events: Record<EventName, EventHandler[]>;

    private constructor() {
        this.events = {};
    }

    public static getInstance(): EventBus {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }

    public on(event: EventName, handler: EventHandler): void {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(handler);
    }

    public off(event: EventName, handler?: EventHandler): void {
        if (!this.events[event]) return;
        if (handler) {
            this.events[event] = this.events[event].filter(h => h !== handler);
        } else {
            delete this.events[event];
        }
    }

    public once(event: EventName, handler: EventHandler): void {
        const wrapper = (...args: any[]) => {
            this.off(event, wrapper);
            handler(...args);
        };
        this.on(event, wrapper);
    }

    public emit(event: EventName, ...args: any[]): void {
        if (!this.events[event]) return;
        this.events[event].forEach(handler => handler(...args));
    }

    // ======================================================
    // СТАТИЧЕСКИЕ ПРОВЕДНИКИ (Чтобы чужой код не ломал вашу игру)
    // ======================================================
    public static staticOn(event: string, callback: EventHandler): void {
        EventBus.getInstance().on(event, callback);
    }

    public static staticEmit(event: string, ...args: any[]): void {
        EventBus.getInstance().emit(event, ...args);
    }

    public static staticOff(event: string, callback: EventHandler): void {
        EventBus.getInstance().off(event, callback);
    }
}

export default EventBus;
