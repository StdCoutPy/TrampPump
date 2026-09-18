// src/economy/PrestigeManager.ts

import { EventBus } from '../core/EventBus';
import MoneyManager from './MoneyManager';

class PrestigeManager {
  private eventBus: EventBus;
  //private moneyManager: MoneyManager;
  private totalMoney: number;

  constructor(eventBus: EventBus, moneyManager: MoneyManager) {
    this.eventBus = eventBus;
    //this.moneyManager = moneyManager;
    this.totalMoney = 0;

    // Подписываемся на событие PrestigeRequest
    this.eventBus.on('PrestigeRequest', () => {
      this.handlePrestigeRequest();
    });
  }

  public getPrestigeCurrency(): number {
    return Math.floor(100 * Math.sqrt(this.totalMoney / 1e9));
  }

  private handlePrestigeRequest(): void {
    const prestigeCurrency = this.getPrestigeCurrency();
    if (prestigeCurrency > 0) {
      this.eventBus.emit('PrestigeCompleted', { prestigeCurrency });
    } else {
      console.error('Not enough money to achieve Prestige');
    }
  }

  private checkPrestigeAvailability(): boolean {
    const prestigeCurrency = this.getPrestigeCurrency();
    return prestigeCurrency > 0;
  }

  public checkAndPublishPrestigeAvailability(): void {
    const isAvailable = this.checkPrestigeAvailability();
    if (isAvailable) {
      this.eventBus.emit('PrestigeAvailable', { isAvailable });
    }
  }

  public updateTotalMoney(totalMoney: number): void {
    this.totalMoney = totalMoney;
    this.checkAndPublishPrestigeAvailability();
  }
}

export default PrestigeManager;
