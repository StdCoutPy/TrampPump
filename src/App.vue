<template>
  <div 
    id="game-root" 
    :class="[
      { 'bg-horror-border': isHorrorActive },
      { 'shake-active': isShaking }
    ]"
  >
        <!-- ИСПРАВЛЕНО: Теперь фоновый слой переключается между тремя картинками (Лобби, Карта, Битва) -->
    <div 
      v-if="!isHorrorActive" 
      :class="currentScreen === 'menu' ? 'game-wallpaper-lobby' : (currentScreen === 'map' ? 'game-wallpaper-map' : 'game-wallpaper-battle')"
    ></div>

    <!-- ИСПРАВЛЕНО: Навигация скрывается во время лобби, хоррора И КАРТЫ -->
    <div v-if="currentScreen !== 'menu' && currentScreen !== 'map' && !isHorrorActive" class="navigation-tabs">
      <button @click="changeScreen('game')" :class="{ active: currentScreen === 'game' }">⚔️ Битва</button>
      <button @click="changeScreen('shop')" :class="{ active: currentScreen === 'shop' }">🛠️ Кузница</button>
      <button @click="changeScreen('menu')" class="back-to-menu-btn">🚪 В Меню</button>
    </div>


    <div v-if="isHorrorActive" class="horror-glitch-overlay">
      <div class="blood-stripe top-stripe"></div>
      <div class="blood-stripe bottom-stripe"></div>
      <div class="screen-vignette"></div>
    </div>

    <div class="screen-container">
      <div v-show="currentScreen === 'menu'" class="main-lobby-menu">
        <div class="lobby-stats-overlay">
          <div class="lobby-stat-card money-box">
            <span class="stat-title">MONEY</span>
            <span class="stat-value">{{ liveBalance }} billions money</span>
          </div>
          <div class="lobby-stage-badge">ЭТАП {{ currentStage }}</div>
          <div class="lobby-stat-card hp-box">
            <span class="stat-title">BOSS HP</span>
            <span class="stat-value">{{ bossHP }} / {{ maxHP }} HP</span>
            <div class="lobby-hp-bar-track">
              <div class="lobby-hp-bar-fill" :style="{ width: hpPercent + '%' }"></div>
            </div>
          </div>
        </div>
        <div class="lobby-footer-actions">
          <button class="lobby-shop-btn" @click="changeScreen('shop')">🛠️ КУЗНИЦА<br><span class="shop-sub">ПРОКАЧКА</span></button>
          <!-- ВСТАВИТЬ СТРОГО СЮДА: Новая круглая кнопка КАРТЫ -->
          <button class="lobby-round-map-btn" @click="changeScreen('map')">
            <span class="map-btn-icon">🗺️</span>
            <span class="map-btn-text">КАРТА</span>
          </button>
          <button class="play-mega-btn" @click="changeScreen('game')">
            <span class="btn-flash"></span>
            <div class="play-text">ИГРАТЬ</div>
            <div class="play-sub">ПРОДОЛЖИТЬ БОЙ</div>
          </button>
        </div>
      </div>


      <!-- ВСТАВИТЬ: Экран вертикальной карты кампании -->
      <div v-show="currentScreen === 'map'" class="campaign-map-screen">
        <button class="map-back-lobby-btn" @click="changeScreen('menu')">⬅️ НАЗАД</button>
        
        <div class="map-hitbox trump-target" :class="{ selected: selectedBoss === 'trump' }" @click="selectCampaignBoss('trump', 'ТРАМП')"></div>
        <div class="map-hitbox putin-target" :class="{ selected: selectedBoss === 'putin' }" @click="selectCampaignBoss('putin', 'ПУТИН')"></div>
        <div class="map-hitbox kim-target" :class="{ selected: selectedBoss === 'kim' }" @click="selectCampaignBoss('kim', 'КИМ ЧЕН ЫН')"></div>
        <div class="map-hitbox zelensky-target" :class="{ selected: selectedBoss === 'zelensky' }" @click="selectCampaignBoss('zelensky', 'ЗЕЛЕНСКИЙ')"></div>

        <div class="map-fight-gate-target" @click="startSelectedBossFight"></div>
        
        <div class="map-selection-toast">
          ЦЕЛЬ: <span class="target-glow">{{ activeTargetName }}</span>
        </div>
      </div>

      <Game v-show="currentScreen === 'game'" />
      <Shop v-show="currentScreen === 'shop' && !isHorrorActive" />
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import Game from './components/Game.vue';
import Shop from './components/Shop.vue';
import EventBus from './core/EventBus';
import ServiceRegistry from './core/ServiceRegistry';
import BossManager from './managers/BossManager';

