export interface ShopItem {
  id: string;
  name: string;
  sub: string;
  category: 'boosts' | 'click' | 'income' | 'weapon' | 'prestige';
  level: number;
  maxLevel?: number;
  cost: number;
  costType: 'money' | 'diamonds' | 'rubles';
  adCost?: number;
  effectText: string;
  col: number; 
  row: number; 
}

export const initialShopItems: ShopItem[] = [
  // РЯД 0: УСИЛЕНИЯ (BOOSTS) — Стоимость в АЛМАЗАХ
  { id: 'mult_x2', name: 'МНОЖИТЕЛЬ X2', sub: 'Удваивает текущие алмазы', category: 'boosts', level: 0, cost: 20, costType: 'diamonds', adCost: 2, effectText: 'x2 Алмазы', col: 0, row: 0 },
  { id: 'mult_x3', name: 'МНОЖИТЕЛЬ X3', sub: 'Утраивает алмазы за рекламу', category: 'boosts', level: 0, cost: 45, costType: 'diamonds', adCost: 3, effectText: 'x3 Алмазы', col: 1, row: 0 },
  { id: 'duration', name: 'ДЛИТЕЛЬНОСТЬ', sub: 'Бусты работают дольше', category: 'boosts', level: 1, cost: 15, costType: 'diamonds', adCost: 1, effectText: '+5 сек бустам', col: 2, row: 0 },
  { id: 'more_xp', name: 'БОЛЬШЕ ОПЫТА', sub: 'Ускоряет прохождение уровней', category: 'boosts', level: 1, cost: 25, costType: 'diamonds', adCost: 2, effectText: '+20% XP', col: 3, row: 0 },
  { id: 'more_rewards', name: 'БОЛЬШЕ НАГРАД', sub: 'Увеличивает дроп из сундуков', category: 'boosts', level: 1, cost: 35, costType: 'diamonds', adCost: 2, effectText: '+35% Награды', col: 4, row: 0 },

  // РЯД 1: КЛИК (CLICK) — Стоимость в ИГРОВЫХ ДОЛЛАРАХ
  { id: 'click_power', name: 'СИЛА КЛИКА', sub: 'Основной урон по купюре', category: 'click', level: 1, cost: 1000, costType: 'money', effectText: '+5 Урон', col: 0, row: 1 },
  { id: 'turbo_click', name: 'ТУРБО КЛИК', sub: 'Шанс активировать ярость', category: 'click', level: 0, cost: 5000, costType: 'money', effectText: '+2% Шанс', col: 1, row: 1 },
  { id: 'auto_click', name: 'АВТО КЛИК', sub: 'Помогает прожимать экран', category: 'click', level: 0, cost: 15000, costType: 'money', effectText: '1 клик/сек', col: 2, row: 1 },
  { id: 'crit_click', name: 'КРИТ КЛИК', sub: 'Множитель критического удара', category: 'click', level: 1, cost: 35000, costType: 'money', effectText: '+50% Крит', col: 3, row: 1 },
  { id: 'lightning_click', name: 'МОЛНИЯ КЛИКА', sub: 'Цепной урон по боссу', category: 'click', level: 0, cost: 75000, costType: 'money', effectText: '+150 Урон', col: 4, row: 1 },

  // РЯД 2: ДОХОД (INCOME) — Стоимость в ИГРОВЫХ ДОЛЛАРАХ
  { id: 'passive_income', name: 'ПАССИВНЫЙ ДОХОД', sub: 'Капает каждую секунду', category: 'income', level: 1, cost: 2500, costType: 'money', effectText: '+$50/сек', col: 0, row: 2 },
  { id: 'piggy_bank', name: 'КОПИЛКА', sub: 'Сохраняет золото при поражении', category: 'income', level: 1, cost: 12000, costType: 'money', effectText: '+10% Защита', col: 1, row: 2 },
  { id: 'investments', name: 'ИНВЕСТИЦИИ', sub: 'Растущий процент капитала', category: 'income', level: 1, cost: 60000, costType: 'money', effectText: '+5% Процент', col: 2, row: 2 },
  { id: 'business_income', name: 'БИЗНЕС ДОХОД', sub: 'Автоматические предприятия', category: 'income', level: 0, cost: 180000, costType: 'money', effectText: '+$1.2k/сек', col: 3, row: 2 },
  { id: 'printing_press', name: 'ПЕЧАТНЫЙ СТАНК', sub: 'Бесконечный поток наличности', category: 'income', level: 0, cost: 500000, costType: 'money', effectText: '+$5k/сек', col: 4, row: 2 },

  // РЯД 3: ОРУЖИЕ (WEAPON) — Стоимость в ИГРОВЫХ ДОЛЛАРАХ
  { id: 'minigun', name: 'ПУЛЕМЕТ', sub: 'Расстреливает ХП босса', category: 'weapon', level: 0, cost: 250000, costType: 'money', effectText: '100 DPS', col: 0, row: 3 },
  { id: 'rocket', name: 'РАКЕТА', sub: 'Взрывной урон по таймеру', category: 'weapon', level: 0, cost: 750000, costType: 'money', effectText: '500 DPS', col: 1, row: 3 },
  { id: 'drill', name: 'БУРОВАЯ УСТАНОВКА', sub: 'Вгрызается в щиты президента', category: 'weapon', level: 0, cost: 2000000, costType: 'money', effectText: '2k DPS', col: 2, row: 3 },
  { id: 'nuke', name: 'ЯДЕРНАЯ БОМБА', sub: 'Абсолютное уничтожение фаз', category: 'weapon', level: 0, cost: 10000000, costType: 'money', effectText: '15k DPS', col: 3, row: 3 },
  { id: 'drone', name: 'ДРОН ДОСТАВКИ', sub: 'Пассивно сбрасывает золото', category: 'weapon', level: 0, cost: 50000000, costType: 'money', effectText: '+$50k/сек', col: 4, row: 3 },

  // РЯД 4: ПРЕСТИЖ (PRESTIGE) — Стоимость в РУБЛЯХ
  { id: 'prestige_reset', name: 'ПРЕСТИЖ', sub: 'Сброс ради вечной короны', category: 'prestige', level: 0, cost: 100, costType: 'rubles', effectText: '+500% Клик', col: 0, row: 4 },
  { id: 'reputation', name: 'РЕПУТАЦИЯ', sub: 'Скидки во всех магазинах', category: 'prestige', level: 1, cost: 250, costType: 'rubles', effectText: '-5% Цены', col: 1, row: 4 },
  { id: 'infinity', name: 'БЕСКОНЕЧНОСТЬ', sub: 'Бесконечный буст таймера раунда', category: 'prestige', level: 0, cost: 500, costType: 'rubles', effectText: '+2 сек часам', col: 2, row: 4 },
  { id: 'heritage', name: 'НАСЛЕДИЕ', sub: 'Начальный капитал после сброса', category: 'prestige', level: 0, cost: 1000, costType: 'rubles', effectText: '+$10k Старт', col: 3, row: 4 },
  { id: 'global_empire', name: 'МИРОВОЕ ГОСПОДСТВО', sub: 'Ультимативный множитель всего', category: 'prestige', level: 0, cost: 5000, costType: 'rubles', effectText: 'x10 Золото', col: 4, row: 4 }
];
