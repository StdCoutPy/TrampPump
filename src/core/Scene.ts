/**
 * @module Scene
 * Описание интерфейса для сцены.
 */

export default interface Scene {
    initialize(): void;
    enter(): void;
    exit(): void;
    destroy(): void;
}
