// Animation Manager for Cosmic Typing Adventure

const _logger = window.logger || { debug: () => {}, info: () => {}, warn: console.warn, error: console.error };
class AnimationManager {
    constructor() {
        this.particles = [];
        this.animations = [];
        this.isEnabled = true;
        this.particleCount = 0;
        this.maxParticles = 100;
        
        this.setupEventListeners();
        this.startParticleCleanup();
        _logger.debug('✨ Animation Manager initialized');
    }

    setupEventListeners() {
        // Performance toggle
        const animationToggle = document.getElementById('animationToggle');
        if (animationToggle) {
            animationToggle.addEventListener('change', (e) => {
                this.isEnabled = e.target.checked;
                _logger.debug(`Animations ${this.isEnabled ? 'enabled' : 'disabled'}`);
            });
        }
    }

    // Typing character effects
    createTypingEffect(char, x, y, isCorrect = true) {
        if (!this.isEnabled) return;
        
        const particle = document.createElement('div');
        particle.className = `typing-particle absolute pointer-events-none z-50 text-sm font-bold`;
        particle.textContent = char;
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.color = isCorrect ? '#10b981' : '#ef4444';
        particle.style.textShadow = isCorrect ? '0 0 10px #10b981' : '0 0 10px #ef4444';
        
        document.body.appendChild(particle);
        
        // Animate the particle
        this.animateParticle(particle, {
            duration: 1000,
            startY: y,
            endY: y - 50,
            startOpacity: 1,
            endOpacity: 0,
            startScale: 1,
            endScale: 1.5
        });
        
        this.particles.push(particle);
        this.particleCount++;
        
        // Remove particle after animation
        setTimeout(() => {
            if (document.body.contains(particle)) {
                document.body.removeChild(particle);
            }
            this.particles = this.particles.filter(p => p !== particle);
            this.particleCount--;
        }, 1000);
    }

    // Combo effects
    createComboEffect(combo, x, y) {
        if (!this.isEnabled) return;
        
        if (combo >= 10 && combo % 10 === 0) {
            this.createComboExplosion(x, y, combo);
        }
        
        if (combo >= 50) {
            this.createComboStreak(combo, x, y);
        }
    }

    createComboExplosion(x, y, combo) {
        const colors = ['#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#10b981'];
        const particleCount = Math.min(combo / 10, 20);
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'combo-particle absolute pointer-events-none z-50 text-lg font-bold';
            particle.textContent = '✨';
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            particle.style.color = colors[i % colors.length];
            
            document.body.appendChild(particle);
            
            // Random direction animation
            const angle = (i / particleCount) * 2 * Math.PI;
            const distance = 50 + Math.random() * 50;
            const endX = x + Math.cos(angle) * distance;
            const endY = y + Math.sin(angle) * distance;
            
            this.animateParticle(particle, {
                duration: 1500,
                startX: x,
                endX: endX,
                startY: y,
                endY: endY,
                startOpacity: 1,
                endOpacity: 0,
                startScale: 0.5,
                endScale: 1.5
            });
            
            setTimeout(() => {
                if (document.body.contains(particle)) {
                    document.body.removeChild(particle);
                }
            }, 1500);
        }
        
