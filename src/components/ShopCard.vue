<template>
  <div class="shop-card-wrapper" :class="{ 'is-boost-card': item.category === 'boosts' }">
    <div class="card-main-info">
      
      <!-- ЮВЕЛИРНОЕ CSS ВЫРЕЗАНИЕ: Шаг сетки 46.5px при общем размере холста 234px уберет все черные полосы по краям -->
      <div 
        class="item-icon-box"
        :style="{
          backgroundImage: `url(${shopSpriteUrl})`,
          backgroundPositionX: `${(item.col * -46.5)+1.5}px`,
          backgroundPositionY: `${(item.row * -46.5)-1.5}px`
        }"
      ></div>

      <div class="item-text-details">
        <div class="item-name">{{ item.name }}</div>
        <div class="item-sub-effect">{{ item.sub }}</div>
        <div class="item-progress-stats" v-if="item.category !== 'boosts'">
          Ур. {{ item.level }}{{ item.maxLevel ? ' / ' + item.maxLevel : '' }} | <span class="increment-val">{{ item.effectText }}</span>
        </div>
        <div class="item-progress-stats" v-else>
          <span class="increment-val">{{ item.effectText }}</span>
        </div>
      </div>
    </div>

    <!-- КНОПКИ ПОКУПКИ С РЕАЛЬНОЙ СИНХРОНИЗАЦИЕЙ БАЛАНСА -->
    <div class="card-buy-actions">
      <button 
        class="buy-currency-btn" 
        :class="item.costType"
        :disabled="isMaxLevel || isWatchingAd"
        @click="$emit('buy-with-currency', item)"
      >
        <span v-if="isMaxLevel">МАКС. УРОВЕНЬ</span>
        <span v-else>
          <span class="currency-symbol">{{ getCurrencyIcon(item.costType) }}</span>
          {{ formatNumber(item.cost) }}
        </span>
      </button>

      <!-- ИНТЕРАКТИВНАЯ КНОПКА РЕКЛАМЫ С ЗАГРУЗКОЙ -->
      <button 
        v-if="item.adCost && !isMaxLevel" 
        class="buy-ad-btn"
        :disabled="isWatchingAd"
        @click="startAdPlayback"
      >
        <span v-if="isWatchingAd">🎬 ИДЕТ РОЛИК...</span>
        <span v-else>📺 СМОТРЕТЬ ({{ item.adCost }})</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import shopSpriteUrl from '@/assets/shop-spritesheets-2.png';

const props = defineProps({
  item: {
    type: Object as () => {
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
    },
    required: true
  }
});

const emit = defineEmits(['buy-with-currency', 'ad-watch-success']);

const isWatchingAd = ref(false);

const isMaxLevel = computed(() => {
  if (!props.item.maxLevel) return false;
  return props.item.level >= props.item.maxLevel;
});

const getCurrencyIcon = (type: string) => {
  if (type === 'money') return '💰';
  if (type === 'diamonds') return '💎';
  return '₽';
};

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
};

/**
 * Имитация 2-секундного рекламного ролика с последующей выдачей награды
 */
const startAdPlayback = () => {
  if (isWatchingAd.value) return;
  isWatchingAd.value = true;
  
  setTimeout(() => {
    isWatchingAd.value = false;
    emit('ad-watch-success', props.item);
  }, 2000); // Симуляция длины ролика 2 секунды
};
</script>

<style scoped>
.shop-card-wrapper {
  background: rgba(24, 24, 24, 0.95);
  border: 1px solid rgba(255, 235, 59, 0.15);
  border-radius: 16px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.6);
  box-sizing: border-box;
}

.is-boost-card {
  border-color: rgba(255, 152, 0, 0.25);
  background: linear-gradient(180deg, #222 0%, #141414 100%);
}

.card-main-info {
  display: flex;
  align-items: center;
  gap: 14px;
}

/* СУПЕР-ФИКС СЕТКИ: Иконка 54x54 пикселя идеально центрирует золотую рамку */
.item-icon-box {
  width: 49px;
  height: 49px;
  background-repeat: no-repeat;
  background-size: 234px 234px; 
  image-rendering: pixelated; 
  border-radius: 12px;
}

.item-text-details { display: flex; flex-direction: column; flex-grow: 1; }
.item-name { font-size: 0.88rem; font-weight: 900; color: #fff; letter-spacing: 0.5px; }
.item-sub-effect { font-size: 0.72rem; color: #aaa; margin-top: 1px; }
.item-progress-stats { font-size: 0.68rem; color: #777; margin-top: 5px; font-weight: bold; }
.increment-val { color: #ff9800; font-weight: 900; }

.card-buy-actions { display: flex; gap: 10px; width: 100%; }
.buy-currency-btn { flex: 1.2; border: none; padding: 12px 0; font-weight: 900; font-size: 0.88rem; border-radius: 12px; cursor: pointer; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.5); transition: transform 0.1s; }
.buy-currency-btn:active { transform: scale(0.96); }
.buy-currency-btn:disabled { background: #333 !important; color: #666 !important; cursor: not-allowed; box-shadow: none !important; }

.buy-currency-btn.money { background: linear-gradient(180deg, #4caf50 0%, #2e7d32 100%); box-shadow: 0 4px 12px rgba(76,175,80,0.25); }
.buy-currency-btn.diamonds { background: linear-gradient(180deg, #2196f3 0%, #1565c0 100%); box-shadow: 0 4px 12px rgba(33,150,243,0.25); }
.buy-currency-btn.rubles { background: linear-gradient(180deg, #e53935 0%, #b71c1c 100%); box-shadow: 0 4px 12px rgba(229,57,53,0.25); }

.buy-ad-btn { flex: 1; background: linear-gradient(180deg, #ff9800 0%, #ef6c00 100%); border: none; color: #fff; font-weight: 900; font-size: 0.75rem; border-radius: 12px; cursor: pointer; box-shadow: 0 4px 12px rgba(255,152,0,0.25); transition: all 0.1s; }
.buy-ad-btn:active { transform: scale(0.96); }
.buy-ad-btn:disabled { background: #444 !important; color: #888 !important; cursor: not-allowed; box-shadow: none !important; }
</style>
