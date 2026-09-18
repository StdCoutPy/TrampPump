<template>
  <div class="events-container">
    
    <!-- СЛОЙ ВСПЛЫВАЮЩЕГО ТЕКСТА ДОХОДОВ И УРОНА -->
    <transition-group name="float-text">
      <div 
        v-for="txt in floatingTexts" 
        :key="txt.id" 
        class="floating-label"
        :style="{ top: txt.y + 'px', left: txt.x + 'px', color: txt.color }"
      >
        {{ txt.text }}
      </div>
    </transition-group>

    <!-- СЛОЙ РАЗЛЕТАЮЩИХСЯ ИСКР ИЗ ЧАСТИЦ -->
    <div 
      v-for="spark in activeParticles" 
      :key="spark.id"
      class="particle-spark"
      :style="{
        top: spark.y + 'px',
        left: spark.x + 'px',
        backgroundColor: spark.color,
        transform: `translate(${spark.dx}px, ${spark.dy}px)`
      }"
    ></div>

    <!-- СЛОЙ СТАТИЧНОГО СПАВНА ПРЕДМЕТОВ -->
    <transition-group name="pop">
      <div 
        v-for="spawn in activeSpawns" 
        :key="spawn.id"
        class="floating-item"
        :class="{ 'is-trap': spawn.type === 'fake_heal' || spawn.type === 'fake_steal', 'clicked': spawn.isClicked }"
        :style="{ 
          top: spawn.y + 'px', 
          left: spawn.x + 'px',
          backgroundImage: `url(${itemsSpriteUrl})`,
          /* Передаем col и row напрямую в стили, чтобы CSS-селектор .is-trap мог их прочитать */
          '--col': spawn.col,
          '--row': spawn.row,
          backgroundPositionX: (spawn.type === 'fake_heal' || spawn.type === 'fake_steal') 
            ? `${(spawn.col * -80)}px` 
            : `${(spawn.col * -80)}px`,
          backgroundPositionY: (spawn.type === 'fake_heal' || spawn.type === 'fake_steal') 
            ? `${(spawn.row * -100)}px` 
            : `${(spawn.row * -100)}px`,
          boxShadow: '0 0 0px ' + spawn.color
        }"
        @click.stop="clickItem(spawn)"
      >
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { randomEventsPool, type RandomEventConfig } from '../data/RandomEventsData';
import EventBus from '../core/EventBus';
import itemsSpriteUrl from '../assets/testEl1.png';

const activeSpawns = ref([] as any[]);
const floatingTexts = ref([] as any[]);
const activeParticles = ref([] as any[]);

let spawnInterval: any = null;
let particleInterval: any = null;

let idCounter = 0;
let textCounter = 0;
let particleCounter = 0;
let currentStageNum = 1;

const getRandomEvent = (): RandomEventConfig => {
  const totalWeight = randomEventsPool.reduce((sum, item) => sum + item.weight, 0);
  let randomValue = Math.random() * totalWeight;
  for (const event of randomEventsPool) {
    if (randomValue < event.weight) return event;
    randomValue -= event.weight;
  }
  return randomEventsPool[0];
};

const createSingleItem = () => {
  const eventConfig = getRandomEvent();
  const id = idCounter++;
  
  // 1. Генерируем базовые случайные координаты абилки
  let x = Math.floor(Math.random() * 320) + 40;  // От 40px до 360px по ширине
  let y = Math.floor(Math.random() * 460) + 180; // От 180px до 640px по высоте

  // 2. ДИНАМИЧЕСКАЯ ПРОВЕРКА КУПЮРЫ ЧЕРЕЗ DOM API
  // Находим элемент купюры на странице
  const noteElement = document.querySelector('.animated-note');
  const rootElement = document.getElementById('game-root');

  if (noteElement && rootElement) {
    // Получаем координаты купюры и игрового окна относительно экрана
    const noteRect = noteElement.getBoundingClientRect();
    const rootRect = rootElement.getBoundingClientRect();

    // Переводим глобальные координаты купюры в локальные пиксели внутри окна 480x820
    const noteLeft = noteRect.left - rootRect.left;
    const noteRight = noteRect.right - rootRect.left;
    const noteTop = noteRect.top - rootRect.top;
    const noteBottom = noteRect.bottom - rootRect.top;

    // Добавляем небольшой зазор безопасности в 15 пикселей со всех сторон
    const padding = 15;

    // Проверяем, пересекаются ли сгенерированные X и Y с границами купюры
    if (
      x > (noteLeft - padding) && 
      x < (noteRight + padding) && 
      y > (noteTop - padding) && 
      y < (noteBottom + padding)
    ) {
      // Пересечение найдено! Выталкиваем предмет в свободные зоны
      if (Math.random() < 0.5) {
        // Смещаем строго ВВЕРХ (над верхней границей купюры)
        y = Math.floor(Math.random() * (noteTop - padding - 180)) + 180;
      } else {
        // Смещаем строго ВНИЗ (под нижнюю границу купюры)
        const minY = noteBottom + padding;
        y = Math.floor(Math.random() * (640 - minY)) + minY;
      }
    }
  }

  const timeoutId = setTimeout(() => {
    despawnItem(id);
  }, 2500); 

  activeSpawns.value.push({ ...eventConfig, id, x, y, timeoutId, isClicked: false });
};



const spawnBatch = () => {
  createSingleItem();
  const multiSpawnChance = currentStageNum === 4 ? 0.60 : 0.20;
  if (Math.random() < multiSpawnChance) createSingleItem();
  planNextSpawn();
};

const despawnItem = (id: number) => {
  activeSpawns.value = activeSpawns.value.filter((item: any) => item.id !== id);
};