const currentScreen = ref('menu');
const isShaking = ref(false);
const isHorrorActive = ref(false);

const liveBalance = ref(0);
const currentStage = ref(1);
// ИСПРАВЛЕНО: Убрали ошибочную стрелочную функцию. 
// Теперь bossHP инициализируется числом 500, а актуальное здоровье подтянется из BossManager автоматически!
const bossHP = ref(500);
const maxHP = ref(100);

let lobbyInterval: any = null;

const hpPercent = computed(() => {
  if (maxHP.value <= 0) return 0;
  return Math.min(100, Math.max(0, (bossHP.value / maxHP.value) * 100));
});

const changeScreen = (screenName: string) => {
  if (isHorrorActive.value) return; 
  currentScreen.value = screenName;
  
  if (screenName === 'menu') {
    EventBus.getInstance().emit('pauseGameClockRequest');
    updateLobbyStats();
  } else if (screenName === 'game') {
    EventBus.getInstance().emit('resumeGameClockRequest');
  }
};

const updateLobbyStats = () => {
  const moneyManager = ServiceRegistry.get('MoneyManager');
  if (moneyManager) liveBalance.value = moneyManager.getBalance();
  
  const activeBoss = BossManager.getActiveBoss();
  if (activeBoss) {
    bossHP.value = activeBoss.currentHealth !== undefined && activeBoss.currentHealth >= 0 ? activeBoss.currentHealth : 0;
    maxHP.value = activeBoss.maxHealth || 100;
  }
};

// Именованные обработчики событий
const onScreenShake = () => {
  isShaking.value = true;
  setTimeout(() => { isShaking.value = false; }, 300);
};

const onActivateHorrorVoid = () => { 
  isHorrorActive.value = true; 
};

const onDeactivateHorrorVoid = () => { 
  isHorrorActive.value = false; 
};

const onStageChanged = (stageNum: number) => { 
  currentStage.value = stageNum; 
};
onMounted(() => {
  updateLobbyStats();

  EventBus.getInstance().on('triggerScreenShake', () => {
    isShaking.value = true;
    setTimeout(() => { isShaking.value = false; }, 300);
  });

  // Включаем затемнение хоррор-мода ТОЛЬКО когда босс физически упал на пол
  EventBus.getInstance().on('bossLandedOnGround', () => {
    isHorrorActive.value = true;
  });

  // Чистые обработчики активации/деактивации бездны
  EventBus.getInstance().on('activateHorrorVoid', () => { isHorrorActive.value = true; });
  EventBus.getInstance().on('deactivateHorrorVoid', () => { isHorrorActive.value = false; });
  EventBus.getInstance().on('stageChanged', (stageNum: number) => { currentStage.value = stageNum; });

  setInterval(updateLobbyStats, 500);
});

onUnmounted(() => {
  if (lobbyInterval) clearInterval(lobbyInterval);
  
  EventBus.getInstance().off('triggerScreenShake', onScreenShake);
  EventBus.getInstance().off('activateHorrorVoid', onActivateHorrorVoid);
  EventBus.getInstance().off('deactivateHorrorVoid', onDeactivateHorrorVoid);
  EventBus.getInstance().off('stageChanged', onStageChanged);
});

// ПЕРЕМЕННЫЕ ДЛЯ КАРТЫ КАМПАНИИ
const selectedBoss = ref('trump');       // Какой босс выбран по умолчанию
const activeTargetName = ref('ТРАМП');   // Текст выбранного босса

// Метод выбора босса на карте
const selectCampaignBoss = (id: string, name: string) => {
  selectedBoss.value = id;
  activeTargetName.value = name;
};

// Метод запуска битвы при нажатии на ворота "БОЙ"
const startSelectedBossFight = () => {
  changeScreen('game');
};

</script>

<style>
body {
  margin: 0; padding: 0;
  background: #000000 !important; 
  color: #ffffff;
  font-family: sans-serif;
  user-select: none;
  display: flex; justify-content: center; align-items: center;
  min-height: 100vh; width: 100vw; overflow: hidden;
}
#app { display: flex; justify-content: center; align-items: center; }

/* --- СТИЛИ ДЛЯ ИНТЕГРАЦИИ ВЕРТИКАЛЬНОЙ КАРТЫ С НУЛЯ --- */

/* ВСТАВИТЬ В CSS: Слой обоев вертикальной карты №2 */
.game-wallpaper-map {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background-size: cover; background-position: center; background-repeat: no-repeat;
  z-index: 1; pointer-events: none;
  background-image: url('./assets/campaig-map-2.png/') !important;
}

/* Фон под новую вертикальную картинку */

.bg-map {
  background-image: url('./assets/campaig-map-2.png/') !important;
  background-size: cover !important; 
  background-position: center !important;
  background-repeat: no-repeat !important;
  padding-top: 0px !important;
}

