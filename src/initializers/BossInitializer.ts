import BossRegistry from '../managers/BossRegistry';
import PlaceholderBoss  from '../data/PlaceholderBoss';

class BossInitializer {
  public static initialize(): void {
    // Приводим PlaceholderBoss к типу any, чтобы обойти строгое ограничение типов
    const boss = PlaceholderBoss as any;
    BossRegistry.registerBoss(boss.id, boss);
  }
}
export default BossInitializer;
