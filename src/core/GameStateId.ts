/**
 * @module GameStateId
 * Идентификаторы игровых состояний.
 */

export const GameStateId = {
    TEST_STATE: 'TEST_STATE',
} as const;

type StateKey = keyof typeof GameStateId;
export type GameStateIdType = (typeof GameStateId)[StateKey];
