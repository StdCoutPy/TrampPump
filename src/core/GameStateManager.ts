/**
 * @module GameStateManager
 * Управление игровыми состояниями.
 */

import GameState from './GameState';
import EventBus from '../core/EventBus';

class GameStateManager {
    private states: Record<string, GameState>;
    private currentState: string | null;

    constructor() {
        this.states = {};
        this.currentState = null;
    }

    public register(id: string, state: GameState): void {
        this.states[id] = state;
    }

    public unregister(id: string): void {
        delete this.states[id];
        if (id === this.currentState) {
            this.currentState = null;
        }
    }

    public get(id: string): GameState | undefined {
        return this.states[id];
    }

    public async changeState(newStateId: string): Promise<void> {
        if (this.currentState) {
            const currentState = this.get(this.currentState);
            if (currentState) {
                await currentState.exit();
                currentState.destroy();
            }
        }

        const newState = this.get(newStateId);
        if (newState) {
            await newState.initialize();
            await newState.enter();
            this.currentState = newStateId;
            EventBus.getInstance().emit('stateChanged', newStateId);
        } else {
            console.error(`State with id ${newStateId} not found`);
        }
    }

    public getCurrentState(): string | null {
        return this.currentState;
    }

    public isCurrentState(stateId: string): boolean {
        return this.currentState === stateId;
    }
}

export default GameStateManager;
