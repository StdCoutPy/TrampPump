import { IBoss } from '../models/IBoss';
import BossRegistry from './BossRegistry';
import DifficultyManager from './DifficultyManager';
//import RewardPipeline from './RewardPipeline';

class ProgressionManager {
  private static currentBossIndex: number = -1;
// private static countries: string[] = ['Country 1', 'Country 2', 'Country 3']; // Add more countries as needed

  public static getNextBossConfig(): IBoss | null {
    this.currentBossIndex++;
    if (this.currentBossIndex < BossRegistry.getAllBosses().size) {
      const bossId = Array.from(BossRegistry.getAllBosses().keys())[this.currentBossIndex];
      const bossConfig = BossRegistry.getBossById(bossId);
      if (bossConfig) {
        const difficultyData = DifficultyManager.calculateDifficulty(bossConfig.level);
        const adjustedBossConfig: IBoss = {
          ...bossConfig,
          maxHealth: difficultyData.health,
          rewardMultiplier: difficultyData.multiplier
        };
        return adjustedBossConfig;
      }
    }
    return null;
  }

  public static resetProgression(): void {
    this.currentBossIndex = -1;
  }
}

export default ProgressionManager;
