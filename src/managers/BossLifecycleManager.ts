// Разделяем импорты: класс забираем из файла Boss, а интерфейс — из файла IBoss
import { type IBoss } from '../models/IBoss'; 
import EventBus from '../core/EventBus';
import BossManager from './BossManager';
import BossFactory from '../factories/BossFactory';
import Progression from '../managers/Progression';
import RewardPipeline from './RewardPipeline'; // Импортируем класс напрямую

class BossLifecycleManager {
  private isTransitioning = false; // Flag to prevent double defeat processing

  constructor() {
    EventBus.staticOn('bossHealthChanged', this.handleBossHealthChange.bind(this));
    EventBus.staticOn('bossDefeated', this.handleBossDefeat.bind(this));
  }

  private handleBossHealthChange(data: { id: string, health: number }): void {
    const activeBoss = BossManager.getActiveBoss();
    if (activeBoss && activeBoss.id === data.id) {
      // Ignore further inputs if transition phase has started
      if (this.isTransitioning) return; 

      if (data.health <= 0) {
        this.handleBossDefeat(activeBoss);
      }
    }
  }

  private handleBossDefeat(defeatedBoss: IBoss): void {
    // Guard against multiple defeat triggers
    if (this.isTransitioning) return;

    // Mark transition started immediately to block further combat inputs/ticks
    this.isTransitioning = true;

    // 1. Calculate and grant rewards before proceeding to the next stage.
    RewardPipeline.calculateAndGrantRewards(defeatedBoss);

    // 2. Signal defeat (allows systems to log/react)
    EventBus.staticEmit('bossDefeated', defeatedBoss);

    // 3. Initiate transition to the next boss/stage.
    this.loadNextBoss();
  }

  private async loadNextBoss(): Promise<void> {
    // Unload current boss instance before creating a new one.
    BossManager.unloadBoss(); 

    // Progression fetches the configuration for the next stage/boss
    const nextBossConfig = Progression.getNextBossConfig();
    if (nextBossConfig) {
      // BossFactory handles scaling, HP restoration, and instantiation based on config.
      const newBoss = BossFactory.createBoss(nextBossConfig as any); 

      // Load and activate the new boss instance
      BossManager.loadBoss(newBoss.id);

      // Signal successful transition and new boss appearance (Requirement #8)
      EventBus.staticEmit('bossSpawned', newBoss); 

      // Signal UI transition (Stage, Name, etc.)
      EventBus.staticEmit('bossChanged', { oldId: null, newId: newBoss.id });

      // Combat is live with the new boss, clear transition flag
      this.isTransitioning = false; 
    } else {
      console.log('No more bosses available.');
      // If no next boss, reset flag to allow the game loop to restart cleanly
      this.isTransitioning = false; 
    }
  }
}

export default new BossLifecycleManager();