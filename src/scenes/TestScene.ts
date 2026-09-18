/**
 * @module TestScene
 * Пример тестовой сцены.
 */

import BaseScene from '../core/BaseScene';

class TestScene extends BaseScene {
    public async initialize(): Promise<void> {
        console.log('TestScene initialized');
    }

    public async enter(): Promise<void> {
        console.log('TestScene entered');
    }

    public async exit(): Promise<void> {
        console.log('TestScene exited');
    }

    public destroy(): void {
        console.log('TestScene destroyed');
    }
}

export default new TestScene();
