<template>
  <div class="boss-container" :class="[stageClass, { 'is-clicking': isPressed }]">
    
    <!-- СЛОЙ РАЗЛЕТАЮЩИХСЯ ЧАСТИЦ КРОВИ -->
    <div 
      v-for="p in bloodParticles" 
      :key="'b' + p.id" 
      class="horror-particle blood-drop" 
      :style="{ 
        top: p.y + 'px', 
        left: p.x + 'px', 
        transform: `translate(${p.dx}px, ${p.dy}px) scale(${p.scale})` 
      }"
    ></div>

    <!-- СЛОЙ РАЗЛЕТАЮЩИХСЯ ЗОЛОТЫХ МОНЕТ (БЕЗ СПРАЙТ-ЛИСТА) -->
    <div 
      v-for="m in coinParticles" 
      :key="'c' + m.id" 
      class="horror-particle gold-coin-clean" 
      :style="{ 
        top: m.y + 'px', 
        left: m.x + 'px', 
        transform: `translate(${m.dx}px, ${m.dy}px) rotate(${m.angle}deg)` 
      }"
    ></div>

    <!-- ВЕКТОРНЫЙ БЕЛЫЙ ДУХ С ГЛАЗАМИ (БЕЗ СПРАЙТ-ЛИСТА) -->
    <div 
      v-if="currentPhase === 'spirit'"
      class="boss-ghost-spirit-vector"
      :style="{
        transform: `translate(0px, ${ghostPosY}px)`
      }"
    >
      <div class="spirit-core">
        <div class="spirit-face">
          <div class="spirit-eye left"></div>
          <div class="spirit-eye right"></div>
          <div class="spirit-mouth"></div>
        </div>
      </div>
      <div class="spirit-glow"></div>
    </div>

    <!-- Тело Босса (Приземляется на пузо на 5-й ряд, кадр 7) -->
    <div 
      class="boss-character"
      :style="{
        backgroundImage: `url(${bossSpriteUrl})`,
        backgroundPositionX: `${colIndex * -128}px`, 
        backgroundPositionY: `${rowIndex * (-128 - 17)}px`, 
        transform: `translate(${posX}px, ${posY}px) scaleX(${direction}) scale(${horrorScale})`
      }"
      @mousedown="handleBossClick"
      @touchstart.passive="handleBossClick"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import EventBus from '../core/EventBus';
import bossSpriteUrl from '../assets/boss-spritesheet.png';

const stage = ref(1);
const isPressed = ref(false);

const rowIndex = ref(0);
const colIndex = ref(0);
const posX = ref(-120); 
const posY = ref(50); 
const direction = ref(1); 

// Хоррор и призрачные переменные
const currentPhase = ref('intro');
const horrorClicks = ref(0);      
const horrorScale = ref(1);       
const isHorrorActive = ref(false); 

const ghostPosY = ref(50);

const bloodParticles = ref([] as any[]);
const coinParticles = ref([] as any[]);
let particleInterval: any = null;
let idCounter = 0;

let animInterval: any = null;
let moveInterval: any = null;
let physicsInterval: any = null;
let ghostInterval: any = null;
const stageClass = ref('stage-1');

const updateBossState = () => {
  if (stage.value === 1) { rowIndex.value = 0; posX.value = -120; posY.value = 50; return; }
  if (stage.value === 2) { rowIndex.value = 0; posX.value = -120; posY.value = 50; return; }
  if (stage.value === 3) { rowIndex.value = 1; posX.value = -120; posY.value = 50; return; }

  if (stage.value === 4) {
    if (currentPhase.value === 'intro') {
      rowIndex.value = 1; posX.value = -120; posY.value = 50;
    } else if (currentPhase.value === 'running') {
      posY.value = 50;
    } else if (currentPhase.value === 'rage') {
      rowIndex.value = 4; posX.value = 0; posY.value = 50;
    } else if (currentPhase.value === 'collapse') {
      rowIndex.value = 4; posX.value = 0;
    } else if (currentPhase.value === 'on_ground' || currentPhase.value === 'spirit') {
      // Спустили строку на 1 вниз: теперь это 5-й ряд, кадр 7
      rowIndex.value = 5; 
      colIndex.value = 7; 
      posX.value = 0; 
      posY.value = 50; 
    }
  }
};

