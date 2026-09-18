export interface RandomEventConfig {
  type: 'dollar' | 'dynamite' | 'lightning' | 'chest' | 'gold_coin' | 'critical' | 'fake_heal' | 'fake_steal';
  name: string;
  icon: string;
  color: string;
  weight: number;
  col: number; 
  row: number; 
}

export const randomEventsPool: RandomEventConfig[] = [
  { type: 'dollar', name: 'Dollar', icon: '💰', color: '#4caf50',weight: 18, col: 4, row: 2 },
  { type: 'dynamite', name: 'Dynamite', icon: '💣', color: '#f44336', weight: 8, col: 1, row: 2 }, // ИСПРАВЛЕНО: Бомба с черепом
  { type: 'chest', name: 'Chest', icon: '🎁', color: '#ff9800',  weight: 5, col: 3, row: 2},     // ИСПРАВЛЕНО: Подарок-сундук
  { type: 'lightning', name: 'Lightning', icon: '⚡', color: '#ffeb3b', weight: 8, col: 2, row: 2  },
  { type: 'gold_coin', name: 'Golden Coin', icon: '⭐', color: '#e91e63',  weight: 8, col: 0, row: 1 }, // ИСПРАВЛЕНО: Золотая монета
  { type: 'critical', name: 'Critical Event', icon: '💥', color: '#9c27b0',weight: 8, col: 1, row: 0   },
  
  // ЛОВУШКИ (ХАРДКОР)
  { type: 'fake_heal', name: 'Fake Heal', icon: '➕', color: '#2e7d32', weight: 18, col: 3, row: 1 }, // Медицинский плюс
  { type: 'fake_steal', name: 'Fake Steal', icon: '🎒', color: '#c62828', weight: 18, col: 4, row: 1} // ИСПРАВЛЕНО: Мешок с деньгами
];
