<template>
  <div class="game-screen">
    <!-- HUD и Бонусы видны во время бега и падения босса, но полностью скрываются во время хоррора -->
    <HUD v-if="!isHorrorMode" />
    
    <!-- Наш Трамп виден всегда -->
    <AnimatedBoss />

    <!-- Колышущаяся купюра (только на 1, 2 и 3 стадиях вне хоррора) -->
    <div v-if="currentStage < 4 && !isHorrorMode" class="note-center-stage">
      <AnimatedNote />
    </div>
    
    <!-- Оверлей летящих абилок полностью скрывается во время хоррора -->
    <RandomEventsOverlay v-if="!isHorrorMode" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import HUD from '../ui/screens/HUD.vue';
import RandomEventsOverlay from './RandomEventsOverlay.vue';
import AnimatedNote from './AnimatedNote.vue';
import AnimatedBoss from './AnimatedBoss.vue';
import EventBus from '../core/EventBus';

const currentStage = ref(1);
const isHorrorMode = ref(false);

// Именованные функции-слушатели для их корректной очистки
const onStageChanged = (stage: number) => {
  currentStage.value = stage;
};

const onActivateHorrorVoid = () => { 
  isHorrorMode.value = true; 
};

const onDeactivateHorrorVoid = () => { 
  isHorrorMode.value = false; 
};

onMounted(() => {
  EventBus.getInstance().on('stageChanged', onStageChanged);
  EventBus.getInstance().on('activateHorrorVoid', onActivateHorrorVoid);
  EventBus.getInstance().on('deactivateHorrorVoid', onDeactivateHorrorVoid);
});

onUnmounted(() => {
  EventBus.getInstance().off('stageChanged', onStageChanged);
  EventBus.getInstance().off('activateHorrorVoid', onActivateHorrorVoid);
  EventBus.getInstance().off('deactivateHorrorVoid', onDeactivateHorrorVoid);
});
</script>

<style scoped>
.game-screen { 
  width: 100%; 
  height: 100%; 
  position: relative; 
}
.note-center-stage { 
  position: absolute; 
  top: 50%; 
  left: 50%; 
  transform: translate(-50%, -50%); 
  width: 100%; 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  z-index: 60; 
}
</style>