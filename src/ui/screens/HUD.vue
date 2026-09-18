<template>
  <div class="hud">
    <!-- Верхний ряд показателей (💰 и ❤️) -->
    <div class="metrics-bar">
      <div class="money-wrapper">
        <span class="label">💰</span> <MoneyWidget />
      </div>
      
      <!-- Минималистичные радиальные SVG-часы -->
      <div class="clock-wrapper" :class="{ 'emergency': timer <= 5 }">
        <svg class="radial-clock" viewBox="0 0 40 40">
          <circle class="bg-track" cx="20" cy="20" r="16" />
          <circle 
            class="progress-hand" 
            cx="20" 
            cy="20" 
            r="16" 
            :style="{ strokeDashoffset: strokeOffset }" 
          />
        </svg>
        <span class="digital-time">{{ timer }}s</span>
      </div>

      <div class="hp-wrapper">
        <span class="label">❤️</span> <BossHPWidget />
      </div>
    </div>

    <!-- Всплывающий комбо-эффект -->
    <div class="combo-blast-anchor" v-if="showComboPop">
      <div class="combo-flash-banner">
        <span class="combo-number">{{ stageCombo }}</span>
        <span class="combo-subtext">COMBO HITS!</span>
      </div>
    </div>

    <!-- Экран поражения -->
    <div v-if="showFailScreen" class="fail-overlay">
      <div class="fail-modal">
        <h2 class="fail-title">⚠️ Время истекло!</h2>
        <p class="fail-message">{{ failMessage }}</p>
        <button class="retry-btn" @click="retryStage">Пройти уровень еще раз</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import MoneyWidget from '../widgets/MoneyWidget.vue';
import BossHPWidget from '../widgets/BossHPWidget.vue';
import EventBus from '../../core/EventBus';

const stage = ref(1);
const timer = ref(20);
const maxStageTime = ref(20);

const stageCombo = ref(0);
const showComboPop = ref(false);

const showFailScreen = ref(false);
const failMessage = ref("");

const strokeCircumference = 100.53;
const strokeOffset = computed(() => {
  const ratio = timer.value / maxStageTime.value;
  return strokeCircumference * (1 - ratio);
});

const onStageChanged = (newStage: number) => {
  stage.value = newStage;
  maxStageTime.value = newStage === 4 ? 60 : 20;
};

const onTimerUpdated = (newTime: number) => { timer.value = newTime; };

const onComboChanged = (newCombo: number) => {
  stageCombo.value = newCombo;
  if (newCombo > 0 && newCombo % 5 === 0) {
    showComboPop.value = true;
    setTimeout(() => { showComboPop.value = false; }, 400);
  } else if (newCombo === 0) {
    showComboPop.value = false;
  }
};

const onStageFailed = (data: { message: string }) => {
  failMessage.value = data.message;
  showFailScreen.value = true;
};

const retryStage = () => { EventBus.getInstance().emit('restartStageRequest'); };
const onGameResumed = () => { showFailScreen.value = false; };

onMounted(() => {
  EventBus.getInstance().on('stageChanged', onStageChanged);
  EventBus.getInstance().on('timerUpdated', onTimerUpdated);
  EventBus.getInstance().on('comboChanged', onComboChanged);
  EventBus.getInstance().on('stageFailed', onStageFailed);
  EventBus.getInstance().on('gameResumed', onGameResumed);
});

onUnmounted(() => {
  EventBus.getInstance().off('stageChanged', onStageChanged);
  EventBus.getInstance().off('timerUpdated', onTimerUpdated);
  EventBus.getInstance().off('comboChanged', onComboChanged);
  EventBus.getInstance().off('stageFailed', onStageFailed);
  EventBus.getInstance().off('gameResumed', onGameResumed);
});
</script>

<style scoped>
/* HUD остался без изменений в части layout показателей и модалок */
.hud { position: relative; width: 100%; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; overflow: hidden; }
.metrics-bar { position: absolute; top: 80px; width: 95%; display: flex; justify-content: space-between; align-items: center; z-index: 80; }
.money-wrapper, .hp-wrapper { display: flex; align-items: center; gap: 8px; background: rgba(0, 0, 0, 0.85); padding: 8px 14px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.15); font-size: 1.1rem; font-weight: bold; max-width: 150px; }
.money-wrapper { color: #4caf50; } .hp-wrapper { color: #f44336; }
.clock-wrapper { position: relative; width: 50px; height: 50px; display: flex; justify-content: center; align-items: center; }
.radial-clock { transform: rotate(-90deg); width: 100%; height: 100%; }
.bg-track { fill: rgba(0, 0, 0, 0.6); stroke: rgba(255, 255, 255, 0.1); stroke-width: 3; }
.progress-hand { fill: none; stroke: #2196f3; stroke-width: 3; stroke-linecap: round; stroke-dasharray: 100.53; transition: stroke-dashoffset 1s linear, stroke 0.3s; }
.emergency .progress-hand { stroke: #f44336 !important; }
.digital-time { position: absolute; font-size: 0.75rem; font-weight: bold; color: #fff; }
.combo-blast-anchor { position: absolute; top: 40%; z-index: 70; pointer-events: none; }
.combo-flash-banner { background: linear-gradient(135deg, #ffeb3b, #ff9800); color: #000; padding: 10px 25px; border-radius: 14px; text-align: center; font-weight: 900; border: 2px solid #fff; box-shadow: 0 10px 25px rgba(255,152,0,0.5); animation: explodePop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
.combo-number { font-size: 2.2rem; display: block; line-height: 1; }
.combo-subtext { font-size: 0.75rem; letter-spacing: 1px; }
@keyframes explodePop { 0% { transform: scale(0.4) rotate(-5deg); opacity: 0; } 70% { transform: scale(1.1) rotate(3deg); } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
.fail-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); display: flex; justify-content: center; align-items: center; z-index: 999; }
.fail-modal { background: #141414; border: 2px solid #f44336; padding: 30px; border-radius: 20px; text-align: center; width: 85%; box-shadow: 0 10px 30px rgba(0,0,0,0.8); }
.fail-title { color: #f44336; margin: 0 0 15px 0; font-size: 1.8rem; font-weight: 900; }
.fail-message { color: #ccc; margin: 15px 0 25px 0; font-size: 1rem; line-height: 1.4; }
.retry-btn { background: #f44336; color: white; border: none; padding: 14px; font-size: 1rem; font-weight: bold; border-radius: 12px; cursor: pointer; width: 100%; box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3); transition: background 0.2s; }
.retry-btn:active { background: #b71c1c; }
</style>