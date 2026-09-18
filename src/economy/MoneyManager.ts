// src/economy/MoneyManager.ts

import { EventBus } from '../core/EventBus';

class MoneyManager {
  private balance: number;
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.balance = 0;
    this.eventBus = eventBus;
  }

  public getBalance(): number {
    return this.balance;
  }

  public increaseBalance(amount: number): void {
    if (amount < 0) {
      throw new Error('Amount must be positive');
    }
    this.balance += amount;
    this.eventBus.emit('moneyBalanceChanged', { newBalance: this.balance });
  }

  public decreaseBalance(amount: number): void {
    if (amount < 0) {
      throw new Error('Amount must be positive');
    }
    if (amount > this.balance) {
      throw new Error('Insufficient balance');
    }
    this.balance -= amount;
    this.eventBus.emit('moneyBalanceChanged', { newBalance: this.balance });
  }

  /**
   * Проверяет, хватает ли у игрока монет на покупку апгрейда
   * @param price Стоимость товара
   */
  public checkBalance(price: number): boolean {
    return this.balance >= price;
  }

}

export default MoneyManager;
