/**
 * @module CombatManager
 * Центральный движок кликера: управляет стадиями, таймерами, комбо-множителями,
 * а также пошаговыми фазами финала (Бег -> Ярость -> Полёт -> Приземление -> Хоррор Пустота -> Дух).
 */

import EventBus from '../core/EventBus';
import BossManager from './BossManager';
import ServiceRegistry from '../core/ServiceRegistry';

export class CombatManager {
    private currentStage: number = 1;
    private readonly MAX_STAGES: number = 4;
    
    private comboCount: number = 0;
    private comboTimer: any = null; 
    private readonly COMBO_DURATION = 1500; 
    
    private timeLeft: number = 20; 
    private stageTimer: any = null;
    
    private isGameOver: boolean = false;
    private isWaitingForFirstClick: boolean = false;
    private isGamePaused: boolean = false;
    private isCollapseTriggered: boolean = false; 

    private finalBossPhase: 'intro' | 'running' | 'rage' | 'collapse' | 'on_ground' | 'spirit' = 'intro';
    private playerBaseDamage: number = 10;

    constructor() {
        EventBus.getInstance().on('damageRequest', this.handleDamageRequest.bind(this));
        EventBus.getInstance().on('shopPurchaseRequest', this.handleShopPurchase.bind(this));
        EventBus.getInstance().on('restartStageRequest', this.restartCurrentStage.bind(this));
        EventBus.getInstance().on('randomEventTriggered', this.handleRandomEvent.bind(this));
        
        EventBus.getInstance().on('firstClickStage4Detected', this.activateStage4Timer.bind(this));
        
        // СТРОГОЕ СОБЫТИЕ: Трамп приземлился на пузо! Вот теперь гасим свет!
        EventBus.getInstance().on('bossLandedOnGround', this.activateHorrorVoidAfterLanding.bind(this));
        EventBus.getInstance().on('horrorDefeatSequenceFinished', this.triggerFinalSpiritSequence.bind(this));

        EventBus.getInstance().on('pauseGameClockRequest', this.pauseGameClock.bind(this));
        EventBus.getInstance().on('resumeGameClockRequest', this.resumeGameClock.bind(this));

        setTimeout(() => {
            const activeBoss = BossManager.getActiveBoss();
            if (activeBoss) {
                activeBoss.maxHealth = 100; 
                activeBoss.currentHealth = activeBoss.maxHealth;
                (window as any).currentActiveBossMaxHP = activeBoss.maxHealth;
                EventBus.getInstance().emit('bossHealthChanged', { id: activeBoss.id, health: activeBoss.currentHealth, phase: 'normal' });
            }
        }, 50);

        this.startStageClock();
        this.syncUI();
    }

    private handleDamageRequest(ignoredBaseDamage: number): void {
        if (this.isGameOver && this.finalBossPhase === 'spirit') return;

        const activeBoss = BossManager.getActiveBoss();
        if (!activeBoss) return;

        this.comboCount++;
        this.resetComboResetTimer();
        EventBus.getInstance().emit('comboChanged', this.comboCount);

        const comboMultiplier = 1 + (this.comboCount * 0.1);
        const finalDamage = Math.round(this.playerBaseDamage * comboMultiplier);

        // Наносим урон через единую точку входа
        this.applyDamageToBoss(activeBoss, finalDamage, true);
    }

