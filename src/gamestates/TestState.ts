/**
 * @module TestState
 * Пример тестового состояния.
 */

import BaseGameState from '../core/BaseGameState';

class TestState extends BaseGameState {
    public async initialize(): Promise<void> {
        console.log('TestState initialized');
    }

    public async enter(): Promise<void> {
        console.log('TestState entered');
    }

    public async exit(): Promise<void> {
        console.log('TestState exited');
    }

    public destroy(): void {
        console.log('TestState destroyed');
    }
}

export default new TestState();