const clickItem = (spawn: any) => {
  if (spawn.isClicked) return;
  spawn.isClicked = true;
  clearTimeout(spawn.timeoutId);

  // 1. Создаем всплывающий текст прямо над точкой клика
  const textId = textCounter++;
  floatingTexts.value.push({
    id: textId,
    x: spawn.x - 20, // Центрируем текст над предметом
    y: spawn.y - 30,
    text: "...", 
    color: spawn.color
  });
  
  // ИСПРАВЛЕНО: Текст задерживается на экране дольше (ровно 2 секунды вместо 1)
  setTimeout(() => {
    floatingTexts.value = floatingTexts.value.filter((t: any) => t.id !== textId);
  }, 2000);

  // 2. Генератор частиц (8 искр)
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const speed = Math.random() * 4 + 3;
    activeParticles.value.push({
      id: particleCounter++,
      x: spawn.x + 22, 
      y: spawn.y + 22,
      dx: 0,
      dy: 0,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color: spawn.color
    });
  }

  // 3. Отправляем триггер в CombatManager
  EventBus.getInstance().emit('randomEventTriggered', spawn.type);
  despawnItem(spawn.id);
};

const planNextSpawn = () => {
  if (spawnInterval) clearTimeout(spawnInterval);
  
  // ИСПРАВЛЕНО: Замедлили появление предметов!
  // Обычные стадии: спавн раз в 4 - 7 секунд. 4 стадия (Босс): спавн раз в 1.5 - 3 секунды.
  const nextDelay = currentStageNum === 4 
    ? Math.random() * 1500 + 1500 
    : Math.random() * 3000 + 4000;
    
  spawnInterval = setTimeout(spawnBatch, nextDelay);
};

const updateParticlesPhysics = () => {
  activeParticles.value.forEach((p: any) => {
    p.dx += p.vx;
    p.dy += p.vy;
    p.vy += 0.25; 
    p.vx *= 0.96; 
  });
  if (activeParticles.value.length > 50) {
    activeParticles.value.splice(0, 10);
  }
};

onMounted(() => {
  planNextSpawn();
  particleInterval = setInterval(updateParticlesPhysics, 20);

  EventBus.getInstance().on('stageChanged', (stage: number) => { currentStageNum = stage; });

  EventBus.getInstance().on('showFloatingText', (data: { text: string, color: string }) => {
    if (floatingTexts.value.length > 0) {
      floatingTexts.value[floatingTexts.value.length - 1].text = data.text;
      floatingTexts.value[floatingTexts.value.length - 1].color = data.color;
    }
  });
});

onUnmounted(() => {
  if (spawnInterval) clearTimeout(spawnInterval);
  if (particleInterval) clearInterval(particleInterval);
  activeSpawns.value.forEach((item: any) => clearTimeout(item.timeoutId));
});
</script>
<style scoped>
/* Главный контейнер оверлея растянут на весь автомат */
.events-container {
  position: absolute; 
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* pointer-events: none позволяет кликам для босса и купюры 
     беспрепятственно проходить сквозь пустые области оверлея */
  pointer-events: none;
  /* МАКСИМАЛЬНЫЙ СЛОЙ: выносим оверлей на самый верх (HUD имеет 80, мы ставим 200!) */
  z-index: 200 !important;
  overflow: hidden;
}

/* САМИ ЛЕТАЮЩИЕ ПРЕДМЕТЫ */
.floating-item {
  position: absolute;
  width: 80px;
  height: 100px;
  background-repeat: no-repeat;
  background-size: 400px 300px; 
  image-rendering: pixelated; 
  cursor: pointer;
  /* pointer-events: auto возвращает чувствительность к кликам мыши 
     строго для самой картинки абилки, перехватывая нажатие геймера */
  pointer-events: auto !important;
  user-select: none;
  border-radius: 12px;
  /* Дополнительно страхуем каждый летящий спрайт по высоте слоев */
  z-index: 210 !important;
}

/* Эффект мгновенного исчезновения при успешном клике */
.floating-item.clicked { 
  pointer-events: none !important; 
  opacity: 0 !important; 
}

/* ОГРОМНЫЕ ЛОВУШКИ (Медицинский плюс и Знак запрета) */
.floating-item.is-trap {
  width: 80px !important;
  height: 100px !important;
  background-size: 400px 300px !important; 
  z-index: 220 !important; /* Ловушки делаем еще приоритетнее */
}

/* АНИМАЦИЯ ВСПЛЫВАЮЩЕГО ТЕКСТА УРОНА И ЗОЛОТА */
.floating-label {
  position: absolute;
  font-size: 1.15rem;
  font-weight: 900;
  text-shadow: 0 2px 6px #000, 0 0 10px rgba(0,0,0,0.8);
  pointer-events: none;
  z-index: 250 !important; /* Текст летит поверх самих абилок */
  white-space: nowrap;
}

.float-text-enter-active {
  animation: floatUpAndFade 2s cubic-bezier(0.1, 0.8, 0.2, 1) forwards;
}
@keyframes floatUpAndFade {
  0% { transform: translateY(20px) scale(0.5); opacity: 0; }
  10% { transform: translateY(0px) scale(1.1); opacity: 1; }
  75% { transform: translateY(-20px) scale(1); opacity: 1; }
  100% { transform: translateY(-50px) scale(0.85); opacity: 0; }
}

/* СВЕТЯЩИЕСЯ ИСКРЫ ПРИ ВЗРЫВЕ */
.particle-spark {
  position: absolute;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 240 !important;
  box-shadow: 0 0 8px currentColor;
}

/* СВЕРХБЫСТРОЕ ПОЯВЛЕНИЕ ПРЕДМЕТА */
.pop-enter-active { animation: popIn 0.08s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
@keyframes popIn { 0% { transform: scale(0); } 100% { transform: scale(1); } }
</style>
