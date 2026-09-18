export interface IBoss {
  id: string;
  name: string;
  country: string;
  maxHealth: number;
  currentHealth?: number; // Optional, as it can be set in the constructor
  level: number;
  rewardMultiplier: number;
  state?: string; // Optional, as it can be set in the constructor
}
