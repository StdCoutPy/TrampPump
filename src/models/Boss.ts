import { IBoss } from './IBoss';

class Boss implements IBoss {
  public id: string;
  public name: string;
  public country: string;
  public maxHealth: number;
  public currentHealth: number;
  public level: number;
  public rewardMultiplier: number;
  public state: string;

  constructor(config: IBoss) {
    this.id = config.id;
    this.name = config.name;
    this.country = config.country;
    this.maxHealth = config.maxHealth;
    this.currentHealth = config.maxHealth; // Initial health is max health
    this.level = config.level;
    this.rewardMultiplier = config.rewardMultiplier;
    this.state = 'Idle'; // Default state
  }
}

export default Boss;
