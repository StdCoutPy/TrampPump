/**
 * @module GamePlay
 * Система обработки нанесения урона, отвечающая за формирование события DamageRequest.
 */
import { EventBus } from '../core/EventBus';

interface ValidClick {
    x: number;
    y: number;
}

interface DamageRequest {
    source: string;
    damageType: string;
    targetX: number;
    targetY: number;
}

export default class DamagePipeline {
    constructor(private eventBus: EventBus) {
        // Подписываемся на события Damagе
        this.eventBus.on('valid_click', this.handleValidClick.bind(this));
    }

    /**
     * Обработка события ValidClick и формирование DamageRequest.
     * @param validClick Координаты клика/тапа
     */
    private handleValidClick(validClick: ValidClick): void {
        const damageRequest: DamageRequest = {
            source: 'Player',
            damageType: 'BasicAttack',
            targetX: validClick.x,
            targetY: validClick.y
        };

        this.publishDamageRequest(damageRequest);
    }

    /**
     * Публикация события DamageRequest через Event Bus.
     * @param damageRequest Запрос на нанесение урона
     */
    private publishDamageRequest(damageRequest: DamageRequest): void {
        this.eventBus.emit('damage_request', damageRequest);
    }
}
