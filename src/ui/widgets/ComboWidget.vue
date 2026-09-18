<template>
  <div class="combo-widget" :class="{ 'has-combo': combo > 0 }">
    Combo: x{{ combo }}
    <span v-if="combo > 1" class="multiplier">(x{{ (1 + combo * 0.1).toFixed(1) }} Урон!)</span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import EventBus from '../../core/EventBus'; // Проверьте правильность пути к вашему core!

const combo = ref(0);

// Принимаем число напрямую, а не объект!
const updateCombo = (newComboValue: number) => {
  combo.value = newComboValue;
};

onMounted(() => {
  EventBus.getInstance().on('comboChanged', updateCombo);
});

onUnmounted(() => {
  EventBus.getInstance().off('comboChanged', updateCombo);
});
</script>

<style scoped>
.multiplier {
  font-size: 0.8rem;
  display: block;
  color: #ff9800;
}
.has-combo {
  animation: pulse 0.2s ease-in-out;
}
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
</style>
