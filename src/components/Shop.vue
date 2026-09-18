<template>
  <div class="shop-screen-overlay">
    <!-- ГЛАВНЫЙ ДВУХПАНЕЛЬНЫЙ МОДУЛЬ МАГАЗИНА -->
    <div class="shop-main-layout">
      
      <!-- ЛЕВАЯ ВЕРТИКАЛЬНАЯ ПАНЕЛЬ ТАБОВ С ИНТЕГРИРОВАННЫМ БАЛАНСОМ ВНУТРИ КНОПОК -->
      <div class="shop-side-tabs">
        <button class="tab-btn" :class="{ active: activeTab === 'boosts' }" @click="activeTab = 'boosts'">
          ⚡ УСИЛЕНИЯ
          <div class="tab-balance-sub">💎 {{ diamondsCount }}</div>
        </button>
        <button class="tab-btn" :class="{ active: activeTab === 'click' }" @click="activeTab = 'click'">
          👆 КЛИК
        </button>
        <button class="tab-btn" :class="{ active: activeTab === 'income' }" @click="activeTab = 'income'">
          💵 ДОХОД
        </button>
        <button class="tab-btn weapon-tab" :class="{ active: activeTab === 'weapon' }" @click="activeTab = 'weapon'">
          🔫 ОРУЖИЕ
        </button>
        <button class="tab-btn prestige-tab" :class="{ active: activeTab === 'prestige' }" @click="activeTab = 'prestige'">
          👑 ПРЕСТИЖ
          <div class="tab-balance-sub rubles-txt">₽ {{ rublesCount }}</div>
        </button>
      </div>

      <!-- ПРАВАЯ ЛЕНТА СКРОЛЛА КАРТОЧЕК -->
      <div class="shop-items-scroll-view">
        <div class="category-header-title">
          {{ getCategoryTitle }}
        </div>
        
        <div class="shop-grid-container">
          <ShopCard 
            v-for="item in filteredItems" 
            :key="item.id" 
            :item="item"
            @buy-with-currency="handleCurrencyPurchase"
            @ad-watch-success="handleAdWatchSuccess"
          />
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { initialShopItems } from '../data/ShopProducts';
import ShopCard from './ShopCard.vue';
import EventBus from '../core/EventBus';

const activeTab = ref('boosts');
const shopItems = ref(initialShopItems);

// Реальные реактивные кошельки для Кузницы
const diamondsCount = ref(1420);
const rublesCount = ref(350); 

const filteredItems = computed(() => {
  return shopItems.value.filter((item: any) => item.category === activeTab.value);
});

const getCategoryTitle = computed(() => {
  if (activeTab.value === 'boosts') return 'АКТИВНЫЕ МНОЖИТЕЛИ И УСИЛЕНИЯ';
  if (activeTab.value === 'click') return 'СИЛА И КРИТЫ РУЧНОГО НАЖАТИЯ';
  if (activeTab.value === 'income') return 'ПАССИВНЫЙ БИЗНЕС И АВТОМАТИЗАЦИЯ';
  if (activeTab.value === 'weapon') return 'АРСЕНАЛ И ПУЛЕМЕТЫ DPS АТАК';
  return 'ПРЕСТИЖ И ГЛОБАЛЬНОЕ ГОСПОДСТВО';
});

/**
 * Логика списания ресурсов при покупке за валюту
 */
const handleCurrencyPurchase = (item: any) => {
  if (item.costType === 'diamonds') {
    if (diamondsCount.value >= item.cost) {
      diamondsCount.value -= item.cost;
      item.level++;
      triggerSuccessEffects(item.name);
    } else {
      alert('❌ Недостаточно алмазов! Посмотрите рекламный ролик справа.');
    }
    return;
  }

  if (item.costType === 'rubles') {
    if (rublesCount.value >= item.cost) {
      rublesCount.value -= item.cost;
      item.level++;
      triggerSuccessEffects(item.name);
    } else {
      alert('❌ Недостаточно рублей! Заработайте их через престиж-кампанию.');
    }
    return;
  }

  // Запрос в ядро игры на списание обычных долларов 💰
  EventBus.getInstance().emit('shopPurchaseRequest', {
    itemId: item.id,
    price: item.cost,
    callback: (success: boolean) => {
      if (success) {
        item.level++;
        item.cost = Math.round(item.cost * 1.6); // Удорожание уровня x1.6
        triggerSuccessEffects(item.name);
      } else {
        alert('❌ Недостаточно золотых монет в кошельке!');
      }
    }
  });
};

/**
 * Логика выдачи уровня при просмотре рекламы
 */
const handleAdWatchSuccess = (item: any) => {
  if (!item.adCost) return;
  
  item.adCost--;
  if (item.adCost <= 0) {
    item.level++;
    item.adCost = 2; // Сброс счетчика для следующего левела
    triggerSuccessEffects(`${item.name} БЕСПЛАТНО ЗА РЕКЛАМУ`);
  } else {
    alert(`📺 Ролик успешно просмотрен! До бесплатной разблокировки осталось посмотреть клипов: ${item.adCost}`);
  }
};

const triggerSuccessEffects = (itemName: string) => {
  alert(`🎉 УСПЕХ! Улучшение "${itemName}" успешно активировано!`);
  EventBus.getInstance().emit('triggerScreenShake');
};
</script>

<style scoped>
.shop-screen-overlay {
  width: 100%;
  height: 100%;
  background: rgba(10, 10, 10, 0.98);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 15px 10px;
}

.shop-main-layout {
  display: flex;
  width: 100%;
  height: 100%;
  /* ИСПРАВЛЕНО: Даем верхний отступ в 80px, чтобы карточки плавно ушли под верхние кнопки навигации автомата */
  padding-top: 80px; 
  gap: 12px;
  overflow: hidden;
  box-sizing: border-box;
}

/* ВЕРТИКАЛЬНАЯ ПАНЕЛЬ ТАБОВ */
.shop-side-tabs {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 115px;
  min-width: 115px;
}
.tab-btn {
  background: rgba(22, 22, 22, 0.9);
  color: #888;
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 12px 4px;
  border-radius: 14px;
  font-size: 0.65rem;
  font-weight: 900;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}
.tab-btn.active {
  background: #ff9800;
  color: #000;
  border-color: #ffb74d;
  box-shadow: 0 4px 15px rgba(255,152,0,0.3);
}
.tab-balance-sub {
  font-size: 0.58rem;
  font-weight: bold;
  color: #2196f3;
}
.tab-btn.active .tab-balance-sub { color: #002f6c; }
.rubles-txt { color: #f44336; }

.weapon-tab.active { background: #e65100; border-color: #ff9800; color: #fff; }
.prestige-tab.active { background: #ffea00; border-color: #ffff00; color: #000; }

/* ЛЕНТА СКРОЛЛА */
.shop-items-scroll-view {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding-right: 4px;
  box-sizing: border-box;
}
.shop-items-scroll-view::-webkit-scrollbar { width: 4px; }
.shop-items-scroll-view::-webkit-scrollbar-track { background: transparent; }
.shop-items-scroll-view::-webkit-scrollbar-thumb { background: #ff9800; border-radius: 10px; }

.category-header-title {
  font-size: 0.75rem;
  font-weight: 900;
  color: #ff9800;
  letter-spacing: 1px;
  margin-bottom: 14px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

.shop-grid-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 120px; /* Большой зазор снизу, чтобы нижняя рамка ничего не обрезала */
}
</style>
