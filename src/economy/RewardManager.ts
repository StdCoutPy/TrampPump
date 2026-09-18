// src/economy/RewardManager.ts

import { EventBus } from '../core/EventBus';
import MoneyManager from './MoneyManager';

class RewardManager {
  private eventBus: EventBus;
  private moneyManager: MoneyManager;

  constructor(eventBus: EventBus, moneyManager: MoneyManager) {
    this.eventBus = eventBus;
    this.moneyManager = moneyManager;

    this.eventBus.on('RewardRequest', (data) => {
      this.handleRewardRequest(data);
    });
  }

  private handleRewardRequest(data: { rewardType: string; quantity: number }): void {
    const totalReward = this.calculateReward(data.rewardType, data.quantity);
    this.moneyManager.increaseBalance(totalReward);
    this.eventBus.emit('MoneyChanged', { newBalance: this.moneyManager.getBalance() });
  }

  private calculateReward(rewardType: string, quantity: number): number {
    // Пример таблицы наград (дополнить по необходимости)
    const rewardTables = {
      small: 10,
      medium: 50,
      large: 200,
    };

      // Говорим TypeScript, что rewardType — это гарантированный ключ нашего объекта
    const rewardValue = rewardTables[rewardType as keyof typeof rewardTables] || 0;
    return rewardValue * quantity;
  }
}

export default RewardManager;