const startSpriteLoop = () => {
  let frameTick = 0;
  animInterval = setInterval(() => {
    frameTick++;
    
    // Для духа покадровая анимация больше не нужна, управление перешло в CSS
    if (currentPhase.value === 'spirit') return;

    if (currentPhase.value === 'collapse' || isHorrorActive.value) return; 

    if (stage.value === 1) { colIndex.value = frameTick % 4; } 
    else if (stage.value === 2) { colIndex.value = 4 + (frameTick % 4); } 
    else if (stage.value === 3) { colIndex.value = frameTick % 4; } 
    else if (stage.value === 4) {
      if (currentPhase.value === 'intro') { colIndex.value = 4 + (frameTick % 3); } 
      else if (currentPhase.value === 'running') {
        const cycleTime = Date.now() % 4000;
        if (cycleTime < 2500) { rowIndex.value = 2; colIndex.value = frameTick % 4; } 
        else { rowIndex.value = 2; colIndex.value = 4 + (frameTick % 4); }
      } else if (currentPhase.value === 'rage') { rowIndex.value = 4; colIndex.value = frameTick % 4; } 
      else if (currentPhase.value === 'on_ground') { rowIndex.value = 5; colIndex.value = 7; }
    }
  }, 120);
};

const runPhysicalCollapse = () => {
  if (physicsInterval) clearInterval(physicsInterval);
  if (moveInterval) clearInterval(moveInterval);
  
  rowIndex.value = 4; colIndex.value = 4; posX.value = 0; posY.value = 50;
  let timePassed = 0;

  physicsInterval = setInterval(() => {
    timePassed += 30;
    if (timePassed < 800) { 
      posY.value -= 14; 
    } else { 
      posY.value += 7; 
      if (posY.value > 50) posY.value = 50; 
    }

    if (posY.value < -100) { 
      colIndex.value = 4; 
    } else if (posY.value < -20) { 
      colIndex.value = 5; 
    } else if (posY.value < 50) { 
      colIndex.value = 6; 
    } else if (posY.value === 50 && timePassed >= 800) {
      // ПРИЗЕМЛИЛСЯ! Смещаем анимацию на строку ниже (ряд 5)
      rowIndex.value = 5;
      colIndex.value = 7; 
      clearInterval(physicsInterval);
      
      console.log("✈️ Босс упал на пол и перешел на 5 ряд.");
      EventBus.getInstance().emit('bossLandedOnGround');
    }
  }, 30);
};

const updateHorrorParticlesPhysics = () => {
  if (!isHorrorActive.value && bloodParticles.value.length === 0 && coinParticles.value.length === 0) return;

  bloodParticles.value.forEach((p: any) => { p.dx += p.vx; p.dy += p.vy; p.vy += 0.35; p.scale *= 0.96; });
  coinParticles.value.forEach((m: any) => { m.dx += m.vx; m.dy += m.vy; m.vy += 0.25; m.vx *= 0.97; m.angle += m.rotSpeed; });

  bloodParticles.value = bloodParticles.value.filter((p: any) => p.scale > 0.1);
  coinParticles.value = coinParticles.value.filter((m: any) => m.dy < 500);
};

const startRunningAI = () => {
  if (moveInterval) clearInterval(moveInterval);
  posX.value = -140; direction.value = 1;
  moveInterval = setInterval(() => {
    const cycleTime = Date.now() % 4000;
    if (stage.value !== 4 || currentPhase.value !== 'running' || cycleTime >= 2500) return;
    posX.value += 6 * direction.value;
    if (posX.value >= 140 && direction.value === 1) direction.value = -1; 
    if (posX.value <= -140 && direction.value === -1) direction.value = 1;
  }, 30);
};

