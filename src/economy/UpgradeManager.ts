// src/economy/UpgradeManager.ts

import { EventBus } from '../core/EventBus';
import MoneyManager from './MoneyManager';

class UpgradeManager {
  private eventBus: EventBus;
  private moneyManager: MoneyManager;
  private upgrades: { [key: string]: number };

  constructor(eventBus: EventBus, moneyManager: MoneyManager) {
    this.eventBus = eventBus;
    this.moneyManager = moneyManager;
    this.upgrades = {
      business: 0,
    };

    // Подписываемся на событие PurchaseUpgrade
    this.eventBus.on('PurchaseUpgrade', (data) => {
      this.handlePurchaseUpgrade(data);
    });
  }

  public getUpgradeLevel(upgradeType: string): number {
    return this.upgrades[upgradeType] || 0;
  }

  private getUpgradeCost(upgradeType: string, level: number): number {
    const baseCost = 25; // Значение для первого апгрейда
    const costMultiplier = 1.15;
    return baseCost * Math.pow(costMultiplier, level);
  }

  private handlePurchaseUpgrade(data: { upgradeType: string }): void {
    const { upgradeType } = data;
    const currentLevel = this.getUpgradeLevel(upgradeType);
    const cost = this.getUpgradeCost(upgradeType, currentLevel);

    if (this.moneyManager.getBalance() >= cost) {
      this.moneyManager.decreaseBalance(cost);
      this.upgrades[upgradeType] += 1;
      this.eventBus.emit('UpgradePurchased', { upgradeType, newLevel: currentLevel + 1 });
    } else {
      console.error('Not enough money to purchase upgrade');
    }
  }
}

export default UpgradeManager;
