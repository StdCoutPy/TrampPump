/**
 * @module BaseGameState
 * Базовый класс для игровых состояний.
 */

import GameState from './GameState';

abstract class BaseGameState implements GameState {
    public initialize(): void {}
    public enter(): void {}
    public exit(): void {}
    public destroy(): void {}
}

export default BaseGameState;
