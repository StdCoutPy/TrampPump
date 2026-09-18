<template>
  <div class="note-clicker-container">
    <!-- Главная купюра: сгорает строго по стадиям 1, 2, 3 и раскачивается на 30 градусов -->
    <div 
      class="animated-note"
      :class="[
        currentTiltDirection, /* Класс наклона: tilt-left, tilt-right или tilt-straight */
        { 'is-clicking': isPressed }
      ]"
      :style="{ 
        backgroundImage: `url(${spriteSheetUrl})`,
        /* СДВИГ ПО СТАДИЯМ: Стадия 1 = Кадр 0, Стадия 2 = Кадр 1, Стадия 3 = Кадр 2 */
        backgroundPositionX: `${(currentStage - 1) * -320}px`, 
        /* Используем только верхний долларовый ряд */
        backgroundPositionY: '0px'
      }"
      @mousedown="handlePress"
      @mouseup="handleRelease"
      @mouseleave="handleRelease"
      @touchstart.passive="handlePress"
      @touchend.passive="handleRelease"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import EventBus from '../core/EventBus';
import spriteSheetUrl from '../assets/money-burn-spritesheet.png';

const currentStage = ref(1);
const isPressed = ref(false);

// Состояние наклона: 'left' (влево), 'straight' (ровно), 'right' (вправо)
const currentTiltDirection = ref('tilt-straight');
let tiltTimer: any = null;

/**
 * РИТМИЧНЫЕ НАКЛОНЫ ПО ТАЙМЕРУ НА 30 ГРАДУСОВ:
 * Каждую секунду меняем состояние: Вправо (30°) -> Ровно (0°) -> Влево (-30°) -> Ровно (0°)
 */
const startRhythmicTilts = () => {
  let step = 0;
  
  tiltTimer = setInterval(() => {
    step = (step + 1) % 4;
    
    if (step === 0) {
      currentTiltDirection.value = 'tilt-right';    // Наклон вправо
    } else if (step === 1 || step === 3) {
      currentTiltDirection.value = 'tilt-straight'; // Возврат в центр
    } else if (step === 2) {
      currentTiltDirection.value = 'tilt-left';     // Наклон влево
    }
  }, 1000); // Ровно раз в секунду
};

const handlePress = () => {
  if (isPressed.value) return;
  isPressed.value = true;
  
  // Отправляем сигнал нанесения урона в ядро CombatManager
  EventBus.getInstance().emit('damageRequest', 10);
  EventBus.getInstance().emit('bossHit');
};

const handleRelease = () => {
  isPressed.value = false;
};

onMounted(() => {
  startRhythmicTilts();
  
  // Железобетонно отслеживаем смену глобальных стадий из CombatManager
  EventBus.getInstance().on('stageChanged', (stageNum: number) => {
    currentStage.value = stageNum;
  });
});

onUnmounted(() => {
  if (tiltTimer) clearInterval(tiltTimer);
});
</script>

<style scoped>
.note-clicker-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 280px;
  margin-bottom: 100px;
  z-index: 60;
  position: relative;
}

.animated-note {
  /* Исходные точные размеры кадра купюры с вашего рисунка */
  width: 320px; 
  height: 160px;
  background-repeat: no-repeat;
  
  /* Полный масштаб холста из 3 кадров в ширину и 5 рядов в высоту:
     3 кадра * 320px = 960px. 5 рядов * 160px = 800px */
  background-size: 960px 700px; 
  
  cursor: pointer;
  
  /* Плавный переход для секундных наклонов (0.4 секунды делают раскачивание очень мягким) */
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), filter 0.2s;
  
  filter: drop-shadow(0 15px 25px rgba(0, 0, 0, 0.6));
}

/* --- ИСПРАВЛЕНО: КЛАССЫ РИТМИЧНЫХ НАКЛОНОВ СТРОГО НА 30 ГРАДУСОВ --- */
.tilt-right {
  transform: rotate(30deg) scale(1);
}
.tilt-straight {
  transform: rotate(0deg) scale(1);
}
.tilt-left {
  transform: rotate(-30deg) scale(1);
}

/* --- ЭФФЕКТ НАЖАТИЯ (КУПЮРА СОЧНО УВЕЛИЧИВАЕТСЯ ПРИ КЛИКЕ В ЛЮБОМ УГЛЕ) --- */
.tilt-right.is-clicking {
  transform: rotate(30deg) scale(1.18) !important;
  filter: drop-shadow(0 20px 35px rgba(0, 0, 0, 0.85)) brightness(1.2);
}
.tilt-straight.is-clicking {
  transform: rotate(0deg) scale(1.18) !important;
  filter: drop-shadow(0 20px 35px rgba(0, 0, 0, 0.85)) brightness(1.2);
}
.tilt-left.is-clicking {
  transform: rotate(-30deg) scale(1.18) !important;
  filter: drop-shadow(0 20px 35px rgba(0, 0, 0, 0.85)) brightness(1.2);
}
</style>
