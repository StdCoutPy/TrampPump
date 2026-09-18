import EventBus from '../core/EventBus';
import { IBoss } from '../models/IBoss';
// Импортируем экземпляры с маленькой буквы, чтобы соответствовать синглтон-структуре
import progressionManager from './ProgressionManager'; 
import rewardManager from '../economy/RewardManager'; 
import ServiceRegistry from '../core/ServiceRegistry'; 

/**
 * Orchestrates the post-combat sequence: calculation, reward granting, and progression.
 */
class RewardPipeline {
  /**
   * Public static method called by the BossLifecycleManager upon boss defeat.
   * This is the main orchestration point for all post-combat logic.
   * @param defeatedBoss The boss instance that reached 0 HP.
   */
  public static calculateAndGrantRewards(defeatedBoss: IBoss): void {
    // 1. Calculate rewards using the dedicated internal static method
    const reward = this.calculateReward(defeatedBoss);

    // 2. Grant money to the player
    const moneyManager = ServiceRegistry.get('MoneyManager');
    if (moneyManager) {
      moneyManager.increaseBalance(reward);
    }

    // 3. Handle Progression (Level up, tracking) via the singleton instance
    if (progressionManager && typeof (progressionManager as any).handlePostDefeat === 'function') {
      (progressionManager as any).handlePostDefeat(defeatedBoss);
    } else {
      // Запасной вариант на случай, если структура экспорта заложена как default property
      const altManager = (progressionManager as any).default || progressionManager;
      if (altManager && typeof altManager.handlePostDefeat === 'function') {
        altManager.handlePostDefeat(defeatedBoss);
      }
    }

    // 4. Emit events for UI/logging
    EventBus.staticEmit('rewardGranted', reward);
    EventBus.staticEmit('bossCompleted', defeatedBoss); 
    EventBus.staticEmit('nextBossRequested'); // Signal BossLifecycleManager to proceed
  }

  /**
   * Calculates a reward based on the defeated boss instance (delegates to RewardManager).
   */
  private static calculateReward(boss: IBoss): number {
    // Безопасный вызов метода расчета у синглтона с обходом строгой проверки типов класса
    if (rewardManager && typeof (rewardManager as any).calculateReward === 'function') {
      return (rewardManager as any).calculateReward(boss);
    } else {
      const altReward = (rewardManager as any).default || rewardManager;
      if (altReward && typeof altReward.calculateReward === 'function') {
        return altReward.calculateReward(boss);
      }
    }
    return 0;
  }
}

// Экспортируем САМ КЛАСС, чтобы статический вызов в BossLifecycleManager работал идеально
export default RewardPipeline;
