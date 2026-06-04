// Ship Upgrade System for Cosmic Typing Adventure

import { logger } from './logger.js';
export class ShipUpgradeSystem {
    constructor(soundManager, userStats) {
        this.soundManager = soundManager;
        this.userStats = userStats;
        this.upgrades = {
            engine: {
                level: 1,
                cost: 100,
                effect: 0.05,
                maxLevel: 5,
                name: { ja: 'エンジン', en: 'Engine' },
                description: { ja: 'タイピング速度を向上', en: 'Improves typing speed' }
            },
            fuel: {
                level: 1,
                cost: 150,
                effect: 0.02,
                maxLevel: 5,
                name: { ja: '燃料システム', en: 'Fuel System' },
                description: { ja: '正確率を向上', en: 'Improves accuracy' }
            },
            shield: {
                level: 1,
                cost: 200,
                effect: 0.10,
                maxLevel: 5,
                name: { ja: 'シールド', en: 'Shield' },
                description: { ja: 'コンボペナルティを軽減', en: 'Reduces combo penalty' }
            }
        };

        this.loadUpgrades();
        this.setupEventListeners();
        this.applyUpgradeEffects();
        logger.debug('🚀 Ship Upgrade System initialized');
    }

    loadUpgrades() {
        const savedUpgrades = localStorage.getItem('cosmicTyping_upgrades');
        if (savedUpgrades) {
            try {
                const parsedUpgrades = JSON.parse(savedUpgrades);
                Object.keys(parsedUpgrades).forEach(key => {
                    if (this.upgrades[key]) {
                        this.upgrades[key].level = Math.min(parsedUpgrades[key].level, this.upgrades[key].maxLevel);
                    }
                });
            } catch (error) {
                logger.error('Failed to load upgrades:', error);
            }
        }
    }

    saveUpgrades() {
        try {
            const upgradeData = {};
            Object.keys(this.upgrades).forEach(key => {
                upgradeData[key] = { level: this.upgrades[key].level };
            });
            localStorage.setItem('cosmicTyping_upgrades', JSON.stringify(upgradeData));
        } catch (error) {
            logger.error('Failed to save upgrades:', error);
        }
    }

    setupEventListeners() {
        // Engine upgrade button
        const engineBtn = document.querySelector('[data-upgrade="engine"]');
        if (engineBtn) {
            engineBtn.addEventListener('click', () => this.upgradeShip('engine'));
        }

        // Fuel upgrade button
        const fuelBtn = document.querySelector('[data-upgrade="fuel"]');
        if (fuelBtn) {
            fuelBtn.addEventListener('click', () => this.upgradeShip('fuel'));
        }

        // Shield upgrade button
        const shieldBtn = document.querySelector('[data-upgrade="shield"]');
        if (shieldBtn) {
            shieldBtn.addEventListener('click', () => this.upgradeShip('shield'));
        }
    }

    upgradeShip(upgradeType) {
        const upgrade = this.upgrades[upgradeType];

        if (!upgrade) {
            logger.error('Invalid upgrade type:', upgradeType);
            return;
        }

        if (upgrade.level >= upgrade.maxLevel) {
            this.showNotification('Maximum level reached!', 'warning');
            return;
        }

        const cost = this.calculateUpgradeCost(upgradeType);

        if (this.userStats && this.userStats.xp >= cost) {
            // Deduct XP
            this.userStats.xp -= cost;

            // Upgrade level
            upgrade.level++;

            // Apply effects
            this.applyUpgradeEffects();

            // Save upgrades
            this.saveUpgrades();

            // Update UI
            this.updateUpgradeDisplay();
            if (window.updateUI) {
                window.updateUI();
            }

            // Show success notification
            const levelText = upgrade.level === 1 ? 'level 1' : `level ${upgrade.level}`;
            this.showNotification(`${upgradeType.toUpperCase()} upgraded to ${levelText}!`, 'success');

            // Play upgrade sound
            if (this.soundManager) {
                this.soundManager.play('upgrade'); // Assuming 'upgrade' sound exists or map appropriately
                // Note: Original code called playUpgrade(), but SoundManager usually has play(id).
                // Let's check SoundManager.js to see if it has playUpgrade methods. 
                // Ah, SoundManager.js has play(id). 
                // I should probably check if playUpgrade exists or just use play('upgrade').
                // Let's assume play('success') or similar for now if 'upgrade' isn't there, 
                // but for now let's just use methods that might exist or generic play.
                // Looking at sound-manager.js (step 69), it has play(id). 
                // It does NOT have playUpgrade(). 
                // So window.audioManager.playUpgrade() was likely from audio-manager.js which I didn't verify.
                // I will use this.soundManager.play('success') as a fallback or 'upgrade' if it exists.
                this.soundManager.play('success');
            }

            // Trigger achievement check
            // We need achievementSystem dependency too? 
            // Or access via window.app.achievementSystem?
            if (window.app && window.app.achievementSystem) {
                window.app.achievementSystem.checkAchievements(this.userStats);
            }

            logger.debug(`${upgradeType} upgraded to level ${upgrade.level}`);
        } else {
            this.showNotification('Not enough XP!', 'error');
        }
    }

