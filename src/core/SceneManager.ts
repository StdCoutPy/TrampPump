/**
 * @module SceneManager
 * Управление сценами.
 */

import Scene from './Scene';
import EventBus from '../core/EventBus';

class SceneManager {
    private scenes: Record<string, Scene>;
    private activeScene: string | null;

    constructor() {
        this.scenes = {};
        this.activeScene = null;
    }

    public register(id: string, scene: Scene): void {
        this.scenes[id] = scene;
    }

    public unregister(id: string): void {
        delete this.scenes[id];
        if (id === this.activeScene) {
            this.activeScene = null;
        }
    }

    public get(id: string): Scene | undefined {
        return this.scenes[id];
    }

    public async changeScene(newId: string): Promise<void> {
        if (this.activeScene) {
            const activeScene = this.get(this.activeScene);
            if (activeScene) {
                await activeScene.exit();
                activeScene.destroy();
            }
        }

        const newScene = this.get(newId);
        if (newScene) {
            await newScene.initialize();
            await newScene.enter();
            this.activeScene = newId;
            EventBus.getInstance().emit('sceneChanged', newId);
        } else {
            console.error(`Scene with id ${newId} not found`);
        }
    }
}

export default SceneManager;
