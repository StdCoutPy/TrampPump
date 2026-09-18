import { type IBoss } from '../models/IBoss'; 

class Progression {
  private static bossConfigurations: IBoss[] = [
    // List of Boss configurations
    {
      id: 'boss1',
      name: 'Boss 1',
      country: 'Country 1',
      maxHealth: 100,
      level: 1,
      rewardMultiplier: 1.5,
    },
    {
      id: 'boss2',
      name: 'Boss 2',
      country: 'Country 2',
      maxHealth: 150,
      level: 2,
      rewardMultiplier: 1.8,
    },
    // Add more Boss configurations as needed
  ];

  private static currentBossIndex: number = -1;

  public static getNextBossConfig(): IBoss | null {
    this.currentBossIndex++;
    if (this.currentBossIndex < Progression.bossConfigurations.length) {
      return Progression.bossConfigurations[this.currentBossIndex];
    }
    return null;
  }

  public static resetProgression(): void {
    Progression.currentBossIndex = -1;
  }
}

export default Progression;
