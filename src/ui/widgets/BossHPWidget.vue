<template>
  <div class="boss-hp-widget">
    Boss HP: {{ hp }}
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import EventBus from '../../core/EventBus';

const hp = ref(100);

// Читаем свойство health из пришедшего объекта!
const updateHP = (data: { id: string; health: number }) => {
  hp.value = data.health;
};

onMounted(() => {
  EventBus.getInstance().on('bossHealthChanged', updateHP);
});

onUnmounted(() => {
  EventBus.getInstance().off('bossHealthChanged', updateHP);
});
</script>
