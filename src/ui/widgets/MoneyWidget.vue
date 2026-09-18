<template>
  <div class="money-widget">
    Money: {{ money }}
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import EventBus from '../../core/EventBus';

const money = ref(0);

// Читаем свойство newBalance из объекта!
const updateMoney = (data: { newBalance: number }) => {
  money.value = data.newBalance;
};

onMounted(() => {
  EventBus.getInstance().on('moneyBalanceChanged', updateMoney);
});

onUnmounted(() => {
  EventBus.getInstance().off('moneyBalanceChanged', updateMoney);
});
</script>