const handleBossClick = (event: MouseEvent) => {
  if (currentPhase.value === 'spirit') return;

  if (stage.value === 4) {
    if (currentPhase.value === 'intro') {
      currentPhase.value = 'running';
      EventBus.getInstance().emit('firstClickStage4Detected');
      updateBossState(); 
      startRunningAI();
    }

    if (isHorrorActive.value) {
      horrorClicks.value++;
      isPressed.value = true;
      setTimeout(() => { isPressed.value = false; }, 60);

      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;

      for (let i = 0; i < 6; i++) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 6 + 5;
        bloodParticles.value.push({ id: idCounter++, x: clickX + 64, y: clickY + 80, dx: 0, dy: 0, vx: Math.cos(angle) * velocity, vy: Math.sin(angle) * velocity - 4, scale: Math.random() * 0.4 + 0.8 });
      }

      for (let i = 0; i < 4; i++) {
        const angle = (Math.random() * Math.PI) + Math.PI; 
        const velocity = Math.random() * 5 + 4;
        coinParticles.value.push({ id: idCounter++, x: clickX + 64, y: clickY + 80, dx: 0, dy: 0, vx: Math.cos(angle) * velocity, vy: Math.sin(angle) * velocity, angle: Math.random() * 360, rotSpeed: Math.random() * 24 - 12 });
      }

      if (horrorClicks.value % 3 === 0) {
        horrorScale.value += 0.35; 
        EventBus.getInstance().emit('triggerScreenShake'); 
      }

      if (horrorClicks.value >= 15) {
        isHorrorActive.value = false;
        horrorScale.value = 1.0; 
        bloodParticles.value = [];
        coinParticles.value = [];
        
        EventBus.getInstance().emit('deactivateHorrorVoid'); 
        EventBus.getInstance().emit('horrorDefeatSequenceFinished'); 
      }
      return; 
    }

    isPressed.value = true;
    EventBus.getInstance().emit('damageRequest', 10);
    EventBus.getInstance().emit('bossHit');
    setTimeout(() => { isPressed.value = false; }, 60);
  }
};

const onStageChanged = (newStage: number) => {
  stage.value = newStage; 
  stageClass.value = `stage-${newStage}`;
  if (newStage === 4) { 
    currentPhase.value = 'intro'; 
    isHorrorActive.value = false; 
    horrorScale.value = 1; 
  }
  updateBossState();
};

const onBossHealthChanged = (data: { id: string, health: number, phase: string }) => {
  if (stage.value === 4) {
    currentPhase.value = data.phase;
    if (data.phase === 'collapse') runPhysicalCollapse();
  }
  updateBossState();
};

const onActivateHorrorVoid = () => {
  isHorrorActive.value = true;
  horrorClicks.value = 0;
  horrorScale.value = 1.0;
  updateBossState();
};

const onTriggerSpiritRisingAnimation = () => {
  ghostPosY.value = 50;
  if (ghostInterval) clearInterval(ghostInterval);
  ghostInterval = setInterval(() => {
    ghostPosY.value -= 5;
    if (ghostPosY.value < -500) clearInterval(ghostInterval);
  }, 30);
};

onMounted(() => {
  updateBossState(); 
  startSpriteLoop();
  particleInterval = setInterval(updateHorrorParticlesPhysics, 20);

  EventBus.getInstance().on('stageChanged', onStageChanged);
  EventBus.getInstance().on('bossHealthChanged', onBossHealthChanged);
  EventBus.getInstance().on('activateHorrorVoid', onActivateHorrorVoid);
  EventBus.getInstance().on('triggerSpiritRisingAnimation', onTriggerSpiritRisingAnimation);
});

