import IBoss  from '../models/Boss';

class BossRegistry {
  private static bosses: Map<string, IBoss> = new Map();

  public static registerBoss(bossId: string, bossData: IBoss): void {
    BossRegistry.bosses.set(bossId, bossData);
  }

  public static getBossById(bossId: string): IBoss | undefined {
    return BossRegistry.bosses.get(bossId);
  }

  public static getAllBosses(): Map<string, IBoss> {
    return new Map(BossRegistry.bosses);
  }
}

export default BossRegistry;
