// Time Attack Mode for Cosmic Typing Adventure

const _logger = window.logger || { debug: () => {}, info: () => {}, warn: console.warn, error: console.error };
class TimeAttackMode {
    constructor() {
        this.duration = 60; // Default 60 seconds
        this.remainingTime = 60;
        this.isActive = false;
        this.timer = null;
        this.startTime = null;
        this.endTime = null;
        this.sessionData = {
            wpm: 0,
            accuracy: 100,
            totalTyped: 0,
            totalErrors: 0,
            combo: 0,
            maxCombo: 0
        };
        
        this.timeOptions = [
            { value: 30, label: '30秒', name: { ja: 'スプリント', en: 'Sprint' } },
            { value: 60, label: '1分', name: { ja: 'クイック', en: 'Quick' } },
            { value: 180, label: '3分', name: { ja: 'マラソン', en: 'Marathon' } },
            { value: 300, label: '5分', name: { ja: 'エンドレス', en: 'Endless' } }
        ];
        
        this.setupEventListeners();
        _logger.debug('⏱️ Time Attack Mode initialized');
    }

    setupEventListeners() {
        // Time attack mode buttons
        const timeAttackButtons = document.querySelectorAll('[data-time-attack]');
        timeAttackButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const duration = parseInt(e.target.getAttribute('data-time-attack'));
                this.startTimeAttack(duration);
            });
        });
    }

    startTimeAttack(duration) {
        // durationがNaNや0の場合はデフォルト値60にする
        if (!Number.isFinite(duration) || duration <= 0) {
            duration = 60;
        }
        // 入力欄を必ず有効化
        const typingInput = document.getElementById('timeAttackInput');
        if (typingInput) {
            typingInput.disabled = false;
        }
        this.duration = duration;
        this.remainingTime = duration;
        this.isActive = true;
        this.startTime = Date.now();
        
        // Reset session data
        this.sessionData = {
            wpm: 0,
            accuracy: 100,
            totalTyped: 0,
            totalErrors: 0,
            combo: 0,
            maxCombo: 0
        };
        
        // Update UI
        this.updateTimeDisplay();
        this.showTimeAttackInterface();
        
        // Start timer
        this.timer = setInterval(() => {
            this.remainingTime--;
            this.updateTimeDisplay();
            
            if (this.remainingTime <= 0) {
                this.endTimeAttack();
            }
        }, 1000);
        
        // Start typing session
        this.startTypingSession();
        
        _logger.debug(`Time attack started: ${duration} seconds`);
    }

    endTimeAttack() {
        this.isActive = false;
        this.endTime = Date.now();
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        // Calculate final results
        this.calculateFinalResults();
        
        // Show results
        this.showTimeAttackResults();
        
        // Save results
        this.saveTimeAttackResults();
        
        _logger.debug('Time attack ended');
    }

    calculateFinalResults() {
        const timeElapsed = (this.endTime - this.startTime) / 1000 / 60; // minutes
        const totalTyped = this.sessionData.totalTyped;
        const totalErrors = this.sessionData.totalErrors;
        
        // Calculate WPM
        this.sessionData.wpm = timeElapsed > 0 ? Math.round((totalTyped / 5) / timeElapsed) : 0;
        
        // Calculate accuracy
        this.sessionData.accuracy = totalTyped > 0 ? Math.round(((totalTyped - totalErrors) / totalTyped) * 100) : 100;
        
        // Apply upgrade bonuses
        if (window.shipUpgradeSystem) {
            const speedBonus = window.shipUpgradeSystem.getUpgradeBonus('engine');
            const accuracyBonus = window.shipUpgradeSystem.getUpgradeBonus('fuel');
            
            this.sessionData.wpm = Math.round(this.sessionData.wpm * (1 + speedBonus));
            this.sessionData.accuracy = Math.min(100, this.sessionData.accuracy + (accuracyBonus * 100));
        }
    }

    updateTimeDisplay() {
        const timeDisplay = document.getElementById('timeAttackTimer');
        if (timeDisplay) {
            const minutes = Math.floor(this.remainingTime / 60);
            const seconds = this.remainingTime % 60;
            timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            // Add visual warning when time is running low
            if (this.remainingTime <= 10) {
                timeDisplay.classList.add('text-red-500', 'animate-pulse');
            } else {
                timeDisplay.classList.remove('text-red-500', 'animate-pulse');
            }
        }
    }

    showTimeAttackInterface() {
        // Hide mission selection
        const missionSection = document.getElementById('missionSelection');
        if (missionSection) {
            missionSection.classList.add('hidden');
        }
        
        // Show time attack interface
        const timeAttackInterface = document.getElementById('timeAttackInterface');
        if (timeAttackInterface) {
            timeAttackInterface.classList.remove('hidden');
        }
        
        // Update UI elements
        this.updateTimeAttackUI();
    }

    updateTimeAttackUI() {
        // Update progress bar
        const progressBar = document.getElementById('timeAttackProgress');
        if (progressBar) {
            const progress = ((this.duration - this.remainingTime) / this.duration) * 100;
            progressBar.style.width = `${progress}%`;
        }
        
        // Update session stats
        this.updateSessionStats();
    }

    updateSessionStats() {
        const wpmDisplay = document.getElementById('timeAttackWPM');
        const accuracyDisplay = document.getElementById('timeAttackAccuracy');
        const comboDisplay = document.getElementById('timeAttackCombo');
        
        if (wpmDisplay) {
            wpmDisplay.textContent = this.sessionData.wpm;
        }
        
        if (accuracyDisplay) {
            accuracyDisplay.textContent = `${this.sessionData.accuracy}%`;
        }
        
        if (comboDisplay) {
            comboDisplay.textContent = this.sessionData.maxCombo;
        }
    }

    showTimeAttackResults() {
        // Hide time attack interface
        const timeAttackInterface = document.getElementById('timeAttackInterface');
        if (timeAttackInterface) {
            timeAttackInterface.classList.add('hidden');
        }
        
        // Show results panel
        const resultsPanel = document.getElementById('timeAttackResults');
        if (resultsPanel) {
            resultsPanel.classList.remove('hidden');
            this.updateResultsDisplay();
        }
    }

    updateResultsDisplay() {
        const finalWPM = document.getElementById('finalWPM');
        const finalAccuracy = document.getElementById('finalAccuracy');
        const finalCombo = document.getElementById('finalCombo');
        const timeUsed = document.getElementById('timeUsed');
        const totalTyped = document.getElementById('totalTyped');
        
        if (finalWPM) {
            finalWPM.textContent = this.sessionData.wpm;
        }
        
        if (finalAccuracy) {
            finalAccuracy.textContent = `${this.sessionData.accuracy}%`;
        }
        
        if (finalCombo) {
            finalCombo.textContent = this.sessionData.maxCombo;
        }
        
        if (timeUsed) {
            const timeElapsed = (this.endTime - this.startTime) / 1000;
            timeUsed.textContent = `${timeElapsed.toFixed(1)}秒`;
        }
        
        if (totalTyped) {
            totalTyped.textContent = this.sessionData.totalTyped;
        }
        
        // Show performance rating
        this.showPerformanceRating();
    }

    showPerformanceRating() {
        const ratingElement = document.getElementById('performanceRating');
        if (!ratingElement) return;
        
        const wpm = this.sessionData.wpm;
        const accuracy = this.sessionData.accuracy;
        
        let rating = '';
        let ratingClass = '';
        
        if (wpm >= 80 && accuracy >= 95) {
            rating = 'S級';
            ratingClass = 'text-yellow-400';
        } else if (wpm >= 60 && accuracy >= 90) {
            rating = 'A級';
            ratingClass = 'text-green-400';
        } else if (wpm >= 40 && accuracy >= 85) {
            rating = 'B級';
            ratingClass = 'text-blue-400';
        } else if (wpm >= 20 && accuracy >= 80) {
            rating = 'C級';
            ratingClass = 'text-orange-400';
        } else {
            rating = 'D級';
            ratingClass = 'text-red-400';
        }
        
        ratingElement.textContent = rating;
        ratingElement.className = `text-2xl font-bold ${ratingClass}`;
    }

    saveTimeAttackResults() {
        // Save to user stats
        if (window.userStats) {
            window.userStats.totalSessions++;
            window.userStats.totalTime += this.duration;
            
            // Update best WPM if better
            if (this.sessionData.wpm > window.userStats.bestWPM) {
                window.userStats.bestWPM = this.sessionData.wpm;
            }
            
            // Update best accuracy if better
            if (this.sessionData.accuracy > window.userStats.bestAccuracy) {
                window.userStats.bestAccuracy = this.sessionData.accuracy;
            }
            
            // Calculate average WPM
            const totalSessions = window.userStats.totalSessions;
            const currentTotal = window.userStats.avgWPM * (totalSessions - 1);
            window.userStats.avgWPM = (currentTotal + this.sessionData.wpm) / totalSessions;
            
            // Add XP based on performance
            const xpGained = this.calculateXPGain();
            window.userStats.xp += xpGained;
            
            // Save data
            if (window.saveUserData) {
                window.saveUserData();
            }
            
            // Update UI
            if (window.updateUI) {
                window.updateUI();
            }
            
            // Check achievements
            if (window.achievementSystem) {
                window.achievementSystem.checkAchievements(window.userStats);
            }
            
            _logger.debug(`Time attack results saved. XP gained: ${xpGained}`);
        }
    }

    calculateXPGain() {
        const wpm = this.sessionData.wpm;
        const accuracy = this.sessionData.accuracy;
        const combo = this.sessionData.maxCombo;
        
        let xp = 10; // Base XP
        
        // WPM bonus
        if (wpm >= 80) xp += 50;
        else if (wpm >= 60) xp += 30;
        else if (wpm >= 40) xp += 20;
        else if (wpm >= 20) xp += 10;
        
        // Accuracy bonus
        if (accuracy >= 95) xp += 30;
        else if (accuracy >= 90) xp += 20;
        else if (accuracy >= 85) xp += 10;
        
        // Combo bonus
        if (combo >= 50) xp += 20;
        else if (combo >= 20) xp += 10;
        
        return xp;
    }

    // 簡易ローマ字変換（ひらがな・カタカナのみ対応、実用上は外部ライブラリ推奨）
    romanizeJapanese(text) {
        if (window.wanakana) {
            return window.wanakana.toRomaji(text);
        }
        return text;
    }

    startTypingSession() {
        // 全惑星のテキストを集約
        let texts = [];
        if (
            window.languageManager &&
            window.languageManager.practiceTexts &&
            window.languageManager.practiceTexts.ja &&
            window.languageManager.practiceTexts.ja.planets
        ) {
            const planets = window.languageManager.practiceTexts.ja.planets;
            Object.values(planets).forEach(planet => {
                if (Array.isArray(planet.texts)) {
                    texts = texts.concat(planet.texts.map(t => t.content || t.text).filter(Boolean));
                }
            });
        }
        if (!Array.isArray(texts) || texts.length === 0) {
            texts = ["Let's type!"];
        }
        const randomText = texts[Math.floor(Math.random() * texts.length)];
        this.sessionData.currentText = randomText;

        // テキスト表示
        const textDisplay = document.getElementById('timeAttackTextDisplay');
        if (textDisplay) {
            // 日本語テキスト
            textDisplay.textContent = randomText;
            // ローマ字表記を下に追加
            let romanized = this.romanizeJapanese(randomText);
            let romanElem = document.getElementById('timeAttackRomanized');
            if (!romanElem) {
                romanElem = document.createElement('div');
                romanElem.id = 'timeAttackRomanized';
                romanElem.style.fontSize = '0.9em';
                romanElem.style.color = '#888';
                romanElem.style.marginTop = '0.3em';
                textDisplay.parentNode.insertBefore(romanElem, textDisplay.nextSibling);
            }
            romanElem.textContent = romanized;
        }

        // 入力欄を有効化し、フォーカス
        const typingInput = document.getElementById('timeAttackInput');
        if (typingInput) {
            typingInput.value = '';
            typingInput.disabled = false;
            typingInput.focus();
            // 既存のイベントリスナーを必ずremove
            if (this._boundHandleTypingInput) {
                typingInput.removeEventListener('input', this._boundHandleTypingInput);
            }
            this._boundHandleTypingInput = this.handleTypingInput.bind(this);
            typingInput.addEventListener('input', this._boundHandleTypingInput);
        }
    }

    handleTypingInput(event) {
        if (!this.isActive) return;
        
        const input = event.target.value;
        const expectedText = this.sessionData.currentText || '';

        // 日本語→ローマ字変換
        const expectedRomaji = window.wanakana ? window.wanakana.toRomaji(expectedText) : expectedText;

        // 入力長さ分だけ比較
        let errors = 0;
        for (let i = 0; i < input.length; i++) {
            if (i < expectedRomaji.length && input[i] !== expectedRomaji[i]) {
                errors++;
            }
        }
        this.sessionData.totalTyped = input.length;
        this.sessionData.totalErrors = errors;

        // コンボ・リアルタイム統計などはそのまま
        if (errors === 0 && input.length > 0) {
            this.sessionData.combo++;
            this.sessionData.maxCombo = Math.max(this.sessionData.maxCombo, this.sessionData.combo);
        } else {
            this.sessionData.combo = 0;
        }

        this.updateRealTimeStats();

        // サウンド
        if (window.audioManager) {
            if (errors === 0) {
                window.audioManager.playKeySuccess();
            } else {
                window.audioManager.playKeyError();
            }
        }
    }

    updateRealTimeStats() {
        const timeElapsed = (Date.now() - this.startTime) / 1000 / 60; // minutes
        const totalTyped = this.sessionData.totalTyped;
        
        // Calculate real-time WPM
        this.sessionData.wpm = timeElapsed > 0 ? Math.round((totalTyped / 5) / timeElapsed) : 0;
        
        // Calculate real-time accuracy
        this.sessionData.accuracy = totalTyped > 0 ? Math.round(((totalTyped - this.sessionData.totalErrors) / totalTyped) * 100) : 100;
        
        // Update display
        this.updateSessionStats();
    }

    resetTimeAttack() {
        this.isActive = false;
        this.remainingTime = this.duration;

        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }

        // Reset session data
        this.sessionData = {
            wpm: 0,
            accuracy: 100,
            totalTyped: 0,
            totalErrors: 0,
            combo: 0,
            maxCombo: 0
        };

        // Reset UI
        this.updateTimeDisplay();
        this.updateSessionStats();
        // 残り時間表示も初期値にリセット
        const timeDisplay = document.getElementById('timeAttackTimer');
        if (timeDisplay) {
            const minutes = Math.floor(this.duration / 60);
            const seconds = this.duration % 60;
            timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        // テキスト欄・入力欄もリセット
        const textDisplay = document.getElementById('timeAttackTextDisplay');
        if (textDisplay) {
            textDisplay.textContent = '';
        }
        const typingInput = document.getElementById('timeAttackInput');
        if (typingInput) {
            typingInput.value = '';
            typingInput.disabled = true;
            if (this._boundHandleTypingInput) {
                typingInput.removeEventListener('input', this._boundHandleTypingInput);
            }
        }

        // Show mission selection
        const missionSection = document.getElementById('missionSelection');
        if (missionSection) {
            missionSection.classList.remove('hidden');
        }

        // Hide time attack interfaces
        const timeAttackInterface = document.getElementById('timeAttackInterface');
        const resultsPanel = document.getElementById('timeAttackResults');

        if (timeAttackInterface) {
            timeAttackInterface.classList.add('hidden');
        }

        if (resultsPanel) {
            resultsPanel.classList.add('hidden');
        }

        _logger.debug('Time attack reset');
    }

    getTimeOptions() {
        return this.timeOptions;
    }

    getCurrentSession() {
        return this.sessionData;
    }

    isTimeAttackActive() {
        return this.isActive;
    }
} 