onUnmounted(() => {
  clearInterval(animInterval); 
  clearInterval(moveInterval); 
  clearInterval(particleInterval);
  if (physicsInterval) clearInterval(physicsInterval); 
  if (ghostInterval) clearInterval(ghostInterval);

  EventBus.getInstance().off('stageChanged', onStageChanged);
  EventBus.getInstance().off('bossHealthChanged', onBossHealthChanged);
  EventBus.getInstance().off('activateHorrorVoid', onActivateHorrorVoid);
  EventBus.getInstance().off('triggerSpiritRisingAnimation', onTriggerSpiritRisingAnimation);
});
</script>

<style scoped>
.boss-container { 
  position: absolute; 
  top: 55%; 
  left: 50%; 
  transform: translate(-50%, -50%); 
  width: 100%; 
  height: 180px; 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  z-index: 55; 
  pointer-events: none; 
  overflow: visible !important; 
}

.stage-4 { 
  pointer-events: auto !important; 
}

.boss-character {
  width: 128px; 
  height: 160px; 
  background-repeat: no-repeat; 
  background-size: 1024px 896px; 
  image-rendering: pixelated;
  transition: transform 0.08s cubic-bezier(0.175, 0.885, 0.32, 1.275), filter 0.04s linear; 
  cursor: pointer;
}

.stage-4 .boss-character:active { 
  filter: brightness(1.2) contrast(1.1); 
}

/* ЧИСТЫЕ CSS МОНЕТЫ */
.gold-coin-clean {
  width: 14px;
  height: 14px;
  background: linear-gradient(135deg, #ffd700 0%, #ffb300 100%);
  border-radius: 50%;
  border: 1.5px solid #fff59d;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.8), inset 0 0 4px rgba(0,0,0,0.3);
}

/* СТИЛИЗАЦИЯ БЕЛОГО ВЕКТОРНОГО ДУХА С ЛИЦОМ */
.boss-ghost-spirit-vector {
  position: absolute; 
  width: 100px; 
  height: 140px; 
  z-index: 60; 
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.spirit-core {
  position: relative;
  width: 70px;
  height: 95px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 240, 240, 0.4) 100%);
  border-radius: 50% 50% 35% 35% / 60% 60% 40% 40%;
  filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.6));
  animation: spiritFloat 0.6s ease-in-out infinite alternate;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spirit-face {
  position: absolute;
  top: 30%;
  width: 40px;
  height: 30px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.spirit-eye {
  width: 10px;
  height: 10px;
  background: #ff0033;
  border-radius: 50%;
  box-shadow: 0 0 8px #ff0000;
  animation: eyeGlow 0.3s ease-in-out infinite alternate;
}

.spirit-mouth {
  width: 18px;
  height: 10px;
  background: #111111;
  border-radius: 0 0 12px 12px;
  margin: 4px auto 0 auto;
}

.spirit-glow {
  position: absolute;
  width: 95px;
  height: 120px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, transparent 75%);
  filter: blur(6px);
  animation: spiritPulse 0.4s ease-in-out infinite alternate;
}

@keyframes spiritFloat {
  0% { transform: scale(1) translateY(0); border-radius: 50% 50% 30% 30% / 60% 60% 40% 40%; }
  100% { transform: scale(1.04) translateY(-6px); border-radius: 54% 54% 26% 26% / 64% 64% 36% 36%; }
}

@keyframes spiritPulse {
  0% { opacity: 0.5; transform: scale(0.95); }
  100% { opacity: 0.8; transform: scale(1.08); }
}

@keyframes eyeGlow {
  0% { transform: scaleY(1); filter: brightness(1); }
  100% { transform: scaleY(0.8); filter: brightness(1.5); }
}

.horror-particle { 
  position: absolute; 
  pointer-events: none; 
  z-index: 195; 
}

.blood-drop { 
  width: 9px; 
  height: 9px; 
  background-color: #8b0000; 
  border-radius: 50%; 
  box-shadow: 0 0 12px #ff0000; 
}
</style>