import { EventBus } from '../../core/EventBus';
import UpgradeWindow from '../windows/UpgradeWindow.vue';
import PrestigeWindow from '../windows/PrestigeWindow.vue';
import SettingsWindow from '../windows/SettingsWindow.vue';
import PauseWindow from '../windows/PauseWindow.vue';
import ModalWindowBase from '../windows/ModalWindowBase.vue';

class UIManager {
    private screens: Map<string, any>;
    private eventBus: EventBus;

    constructor(eventBus: EventBus) {
        this.screens = new Map();
        this.eventBus = eventBus;
        
        // Временно выводим в консоль, чтобы убрать ошибку неиспользуемой переменной
        console.log('UIManager: EventBus подключен', this.eventBus);

        this.registerScreen('UpgradeWindow', new UpgradeWindow());
        this.registerScreen('PrestigeWindow', new PrestigeWindow());
        this.registerScreen('SettingsWindow', new SettingsWindow());
        this.registerScreen('PauseWindow', new PauseWindow());
        this.registerScreen('ModalWindowBase', new ModalWindowBase());
    }

    public initialize(): void {
        console.log('UIManager initialized');
    }

    public destroy(): void {
        this.screens.clear();
        console.log('UIManager destroyed');
    }

    public registerScreen(screenId: string, screen: any): void {
        if (this.screens.has(screenId)) {
            console.warn(`Screen with id ${screenId} already registered.`);
            return;
        }
        this.screens.set(screenId, screen);
        console.log(`Screen ${screenId} registered.`);
    }

    public unregisterScreen(screenId: string): void {
        if (!this.screens.has(screenId)) {
            console.warn(`Screen with id ${screenId} not found.`);
            return;
        }
        this.screens.delete(screenId);
        console.log(`Screen ${screenId} unregistered.`);
    }

    public getScreen(screenId: string): any | undefined {
        return this.screens.get(screenId);
    }
}

export default UIManager;