    /**
     * Универсальный метод нанесения урона боссу
     * @param activeBoss Ссылка на объект активного босса
     * @param damage Наносимый урон
     * @param isPlayerClick Флаг, определяющий, пришел ли урон от клика (для начисления золота)
     */
    private applyDamageToBoss(activeBoss: any, damage: number, isPlayerClick: boolean = false): void {
        if (activeBoss.currentHealth! > 0) {
            activeBoss.currentHealth! -= damage;
            if (activeBoss.currentHealth! < 0) activeBoss.currentHealth = 0;

            // Начисляем золото только за урон, нанесенный кликом игрока
            if (isPlayerClick) {
                const moneyManager = ServiceRegistry.get('MoneyManager');
                if (moneyManager) {
                    moneyManager.increaseBalance(Math.max(1, Math.round(damage / 3)));
                }
            }

            if (this.currentStage < this.MAX_STAGES) {
                EventBus.getInstance().emit('bossHealthChanged', { id: activeBoss.id, health: activeBoss.currentHealth, phase: 'normal' });
                if (activeBoss.currentHealth === 0) this.nextStage(activeBoss);
                return;
            }

            const hpPercent = (activeBoss.currentHealth / activeBoss.maxHealth) * 100;

            // ФАЗА ПОЛЁТА ОТ АППЕРКОТА (Нью-Йорк ЕЩЁ ВИДЕН)
            if (hpPercent <= 10 && activeBoss.currentHealth > 0 && !this.isCollapseTriggered) {
                this.isCollapseTriggered = true; 
                this.finalBossPhase = 'collapse';
                
                console.log("🦅 [CombatManager] Апперкот! Трамп полетел вверх на фоне города.");
                EventBus.getInstance().emit('bossHealthChanged', { id: activeBoss.id, health: activeBoss.currentHealth, phase: 'collapse' });
                return;
            }

            if (hpPercent <= 30 && hpPercent > 10 && this.finalBossPhase !== 'rage' && this.finalBossPhase !== 'collapse' && this.finalBossPhase !== 'on_ground') {
                this.finalBossPhase = 'rage';
            }

            if (this.finalBossPhase !== 'collapse' && this.finalBossPhase !== 'on_ground') {
                EventBus.getInstance().emit('bossHealthChanged', { id: activeBoss.id, health: activeBoss.currentHealth, phase: this.finalBossPhase });
            }
        }
    }

    /**
     * Вызывается строго из AnimatedBoss.vue когда физика полёта завершена и Трамп шлёпнулся на пол!
     */
    private activateHorrorVoidAfterLanding(): void {
        this.isGameOver = true; // Замораживаем обычный геймплей
        this.stopStageClock(); // Выключаем таймер раунда
        this.finalBossPhase = 'on_ground';
        
        console.log("🎬 [CombatManager] Сигнал приземления получен. Включаем хоррор-темноту!");
        EventBus.getInstance().emit('activateHorrorVoid'); // Гасим свет в App.vue и Game.vue
    }

    /**
     * Срабатывает после 15 кликов добивания в пустоте
     */
    private triggerFinalSpiritSequence(): void {
        const activeBoss = BossManager.getActiveBoss();
        if (!activeBoss) return;

        this.finalBossPhase = 'spirit';
        activeBoss.currentHealth = 0; // Логическое обнуление HP
        
        console.log("👻 [CombatManager] 15 кликов пройдено. Запускаем анимацию призрака...");
        
        // Здоровье ставим в фейковый минус (-5), чтобы HUD и лобби зафиксировали чистый 0 и не дёргались
        EventBus.getInstance().emit('bossHealthChanged', { id: activeBoss.id, health: -5, phase: 'spirit' });
        EventBus.getInstance().emit('triggerSpiritRisingAnimation'); // Даём старт полёту духа
        
        // Задержка окна победы увеличена до 4 секунд, чтобы игрок успел рассмотреть летящий дух!
        setTimeout(() => {
            this.winGame();
        }, 4000);
    }

    private startStageClock(): void {
        this.stopStageClock();
        this.isGameOver = false;
        this.isCollapseTriggered = false;

        if (this.currentStage === 4) {
            this.isWaitingForFirstClick = true;
            this.finalBossPhase = 'intro';
            this.timeLeft = 60;
            EventBus.getInstance().emit('timerUpdated', this.timeLeft);
        } else {
            this.isWaitingForFirstClick = false;
            this.timeLeft = 20;
            this.coreClockLoop();
        }
    }

