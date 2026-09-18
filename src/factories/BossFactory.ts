import IBoss  from '../models/Boss';
import Boss from '../models/Boss'; 

class BossFactory {
  public static createBoss(config: IBoss): IBoss {
    return new Boss(config);
  }
}

export default BossFactory;