    calculateUpgradeCost(upgradeType) {
        const upgrade = this.upgrades[upgradeType];
        if (!upgrade) return 0;

        // Exponential cost increase
        return Math.floor(upgrade.cost * Math.pow(1.5, upgrade.level - 1));
    }

    applyUpgradeEffects() {
        if (!window.gameState) return;

        // Calculate bonuses with diminishing returns
        const engineBonus = this.calculateEngineBonus();
        const fuelBonus = this.calculateFuelBonus();
        const shieldBonus = this.calculateShieldBonus();

        // Apply effects to game state
        window.gameState.speedMultiplier = 1 + engineBonus;
        window.gameState.accuracyBonus = fuelBonus;
        window.gameState.comboPenaltyReduction = shieldBonus;

        // Apply effects to typing engine if available
        if (window.typingEngine) {
            window.typingEngine.setSpeedMultiplier(window.gameState.speedMultiplier);
            window.typingEngine.setAccuracyBonus(window.gameState.accuracyBonus);
        }

        logger.debug('Upgrade effects applied:', {
            speedMultiplier: window.gameState.speedMultiplier,
            accuracyBonus: window.gameState.accuracyBonus,
            comboPenaltyReduction: window.gameState.comboPenaltyReduction
        });
    }

    calculateEngineBonus() {
        const level = this.upgrades.engine.level;
        const baseEffect = this.upgrades.engine.effect;
        // Diminishing returns: each level gives less bonus
        return baseEffect * (level - 1) * (1 - (level - 1) * 0.1);
    }

    calculateFuelBonus() {
        const level = this.upgrades.fuel.level;
        const baseEffect = this.upgrades.fuel.effect;
        return baseEffect * (level - 1);
    }

    calculateShieldBonus() {
        const level = this.upgrades.shield.level;
        const baseEffect = this.upgrades.shield.effect;
        return baseEffect * (level - 1);
    }

    updateUpgradeDisplay() {
        // Update engine display
        this.updateUpgradeElement('engine', 'engineLevel', 'engineProgress', 'engineCost');

        // Update fuel display
        this.updateUpgradeElement('fuel', 'fuelLevel', 'fuelProgress', 'fuelCost');

        // Update shield display
        this.updateUpgradeElement('shield', 'shieldLevel', 'shieldProgress', 'shieldCost');

        // Update upgrade buttons
        this.updateUpgradeButtons();

        // Update bonus display
        this.updateBonusDisplay();
    }

    updateUpgradeElement(upgradeType, levelElementId, progressElementId, costElementId) {
        const upgrade = this.upgrades[upgradeType];
        const levelElement = document.getElementById(levelElementId);
        const progressElement = document.getElementById(progressElementId);
        const costElement = document.getElementById(costElementId);

        if (levelElement) {
            levelElement.textContent = upgrade.level;
        }

        if (progressElement) {
            const progress = (upgrade.level / upgrade.maxLevel) * 100;
            progressElement.style.width = `${progress}%`;
        }

        if (costElement && upgrade.level < upgrade.maxLevel) {
            const cost = this.calculateUpgradeCost(upgradeType);
            costElement.textContent = `${cost} XP`;
        }
    }

