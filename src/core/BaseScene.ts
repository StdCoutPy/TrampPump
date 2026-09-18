/**
 * @module BaseScene
 * Базовый класс для сцен.
 */

import Scene from './Scene';

abstract class BaseScene implements Scene {
    public initialize(): void {}
    public enter(): void {}
    public exit(): void {}
    public destroy(): void {}
}

export default BaseScene;