    private activateStage4Timer(): void {
        if (this.isWaitingForFirstClick) {
            this.isWaitingForFirstClick = false;
            this.finalBossPhase = 'running'; 
            this.coreClockLoop(); 
        }
    }

    private coreClockLoop(): void {
        this.stopStageClock();
        this.stageTimer = setInterval(() => {
            if (this.isWaitingForFirstClick || this.isGamePaused) return;
            this.timeLeft--;
            EventBus.getInstance().emit('timerUpdated', this.timeLeft);
            if (this.timeLeft <= 0) this.triggerTimeOut();
        }, 1000);
    }

    private stopStageClock(): void {
        if (this.stageTimer) { clearInterval(this.stageTimer); this.stageTimer = null; }
    }

    private triggerTimeOut(): void {
        this.stopStageClock();
        this.isGameOver = true;
        EventBus.getInstance().emit('comboChanged', 0);
        EventBus.getInstance().emit('stageFailed', { message: "Вы не смогли одолеть Жадного Президента за целую минуту!" });
    }

    private restartCurrentStage(): void {
        const activeBoss = BossManager.getActiveBoss();
        if (activeBoss) {
            if (this.currentStage === 1) activeBoss.maxHealth = 100;
            if (this.currentStage === 2) activeBoss.maxHealth = 150;
            if (this.currentStage === 3) activeBoss.maxHealth = 200;
            if (this.currentStage === 4) activeBoss.maxHealth = 300;
            activeBoss.currentHealth = activeBoss.maxHealth;
            this.finalBossPhase = this.currentStage === 4 ? 'intro' : 'running';
            this.isCollapseTriggered = false;
            (window as any).currentActiveBossMaxHP = activeBoss.maxHealth;
            EventBus.getInstance().emit('bossHealthChanged', { id: activeBoss.id, health: activeBoss.currentHealth, phase: 'normal' });
        }
        this.startStageClock();
        this.syncUI();
        EventBus.getInstance().emit('gameResumed');
    }

    private nextStage(boss: any): void {
        this.currentStage++;
        if (this.currentStage === 2) boss.maxHealth = 150;
        if (this.currentStage === 3) boss.maxHealth = 200;
        if (this.currentStage === 4) boss.maxHealth = 300;
        boss.currentHealth = boss.maxHealth; 
        (window as any).currentActiveBossMaxHP = boss.maxHealth;
        this.startStageClock();
        this.syncUI();
        EventBus.getInstance().emit('bossDefeated', boss);
    }

    private winGame(): void {
        alert("🏆 ПОБЕДА СВЕРШИЛАСЬ! Вы уничтожили финансовую диктатуру Жадного Президента и полностью прошли игру!");
    }

    private syncUI(): void {
        EventBus.getInstance().emit('stageChanged', this.currentStage);
        EventBus.getInstance().emit('timerUpdated', this.timeLeft);
    }