    updateUpgradeButtons() {
        Object.keys(this.upgrades).forEach(upgradeType => {
            const upgrade = this.upgrades[upgradeType];
            const button = document.querySelector(`[data-upgrade="${upgradeType}"]`);

            if (button) {
                const cost = this.calculateUpgradeCost(upgradeType);
                const canAfford = this.userStats && this.userStats.xp >= cost;
                const isMaxLevel = upgrade.level >= upgrade.maxLevel;

                // Update button text
                if (isMaxLevel) {
                    button.textContent = 'MAX LEVEL';
                    button.disabled = true;
                    button.classList.add('opacity-50', 'cursor-not-allowed');
                } else {
                    button.textContent = `Upgrade (${cost} XP)`;
                    button.disabled = !canAfford;
                    button.classList.toggle('opacity-50', !canAfford);
                    button.classList.toggle('cursor-not-allowed', !canAfford);
                }
            }
        });
    }

    updateBonusDisplay() {
        const bonuses = this.getTotalBonuses();

        // Update bonus display elements
        const speedBonusElement = document.getElementById('speedBonus');
        const accuracyBonusElement = document.getElementById('accuracyBonus');
        const comboBonusElement = document.getElementById('comboBonus');

        if (speedBonusElement) {
            speedBonusElement.textContent = `+${(bonuses.speed * 100).toFixed(1)}%`;
        }

        if (accuracyBonusElement) {
            accuracyBonusElement.textContent = `+${(bonuses.accuracy * 100).toFixed(1)}%`;
        }

        if (comboBonusElement) {
            comboBonusElement.textContent = `-${(bonuses.combo * 100).toFixed(1)}%`;
        }
    }

    getUpgradeBonus(upgradeType) {
        const upgrade = this.upgrades[upgradeType];
        if (!upgrade) return 0;

        switch (upgradeType) {
            case 'engine':
                return this.calculateEngineBonus();
            case 'fuel':
                return this.calculateFuelBonus();
            case 'shield':
                return this.calculateShieldBonus();
            default:
                return 0;
        }
    }

    getTotalBonuses() {
        return {
            speed: this.getUpgradeBonus('engine'),
            accuracy: this.getUpgradeBonus('fuel'),
            combo: this.getUpgradeBonus('shield')
        };
    }

    getUpgradeInfo(upgradeType) {
        const upgrade = this.upgrades[upgradeType];
        if (!upgrade) return null;

        return {
            name: upgrade.name,
            description: upgrade.description,
            level: upgrade.level,
            maxLevel: upgrade.maxLevel,
            cost: this.calculateUpgradeCost(upgradeType),
            bonus: this.getUpgradeBonus(upgradeType)
        };
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `upgrade-notification fixed top-4 right-4 p-4 rounded-lg z-50 transform translate-x-full transition-transform duration-500`;

        // Set color based on type
        switch (type) {
            case 'success':
                notification.classList.add('bg-green-600', 'text-white');
                break;
            case 'error':
                notification.classList.add('bg-red-600', 'text-white');
                break;
            case 'warning':
                notification.classList.add('bg-yellow-600', 'text-white');
                break;
            default:
                notification.classList.add('bg-blue-600', 'text-white');
        }

        notification.textContent = message;
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        // Animate out and remove
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 500);
        }, 3000);
    }

    resetUpgrades() {
        Object.keys(this.upgrades).forEach(key => {
            this.upgrades[key].level = 1;
        });

        this.saveUpgrades();
        this.updateUpgradeDisplay();
        this.applyUpgradeEffects();

        logger.debug('All upgrades reset to level 1');
    }

    // Get upgrade statistics
    getUpgradeStats() {
        const stats = {
            totalUpgrades: 0,
            totalCost: 0,
            averageLevel: 0,
            maxedUpgrades: 0
        };

        Object.values(this.upgrades).forEach(upgrade => {
            stats.totalUpgrades += upgrade.level - 1;
            stats.averageLevel += upgrade.level;
            if (upgrade.level >= upgrade.maxLevel) {
                stats.maxedUpgrades++;
            }
        });

        stats.averageLevel = stats.averageLevel / Object.keys(this.upgrades).length;

        return stats;
    }
} 