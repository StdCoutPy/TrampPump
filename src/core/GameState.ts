/**
 * @module GameState
 * Описание интерфейса для игрового состояния.
 */

export default interface GameState {
    initialize(): void;
    enter(): void;
    exit(): void;
    destroy(): void;
}