/* Круглая кнопка карты в нижнем ряду лобби */
.lobby-round-map-btn {
  width: 70px;
  height: 70px;
  min-width: 70px;
  background: linear-gradient(180deg, #37474f 0%, #212121 100%);
  border: 2px solid #ffeb3b;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 15px rgba(255, 235, 59, 0.3);
  transition: transform 0.1s;
}
.lobby-round-map-btn:active { transform: scale(0.92); }
.map-btn-icon { font-size: 1.4rem; line-height: 1; }
.map-btn-text { font-size: 0.55rem; font-weight: 900; color: #ffeb3b; margin-top: 1px; letter-spacing: 0.5px; }

/* Экран карты */
.campaign-map-screen {
  width: 100%; height: 100%; position: relative; z-index: 10;
}

/* Хитбоксы выбора президентов в процентах */
.map-hitbox {
  position: absolute;
  width: 24%; height: 14%;   
  background: transparent;
  border: 3px solid transparent;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}
.map-hitbox.selected {
  border-color: #ffeb3b;
  background: rgba(255, 235, 59, 0.18);
  box-shadow: 0 0 50px #ff9800, inset 0 0 10px #ffeb3b;
}

/* Координаты круглых портретов на вертикальной карте */
.trump-target    { top: 0.5%; left: 28.5%; } 
.putin-target    { top: 25.5%; left: 52.5%; } 
.kim-target      { top: 47.5%; left: 22.5%; } 
.zelensky-target { top: 60.5%; left: 50.5%; } 

/* Хитбокс для ворот "БОЙ" внизу арта */
.map-fight-gate-target {
  position: absolute;
  bottom: 3%; left: 50%;
  transform: translateX(-50%);
  width: 26%; height: 14%;
  background: transparent;
  cursor: pointer;
  border-radius: 20px;
}

/* Всплывающая плашка выбранной цели */
.map-selection-toast {
  position: absolute;
  top: 2%; left: 80%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.9);
  border: 2px solid #ff9800;
  padding: 8px 24px;
  border-radius: 14px;
  font-size: 0.88rem;
  font-weight: 900;
  letter-spacing: 1px;
}
.target-glow { color: #ffeb3b; text-shadow: 0 0 8px #ff9800; }

/* Кнопка "Назад" на карте */
.map-back-lobby-btn {
  position: absolute;
  top: 2%; left: 5%;
  background: rgba(0,0,0,0.85);
  border: 1px solid rgba(255,255,255,0.2);
  color: #fff;
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: bold;
  cursor: pointer;
}
/* КАРКАС АВТОМАТА */
#game-root {
  display: flex; flex-direction: column;
  width: 480px !important; min-width: 480px !important; max-width: 480px !important;
  height: 820px !important; min-height: 820px !important; max-height: 820px !important;
  background-color: #000000;
  border-radius: 28px; border: 3px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 15px 45px rgba(0, 0, 0, 0.9);
  position: relative; overflow: hidden; box-sizing: border-box;
}

/* Навешивается на рамку автомата во время хоррора */
.bg-horror-border {
  border-color: #8b0000 !important;
  box-shadow: 0 0 35px rgba(139, 0, 0, 0.6) !important;
}

/* ИЗОЛИРОВАННЫЕ ОБОИ (СЛОИ ФОНА) */
.game-wallpaper-lobby, .game-wallpaper-battle {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background-size: cover; background-position: center; background-repeat: no-repeat;
  z-index: 1; pointer-events: none;
}
.game-wallpaper-lobby {
  background-image: url('./assets/public/lobby-background.png');
}
.game-wallpaper-battle {
  background-image: linear-gradient(rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.15)), url('./assets/backgroundTramp.png');
}

/* СТИЛИ ОВЕРЛЕЯ ДЛЯ ХОРРОР-СЦЕНЫ */
.horror-glitch-overlay {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 180;
}
.blood-stripe {
  position: absolute; width: 100%; height: 5px; background: rgba(139, 0, 0, 0.8);
  box-shadow: 0 0 20px #ff0000; animation: scanline 1.2s linear infinite;
}
.top-stripe { top: 25%; animation-delay: 0s; }
.bottom-stripe { top: 70%; animation-delay: 0.5s; }
.screen-vignette {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background: radial-gradient(circle, transparent 30%, rgba(0, 0, 0, 0.98) 100%);
}

@keyframes scanline {
  0% { transform: translateY(-50px); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(750px); opacity: 0; }
}