    private handleRandomEvent(eventType: string): void {
        if (this.isGameOver || this.isWaitingForFirstClick || this.isGamePaused) return;
        const activeBoss = BossManager.getActiveBoss();
        const moneyManager = ServiceRegistry.get('MoneyManager');
        let popText = ""; 
        let popColor = "#4caf50";

        switch (eventType) {
            case 'dollar':
                if (moneyManager) { 
                    const reward = this.playerBaseDamage * 20; 
                    moneyManager.increaseBalance(reward); 
                    popText = `+$${reward}`; 
                }
                break;
            case 'dynamite':
                if (activeBoss && activeBoss.currentHealth! > 0 && this.finalBossPhase !== 'collapse' && this.finalBossPhase !== 'on_ground' && this.finalBossPhase !== 'spirit') {
                    const blastDamage = this.currentStage === 4 ? 30 : Math.round(activeBoss.maxHealth * 0.20);
                    
                    popText = `💥 ВЗРЫВ! -${blastDamage} HP`; 
                    popColor = "#e53935";
                    
                    EventBus.getInstance().emit('triggerScreenShake');
                    
                    // Безопасный расчет урона без эмуляции ложного клика игрока
                    this.applyDamageToBoss(activeBoss, blastDamage, false);
                }
                break;
            case 'lightning':
                const originalDamage = this.playerBaseDamage; 
                this.playerBaseDamage *= 2; 
                popText = "⚡ ДВОЙНОЙ УРОН!"; 
                popColor = "#ffeb3b";
                setTimeout(() => { 
                    this.playerBaseDamage = originalDamage; 
                    EventBus.getInstance().emit('showFloatingText', { text: "⚡ БУСТ ИСТЕК", color: "#aaa" }); 
                }, 4000);
                break;
            case 'chest':
                if (moneyManager) { 
                    const chestReward = Math.round(this.playerBaseDamage * (Math.random() * 40 + 10)); 
                    moneyManager.increaseBalance(chestReward); 
                    popText = `🎁 +$${chestReward}`; 
                    popColor = "#ff9800"; 
                }
                break;
            case 'gold_coin':
                if (moneyManager) { 
                    const jackpot = this.playerBaseDamage * 150; 
                    moneyManager.increaseBalance(jackpot); 
                    popText = `⭐ +$${jackpot}`; 
                    popColor = "#e91e63"; 
                }
                break;
            case 'critical':
                this.comboCount += 30; 
                popText = "+30 COMBO!"; 
                popColor = "#9c27b0"; 
                EventBus.getInstance().emit('comboChanged', this.comboCount); 
                this.resetComboResetTimer();
                break;
            case 'fake_heal':
                if (activeBoss && activeBoss.currentHealth! > 0 && this.finalBossPhase === 'running') {
                    const healAmount = Math.round(activeBoss.maxHealth * 0.15); 
                    activeBoss.currentHealth! += healAmount;
                    if (activeBoss.currentHealth! > activeBoss.maxHealth) activeBoss.currentHealth = activeBoss.maxHealth;
                    popText = `➕ +${healAmount} HP`; 
                    popColor = "#d32f2f";
                    EventBus.getInstance().emit('bossHealthChanged', { id: activeBoss.id, health: activeBoss.currentHealth, phase: 'running' });
                }
                break;
            case 'fake_steal':
                if (moneyManager) { 
                    const stealAmount = Math.round(moneyManager.getBalance() * 0.25); 
                    if (stealAmount > 0) { 
                        moneyManager.decreaseBalance(stealAmount); 
                        popText = `🎒 -$${stealAmount}`; 
                        popColor = "#b71c1c"; 
                    } 
                }
                break;
        }
        if (popText) EventBus.getInstance().emit('showFloatingText', { text: popText, color: popColor });
    }

    private handleShopPurchase(payload: { itemId: string, price: number, eventName: string, callback: (success: boolean) => void }): void {
        const moneyManager = ServiceRegistry.get('MoneyManager');
        if (!moneyManager) { payload.callback(false); return; }
        if (moneyManager.checkBalance(payload.price)) {
            moneyManager.decreaseBalance(payload.price);
            if (payload.itemId === 'anvil_stone') this.playerBaseDamage += 8;
            if (payload.itemId === 'anvil_iron') this.playerBaseDamage += 45;
            payload.callback(true);
        } else {
            payload.callback(false);
        }
    }

    private pauseGameClock(): void { this.isGamePaused = true; this.stopStageClock(); }
    
    private resumeGameClock(): void {
        this.isGamePaused = false;
        if (!this.isWaitingForFirstClick && !this.isGameOver && this.finalBossPhase !== 'collapse' && this.finalBossPhase !== 'on_ground') {
            this.coreClockLoop();
        }
    }

    private resetComboResetTimer(): void {
        if (this.comboTimer) window.clearTimeout(this.comboTimer);
        this.comboTimer = window.setTimeout(() => { 
            this.comboCount = 0; 
            EventBus.getInstance().emit('comboChanged', this.comboCount); 
        }, this.COMBO_DURATION);
    }
}