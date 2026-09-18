/**
 * @module SceneId
 * Идентификаторы сцен.
 */

export const SceneId = {
    TEST_SCENE: 'TEST_SCENE',
} as const;

type SceneKey = keyof typeof SceneId;
export type SceneIdType = (typeof SceneId)[SceneKey];