/* СЛОЙ ИНТЕРФЕЙСА ЛОББИ */
.main-lobby-menu {
  width: 100%; height: 100%; box-sizing: border-box;
  padding: 25px 15px 35px 15px; display: flex; flex-direction: column; justify-content: space-between; align-items: center;
  position: relative; z-index: 10;
}
.lobby-stats-overlay { display: flex; justify-content: space-between; align-items: flex-start; width: 100%; }
.lobby-stat-card { background: rgba(0, 0, 0, 0.85); border: 2px solid rgba(255, 235, 59, 0.25); padding: 10px 14px; border-radius: 14px; display: flex; flex-direction: column; box-shadow: 0 6px 20px rgba(0,0,0,0.7); min-width: 145px; box-sizing: border-box; }
.stat-title { font-size: 0.68rem; color: #aaa; font-weight: 900; letter-spacing: 0.5px; }
.stat-value { font-size: 0.85rem; font-weight: bold; margin-top: 3px; white-space: nowrap; }
.money-box { color: #4caf50; border-color: rgba(76, 175, 80, 0.4); }
.hp-box { color: #f44336; border-color: rgba(244, 67, 54, 0.4); min-width: 160px; }
.lobby-stage-badge { background: linear-gradient(180deg, #ffeb3b 0%, #ff9800 100%); color: #000; padding: 8px 16px; border-radius: 20px; font-weight: 900; font-size: 0.9rem; border: 2px solid #fff; box-shadow: 0 0 15px rgba(255, 152, 0, 0.6); margin-top: 5px; }
.lobby-hp-bar-track { width: 100%; height: 6px; background: #222; border-radius: 3px; margin-top: 6px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); }
.lobby-hp-bar-fill { height: 100%; background: linear-gradient(90deg, #f44336, #ef5350); box-shadow: 0 0 8px #f44336; transition: width 0.2s ease-out; }

.lobby-footer-actions { display: flex; gap: 12px; width: 100%; align-items: center; }
.lobby-shop-btn { background: linear-gradient(180deg, #1a1a1a 0%, #080808 100%); border: 2px solid rgba(255, 255, 255, 0.15); color: #fff; border-radius: 16px; padding: 14px 10px; cursor: pointer; font-weight: 900; font-size: 0.85rem; box-shadow: 0 6px 15px rgba(0,0,0,0.6); flex: 0.8; text-align: center; }
.shop-sub { font-size: 0.65rem; color: #ffeb3b; font-weight: bold; }
.play-mega-btn { background: linear-gradient(180deg, #4caf50 0%, #2e7d32 100%); border: 3px solid #ffeb3b; border-radius: 18px; padding: 14px 0; cursor: pointer; box-shadow: 0 0 25px rgba(76,175,80,0.5), inset 0 0 10px rgba(255,255,255,0.3); position: relative; overflow: hidden; flex: 1.2; }
.play-mega-btn:active { transform: scale(0.95); }
.play-text { font-size: 1.7rem; font-weight: 900; color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.8); letter-spacing: 2px; line-height: 1.1; }
.play-sub { font-size: 0.78rem; color: #ffeb3b; font-weight: bold; margin-top: 1px; }
.btn-flash { position: absolute; top: 0; left: -100%; width: 50%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); transform: skewX(-25deg); animation: lightFlash 3.5s infinite; }
@keyframes lightFlash { 0% { left: -100%; } 30% { left: 150%; } 100% { left: 150%; } }

/* ВЕРХНЯЯ ИГРОВАЯ НАВИГАЦИЯ */
.navigation-tabs { position: absolute; top: 15px; left: 50%; transform: translateX(-50%); display: flex; gap: 10px; z-index: 100; width: 90%; justify-content: center; }
.navigation-tabs button { background: rgba(0, 0, 0, 0.75); color: #bbb; border: 1px solid rgba(255, 255, 255, 0.2); padding: 10px 16px; border-radius: 14px; cursor: pointer; font-weight: bold; font-size: 0.9rem; flex: 1; text-align: center; }
.navigation-tabs button.active { background: #4caf50; color: white; border-color: #81c784; box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3); }
.back-to-menu-btn { background: #e53935 !important; border-color: #ef5350 !important; flex: 0.6 !important; }
.screen-container { width: 100%; height: 100%; position: relative; flex-grow: 1; z-index: 5; }
.shake-active { animation: heavyShake 0.3s cubic-bezier(.36,.07,.19,.97) both; transform: translate3d(0, 0, 0); backface-visibility: hidden; perspective: 1000px; }
@keyframes heavyShake { 10%, 90% { transform: translate3d(-3px, 0, 0); } 20%, 80% { transform: translate3d(4px, 2px, 0); } 30%, 50%, 70% { transform: translate3d(-6px, -3px, 0); } 40%, 60% { transform: translate3d(6px, 3px, 0); } }



</style>