        // Play combo sound
        if (window.audioManager) {
            window.audioManager.playCombo();
        }
    }

    createComboStreak(combo, x, y) {
        const streak = document.createElement('div');
        streak.className = 'combo-streak absolute pointer-events-none z-50 text-2xl font-bold';
        streak.textContent = `${combo} COMBO!`;
        streak.style.left = `${x}px`;
        streak.style.top = `${y}px`;
        streak.style.color = '#f59e0b';
        streak.style.textShadow = '0 0 20px #f59e0b';
        
        document.body.appendChild(streak);
        
        this.animateParticle(streak, {
            duration: 2000,
            startY: y,
            endY: y - 100,
            startOpacity: 1,
            endOpacity: 0,
            startScale: 0.5,
            endScale: 2
        });
        
        setTimeout(() => {
            if (document.body.contains(streak)) {
                document.body.removeChild(streak);
            }
        }, 2000);
    }

    // Level up effects
    createLevelUpEffect(level) {
        if (!this.isEnabled) return;
        
        const effect = document.createElement('div');
        effect.className = 'level-up-effect fixed inset-0 pointer-events-none z-50 flex items-center justify-center';
        effect.innerHTML = `
            <div class="level-up-content text-center">
                <div class="text-6xl mb-4">🎉</div>
                <div class="text-3xl font-bold text-yellow-400 mb-2">LEVEL UP!</div>
                <div class="text-xl text-white">Level ${level}</div>
            </div>
        `;
        
        document.body.appendChild(effect);
        
        // Animate level up effect
        effect.style.opacity = '0';
        effect.style.transform = 'scale(0.5)';
        
        // Fade in
        setTimeout(() => {
            effect.style.transition = 'all 0.5s ease-out';
            effect.style.opacity = '1';
            effect.style.transform = 'scale(1)';
        }, 100);
        
        // Fade out
        setTimeout(() => {
            effect.style.opacity = '0';
            effect.style.transform = 'scale(1.2)';
        }, 2000);
        
        // Remove effect
        setTimeout(() => {
            if (document.body.contains(effect)) {
                document.body.removeChild(effect);
            }
        }, 2500);
        
        // Play level up sound
        if (window.audioManager) {
            window.audioManager.playLevelUp();
        }
    }

    // Planet discovery effects
    createPlanetDiscoveryEffect(planetName) {
        if (!this.isEnabled) return;
        
        const effect = document.createElement('div');
        effect.className = 'planet-discovery-effect fixed inset-0 pointer-events-none z-50 flex items-center justify-center';
        effect.innerHTML = `
            <div class="planet-discovery-content text-center bg-cosmic-card p-8 rounded-xl border border-blue-500">
                <div class="text-5xl mb-4">🌍</div>
                <div class="text-2xl font-bold text-cosmic-cyan mb-2">惑星発見!</div>
                <div class="text-lg text-white">${planetName}</div>
            </div>
        `;
        
        document.body.appendChild(effect);
        
        // Animate planet discovery
        effect.style.opacity = '0';
        effect.style.transform = 'translateY(50px) scale(0.8)';
        
        // Slide in
        setTimeout(() => {
            effect.style.transition = 'all 0.8s ease-out';
            effect.style.opacity = '1';
            effect.style.transform = 'translateY(0) scale(1)';
        }, 100);
        
        // Slide out
        setTimeout(() => {
            effect.style.opacity = '0';
            effect.style.transform = 'translateY(-50px) scale(0.8)';
        }, 3000);
        
        // Remove effect
        setTimeout(() => {
            if (document.body.contains(effect)) {
                document.body.removeChild(effect);
            }
        }, 3800);
        
        // Play discovery sound
        if (window.audioManager) {
            window.audioManager.playPlanetDiscovered();
        }
    }

    // Achievement unlock effects
    createAchievementEffect(achievement) {
        if (!this.isEnabled) return;
        
        const effect = document.createElement('div');
        effect.className = 'achievement-effect fixed top-4 right-4 pointer-events-none z-50';
        effect.innerHTML = `
            <div class="achievement-content bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-lg border border-purple-400 shadow-lg">
                <div class="flex items-center space-x-3">
                    <div class="text-2xl">🏆</div>
                    <div>
                        <div class="text-sm font-bold text-white">実績解除!</div>
                        <div class="text-xs text-purple-200">${achievement.name}</div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(effect);
        
        // Animate achievement notification
        effect.style.opacity = '0';
        effect.style.transform = 'translateX(100%)';
        
        // Slide in
        setTimeout(() => {
            effect.style.transition = 'all 0.5s ease-out';
            effect.style.opacity = '1';
            effect.style.transform = 'translateX(0)';
        }, 100);
        
        // Slide out
        setTimeout(() => {
            effect.style.opacity = '0';
            effect.style.transform = 'translateX(100%)';
        }, 4000);
        
        // Remove effect
        setTimeout(() => {
            if (document.body.contains(effect)) {
                document.body.removeChild(effect);
            }
        }, 4500);
        
        // Play achievement sound
        if (window.audioManager) {
            window.audioManager.playAchievementUnlock();
        }
    }

    // Upgrade effects
    createUpgradeEffect(upgradeType) {
        if (!this.isEnabled) return;
        
        const effect = document.createElement('div');
        effect.className = 'upgrade-effect fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50';
        effect.innerHTML = `
            <div class="upgrade-content text-center">
                <div class="text-4xl mb-2">⚡</div>
                <div class="text-xl font-bold text-green-400">${upgradeType.toUpperCase()} UPGRADED!</div>
            </div>
        `;
        
        document.body.appendChild(effect);
        
        // Animate upgrade effect
        effect.style.opacity = '0';
        effect.style.transform = 'translate(-50%, -50%) scale(0.5)';
        
        // Scale in
        setTimeout(() => {
            effect.style.transition = 'all 0.6s ease-out';
            effect.style.opacity = '1';
            effect.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 100);
        
        // Scale out
        setTimeout(() => {
            effect.style.opacity = '0';
            effect.style.transform = 'translate(-50%, -50%) scale(1.2)';
        }, 2000);
        
        // Remove effect
        setTimeout(() => {
            if (document.body.contains(effect)) {
                document.body.removeChild(effect);
            }
        }, 2600);
        
        // Play upgrade sound
        if (window.audioManager) {
            window.audioManager.playUpgrade();
        }
    }

    // Generic particle animation
    animateParticle(particle, options) {
        const {
            duration = 1000,
            startX = 0,
            endX = 0,
            startY = 0,
            endY = 0,
            startOpacity = 1,
            endOpacity = 0,
            startScale = 1,
            endScale = 1
        } = options;
        
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            // Calculate current values
            const currentX = startX + (endX - startX) * easeOut;
            const currentY = startY + (endY - startY) * easeOut;
            const currentOpacity = startOpacity + (endOpacity - startOpacity) * easeOut;
            const currentScale = startScale + (endScale - startScale) * easeOut;
            
            // Apply to particle
            particle.style.left = `${currentX}px`;
            particle.style.top = `${currentY}px`;
            particle.style.opacity = currentOpacity;
            particle.style.transform = `scale(${currentScale})`;
            
            // Continue animation
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    // Performance optimization
    startParticleCleanup() {
        setInterval(() => {
            // Remove particles that are no longer in the DOM
            this.particles = this.particles.filter(particle => {
                return document.body.contains(particle);
            });
            
            // Limit particle count
            if (this.particles.length > this.maxParticles) {
                const excess = this.particles.length - this.maxParticles;
                for (let i = 0; i < excess; i++) {
                    const particle = this.particles.shift();
                    if (particle && document.body.contains(particle)) {
                        document.body.removeChild(particle);
                    }
                }
            }
        }, 5000); // Clean up every 5 seconds
    }

    // Text typing animation
    createTextTypingAnimation(element, text, speed = 50) {
        if (!this.isEnabled) return;
        
        element.textContent = '';
        let index = 0;
        
        const typeNextChar = () => {
            if (index < text.length) {
                element.textContent += text[index];
                index++;
                setTimeout(typeNextChar, speed);
            }
        };
        
        typeNextChar();
    }

    // Progress bar animation
    animateProgressBar(progressBar, targetValue, duration = 1000) {
        if (!this.isEnabled) return;
        
        const startValue = parseFloat(progressBar.style.width) || 0;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOut = 1 - Math.pow(1 - progress, 2);
            
            const currentValue = startValue + (targetValue - startValue) * easeOut;
            progressBar.style.width = `${currentValue}%`;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    // Screen shake effect
    createScreenShake(intensity = 5, duration = 200) {
        if (!this.isEnabled) return;
        
        const body = document.body;
        const originalTransform = body.style.transform;
        
        let startTime = performance.now();
        
        const shake = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = elapsed / duration;
            
            if (progress < 1) {
                const shakeX = (Math.random() - 0.5) * intensity * (1 - progress);
                const shakeY = (Math.random() - 0.5) * intensity * (1 - progress);
                
                body.style.transform = `translate(${shakeX}px, ${shakeY}px)`;
                requestAnimationFrame(shake);
            } else {
                body.style.transform = originalTransform;
            }
        };
        
        requestAnimationFrame(shake);
    }

    // Flash effect
    createFlashEffect(color = '#ffffff', duration = 200) {
        if (!this.isEnabled) return;
        
        const flash = document.createElement('div');
        flash.className = 'flash-effect fixed inset-0 pointer-events-none z-40';
        flash.style.backgroundColor = color;
        flash.style.opacity = '0.3';
        
        document.body.appendChild(flash);
        
        // Fade in
        setTimeout(() => {
            flash.style.transition = 'opacity 0.1s ease-out';
            flash.style.opacity = '0.3';
        }, 10);
        
        // Fade out
        setTimeout(() => {
            flash.style.opacity = '0';
        }, duration / 2);
        
        // Remove
        setTimeout(() => {
            if (document.body.contains(flash)) {
                document.body.removeChild(flash);
            }
        }, duration);
    }

    // Get animation statistics
    getAnimationStats() {
        return {
            activeParticles: this.particles.length,
            maxParticles: this.maxParticles,
            isEnabled: this.isEnabled,
            totalAnimations: this.animations.length
        };
    }

    // Toggle animations
    toggleAnimations() {
        this.isEnabled = !this.isEnabled;
        _logger.debug(`Animations ${this.isEnabled ? 'enabled' : 'disabled'}`);
        
        // Update UI if available
        const toggle = document.getElementById('animationToggle');
        if (toggle) {
            toggle.checked = this.isEnabled;
        }
    }

    // Clear all animations
    clearAllAnimations() {
        this.particles.forEach(particle => {
            if (document.body.contains(particle)) {
                document.body.removeChild(particle);
            }
        });
        
        this.particles = [];
        this.animations = [];
        this.particleCount = 0;
        
        _logger.debug('All animations cleared');
    }
} 