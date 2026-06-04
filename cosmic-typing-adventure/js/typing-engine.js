// Typing Engine for Cosmic Typing Adventure - Japanese Typing Enhanced Version
// バージョン: 3.0.0
// 最終更新: 2026-01-30

import { logger } from './logger.js';
import { KANA_MAPPING, handleSokuon, handleN } from './kana-mapping.js';

export class TypingEngine {
    constructor(soundManager) {
        this.soundManager = soundManager;
        this.currentText = '';
        this.typedText = '';
        this.currentIndex = 0; // 現在のトークンインデックス
        this.currentInput = ''; // 現在入力中のローマ字バッファ
        this.tokens = []; // トークン化されたかな文字列
        this.startTime = null;
        this.endTime = null;
        this.isActive = false;
        this.errors = new Map(); // Use Map for better performance
        this.totalTyped = 0;
        this.totalErrors = 0;
        this.wpm = 0;
        this.accuracy = 100;

        // DOM elements cache
        this.elements = {
            textDisplay: null,
            typingInput: null,
            wpmDisplay: null,
            accuracyDisplay: null,
            timerDisplay: null,
            progressBar: null,
            inputHintDisplay: null, // 入力候補表示用
            currentInputDisplay: null // 現在の入力表示用
        };

        // Callbacks
        this.callbacks = {
            onProgress: null,
            onComplete: null,
            onError: null
        };

        // Performance optimization
        this.wpmTimer = null;
        this.lastWpmUpdate = 0;
        this.updateThrottle = 100; // ms
        this.lastUpdate = 0;

        // Security features
        this.securityEnabled = true;
        this.inputValidation = true;

        // Debounced update function
        this.debouncedUpdate = this.debounce(this.updateDisplays.bind(this), 50);

        // Game Mode Support
        this.mode = 'normal'; // 'normal', 'survival', 'timeAttack'
        this.lives = 3;
        this.maxLives = 3;
        this.timeLimit = 0; // seconds
        this.timer = null;
    }

    // Debounce function for performance
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Initialize the typing engine
    init(elements) {
        this.elements = { ...this.elements, ...elements };
        this.setupEventListeners();

        // Initialize security if available
        if (window.SecurityUtils) {
            this.securityEnabled = true;
        }
    }

    // Setup event listeners with performance optimization
    setupEventListeners() {
        if (!this.elements.typingInput) return;

        // Use passive listeners where possible
        this.elements.typingInput.addEventListener('input', this.handleInput.bind(this), { passive: true });
        this.elements.typingInput.addEventListener('keydown', this.handleKeydown.bind(this));
        this.elements.typingInput.addEventListener('focus', this.handleFocus.bind(this));
        this.elements.typingInput.addEventListener('blur', this.handleBlur.bind(this));
    }

    // Start typing session with security validation
    start() {
        if (!this.elements.textDisplay || !this.elements.textDisplay.textContent) {
            logger.warn('No text to type');
            return;
        }

        // Validate and sanitize text content
        try {
            this.currentText = this.validateAndSanitizeText(this.elements.textDisplay.textContent);
        } catch (error) {
            logger.error('Text validation failed:', error.message);
            this.handleSecurityError('Invalid text content', error);
            return;
        }

        this.tokenizeText(); // Tokenize Japanese text

        this.typedText = '';
        this.currentIndex = 0; // Index of current token
        this.currentInput = ''; // Current buffer for partial matches
        this.errors.clear();
        this.totalTyped = 0;
        this.totalErrors = 0;
        this.wpm = 0;
        this.accuracy = 100;
        this.isActive = true;
        this.startTime = Date.now();
        this.lastWpmUpdate = this.startTime;

        this.displayText();
        this.updateProgress();
        this.startWpmTimer();

        if (this.elements.typingInput) {
            this.elements.typingInput.disabled = false;
            this.elements.typingInput.focus();
        }

        // Mode specific initialization
        if (this.mode === 'survival') {
            this.lives = this.maxLives;
            this.updateLivesDisplay();
            
            // Show survival UI
            if (this.elements.survivalLivesContainer) {
                this.elements.survivalLivesContainer.classList.remove('hidden');
            }
        } else {
            // Hide survival UI for other modes
            if (this.elements.survivalLivesContainer) {
                this.elements.survivalLivesContainer.classList.add('hidden');
            }
        }
        
        // Time Attack mode initialization
        if (this.mode === 'timeAttack') {
            if (this.timeLimit > 0 && this.elements.timerDisplay) {
                const minutes = Math.floor(this.timeLimit / 60);
                const seconds = this.timeLimit % 60;
                this.elements.timerDisplay.textContent =
                    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }
    }

    /**
     * テキストを かなトークン に分解する（改良版）
     * 最長一致アルゴリズムを使用して、複雑な拗音や特殊音も正しく処理
     */
    tokenizeText() {
        this.tokens = [];
        const text = this.currentText;
        const mapping = KANA_MAPPING || {};
        
        // 最大マッチング長を決定（マッピングテーブルから）
        const maxLength = Math.max(...Object.keys(mapping).map(k => k.length));
        
        let i = 0;
        while (i < text.length) {
            let bestMatch = null;
            let matchLen = 0;
            
            // 最長一致を探す（長い方から試す）
            for (let len = Math.min(maxLength, text.length - i); len >= 1; len--) {
                const substr = text.substr(i, len);
                if (mapping[substr]) {
                    bestMatch = { kana: substr, patterns: [...mapping[substr]] };
                    matchLen = len;
                    break;
                }
            }
            
            // マッチしない場合はそのまま1文字として扱う
            if (!bestMatch) {
                const char = text[i];
                // 英数字や記号はそのまま通す
                bestMatch = { kana: char, patterns: [char] };
                matchLen = 1;
            }
            
            // 促音（っ）の特殊処理
            if (bestMatch.kana === 'っ' || bestMatch.kana === 'ッ') {
                const nextKana = text[i + matchLen];
                if (nextKana && mapping[nextKana]) {
                    bestMatch.patterns = handleSokuon(nextKana);
                }
            }
            
            // 「ん」の特殊処理
            if (bestMatch.kana === 'ん' || bestMatch.kana === 'ン') {
                const nextKana = text[i + matchLen];
                bestMatch.patterns = handleN(nextKana);
            }
            
            this.tokens.push({
                ...bestMatch,
                isComplete: false,
                isError: false,
                input: '', // ユーザーが入力したローマ字
                matchedPattern: null // マッチしたパターン
            });
            
            i += matchLen;
        }
        
        logger.debug('Tokenized text:', this.tokens);
    }

    /**
     * キー入力処理（改良版）
     * 日本語ローマ字入力の柔軟なマッチングをサポート
     */
    handleInput(event) {
        if (!this.isActive) return;

        const input = event.target.value;
        
        // バックスペース処理
        if (input.length < this.currentInput.length) {
            this.currentInput = input;
            this.displayText();
            this.updateInputHint();
            return;
        }
        
        // 新しい文字が入力された
        if (input.length === 0) {
            this.currentInput = '';
            this.displayText();
            this.updateInputHint();
            return;
        }

        // 現在のトークンをチェック
        if (this.currentIndex >= this.tokens.length) {
            // 全て完了
            return;
        }

        const token = this.tokens[this.currentIndex];
        const inputChar = input.slice(-1); // 最後に入力された文字
        const nextInput = this.currentInput + inputChar;

        // セキュリティバリデーション
        if (this.securityEnabled && this.inputValidation) {
            try {
                this.validateInput(nextInput);
            } catch (error) {
                this.handleSecurityError('suspicious_input', error);
                return;
            }
        }

        // パターンマッチング
        const validPatterns = token.patterns.filter(p => p.startsWith(nextInput));
        const completePatterns = token.patterns.filter(p => p === nextInput);

        if (validPatterns.length > 0) {
            // 有効な入力
            this.currentInput = nextInput;
            this.totalTyped++;
            
            // サウンドフィードバック
            if (this.soundManager) {
                this.soundManager.play('type');
            }

            if (completePatterns.length > 0) {
                // トークン完成
                token.isComplete = true;
                token.input = this.currentInput;
                token.matchedPattern = completePatterns[0];
                token.isError = false;
                
                // 次のトークンへ
                this.currentIndex++;
                this.currentInput = '';
                
                // 入力フィールドをクリア
                event.target.value = '';
                
                // 全トークン完成チェック
                if (this.currentIndex >= this.tokens.length) {
                    this.complete();
                    return;
                }
            }
        } else {
            // 無効な入力（エラー）
            this.totalErrors++;
            token.isError = true;
            this.addError(this.currentIndex, token.kana, inputChar);

            // エラーサウンド
            if (this.soundManager) {
                this.soundManager.play('error');
            }

            // 入力欄の赤フラッシュエフェクト
            if (event.target) {
                event.target.classList.add('input-error-flash');
                setTimeout(() => event.target.classList.remove('input-error-flash'), 300);
            }

            // サバイバルモードの処理
            if (this.mode === 'survival') {
                this.lives--;
                this.updateLivesDisplay();
                if (this.lives <= 0) {
                    this.complete({ cause: 'death' });
                    return;
                }
            }

            // エラー後は入力をリセット
            this.currentInput = '';
            event.target.value = '';
        }

        // 表示更新
        this.displayText();
        this.updateProgress();
        this.updateInputHint();
        this.debouncedUpdate();
    }

    /**
     * テキスト表示の更新（改良版）
     * 入力済み=緑、現在=青、未入力=灰色、エラー=赤の色分け
     */
    displayText() {
        if (!this.elements.textDisplay) return;

        let html = '';
        this.tokens.forEach((token, idx) => {
            let className = '';
            let style = '';
            
            if (token.isComplete) {
                // 入力済み = 緑
                className = 'correct-char';
                style = 'color: #10b981; font-weight: 600;';
            } else if (idx === this.currentIndex) {
                if (token.isError) {
                    // エラー = 赤（シェイクアニメーション付き）
                    className = 'incorrect-char shake-animation';
                    style = 'color: #ef4444; font-weight: 700; text-decoration: underline wavy;';
                } else {
                    // 現在入力中 = 青
                    className = 'current-char';
                    style = 'color: #3b82f6; font-weight: 700; background: rgba(59, 130, 246, 0.1); padding: 2px 4px; border-radius: 4px;';
                }
            } else if (idx > this.currentIndex) {
                // 未入力 = 灰色
                className = 'pending-char';
                style = 'color: #9ca3af;';
            }

            const displayChar = this.escapeHtml(token.kana);
            html += `<span class="${className}" style="${style}">${displayChar}</span>`;
        });

        // 安全なHTML挿入
        if (this.securityEnabled && window.XSSProtection) {
            try {
                window.XSSProtection.safeInnerHTML(this.elements.textDisplay, html);
            } catch (error) {
                this.handleSecurityError('xss_prevention', error);
                this.elements.textDisplay.textContent = this.currentText;
            }
        } else {
            this.elements.textDisplay.innerHTML = html;
        }

        // オートスクロール
        this.autoScroll();
    }

    /**
     * 自動スクロール処理
     */
    autoScroll() {
        if (!this.elements.textDisplay) return;
        
        const currentElement = this.elements.textDisplay.querySelector('.current-char');
        if (currentElement) {
            currentElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'center'
            });
        }
    }

    /**
     * 入力候補のヒント表示
     */
    updateInputHint() {
        if (this.currentIndex >= this.tokens.length) {
            if (this.elements.inputHintDisplay) {
                this.elements.inputHintDisplay.innerHTML = '';
                this.elements.inputHintDisplay.classList.add('hidden');
            }
            if (this.elements.currentInputDisplay) {
                this.elements.currentInputDisplay.innerHTML = '';
                this.elements.currentInputDisplay.classList.add('hidden');
            }
            return;
        }

        const token = this.tokens[this.currentIndex];

        // 現在の入力を表示（ダークテーマ対応カラー）
        if (this.elements.currentInputDisplay) {
            const currentHtml = `
                <div class="text-sm text-gray-300">
                    <span class="font-semibold text-gray-400">現在の入力:</span>
                    <span class="ml-2 text-cosmic-cyan font-mono text-lg">${this.currentInput || '(入力待ち)'}</span>
                </div>
            `;
            this.elements.currentInputDisplay.innerHTML = currentHtml;
            this.elements.currentInputDisplay.classList.remove('hidden');
        }

        // 入力候補を表示（ダークテーマ対応カラー）
        if (this.elements.inputHintDisplay) {
            const validPatterns = token.patterns.filter(p =>
                p.startsWith(this.currentInput)
            );

            let hintHtml = '<div class="text-sm">';
            hintHtml += '<span class="font-semibold text-gray-400">入力候補:</span>';
            hintHtml += '<div class="flex flex-wrap gap-2 mt-1">';

            validPatterns.slice(0, 5).forEach(pattern => {
                const remaining = pattern.substring(this.currentInput.length);
                hintHtml += `
                    <span class="inline-flex items-center px-2 py-1 rounded bg-gray-700 text-gray-200 font-mono text-xs">
                        <span class="text-gray-500">${this.currentInput}</span><span class="font-bold text-cosmic-cyan">${remaining}</span>
                    </span>
                `;
            });

            if (validPatterns.length > 5) {
                hintHtml += `<span class="text-gray-500 text-xs">他 ${validPatterns.length - 5} パターン</span>`;
            }

            hintHtml += '</div></div>';
            this.elements.inputHintDisplay.innerHTML = hintHtml;
            this.elements.inputHintDisplay.classList.remove('hidden');
        }
    }

    updateLivesDisplay() {
        // Callback or direct DOM manipulation if elements provided
        if (this.elements.survivalLivesDisplay) {
            let hearts = '';
            for (let i = 0; i < this.maxLives; i++) {
                if (i < this.lives) {
                    hearts += '<span>❤️</span> ';
                } else {
                    hearts += '<span style="opacity:0.4">🤍</span> ';
                }
            }
            this.elements.survivalLivesDisplay.innerHTML = hearts;
            
            // アニメーション効果
            if (this.elements.survivalLivesDisplay.parentElement) {
                this.elements.survivalLivesDisplay.parentElement.style.animation = 'none';
                setTimeout(() => {
                    if (this.elements.survivalLivesDisplay && this.elements.survivalLivesDisplay.parentElement) {
                        this.elements.survivalLivesDisplay.parentElement.style.animation = 'shake 0.5s ease-in-out';
                    }
                }, 10);
            }
        }
    }

    // Validate and sanitize text content
    validateAndSanitizeText(text) {
        if (!this.securityEnabled || !window.SecurityUtils) {
            return text;
        }

        try {
            return window.SecurityUtils.validateTypingText(text);
        } catch (error) {
            throw new Error(`Text validation failed: ${error.message}`);
        }
    }

    // Handle security errors
    handleSecurityError(type, error) {
        if (window.SecurityMonitoring) {
            window.SecurityMonitoring.logSecurityEvent({
                type: type,
                details: { error: error.message }
            });
        }

        if (this.callbacks.onError) {
            this.callbacks.onError({
                type: 'security',
                message: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    // Stop typing session
    stop() {
        this.isActive = false;
        this.endTime = Date.now();

        if (this.wpmTimer) {
            clearInterval(this.wpmTimer);
            this.wpmTimer = null;
        }

        if (this.elements.typingInput) {
            this.elements.typingInput.disabled = true;
        }

        this.calculateFinalStats();
    }

    // Reset typing session
    reset() {
        this.stop();
        this.currentText = '';
        this.typedText = '';
        this.currentIndex = 0;
        this.currentInput = '';
        this.tokens = [];
        this.errors.clear();
        this.totalTyped = 0;
        this.totalErrors = 0;
        this.wpm = 0;
        this.accuracy = 100;

        this.displayText();
        this.updateProgress();
        this.updateDisplays();
        this.updateInputHint();

        if (this.elements.typingInput) {
            this.elements.typingInput.value = '';
        }
    }

    // Validate input for security
    validateInput(input) {
        if (!this.securityEnabled || !window.SecurityUtils) {
            return;
        }

        // Check for suspicious patterns
        if (window.SecurityMonitoring && window.SecurityMonitoring.detectSuspiciousActivity(input)) {
            throw new Error('Suspicious input detected');
        }

        // Validate input length
        if (input.length > this.currentText.length * 2) {
            throw new Error('Input length exceeds reasonable limit');
        }

        // Check for XSS patterns
        if (window.XSSProtection && window.XSSProtection.detectXSS(input)) {
            throw new Error('Potentially harmful content detected');
        }
    }

    // Handle keydown events
    handleKeydown(event) {
        if (!this.isActive) return;

        // Prevent default behavior for certain keys
        if (event.key === 'Tab') {
            event.preventDefault();
        }

        // Handle special keys
        switch (event.key) {
            case 'Escape':
                event.preventDefault();
                this.reset();
                break;
            case 'F5':
                event.preventDefault();
                break;
        }
    }

    // Handle focus events
    handleFocus() {
        if (this.isActive && !this.startTime) {
            this.startTime = Date.now();
            this.lastWpmUpdate = this.startTime;
            this.startWpmTimer();
        }
    }

    // Handle blur events
    handleBlur() {
        // Optional: pause timer when input loses focus
    }

    // Handle backspace with optimization
    handleBackspace(newLength) {
        const deletedChars = this.typedText.length - newLength;
        this.typedText = this.typedText.slice(0, newLength);
        this.currentIndex = Math.max(0, this.currentIndex - deletedChars);

        // Recalculate errors after backspace
        this.recalculateErrors();
        this.updateProgress();
        this.debouncedUpdate();
    }

    // Add error with Map optimization
    addError(index, expected, actual) {
        this.errors.set(index, { expected, actual });
    }

    // Remove error with Map optimization
    removeError(index) {
        this.errors.delete(index);
    }

    // Recalculate errors after backspace (simplified for token-based system)
    recalculateErrors() {
        this.errors.clear();
        this.totalErrors = 0;
        
        this.tokens.forEach((token, idx) => {
            if (token.isError) {
                this.totalErrors++;
                this.errors.set(idx, {
                    expected: token.kana,
                    actual: token.input || ''
                });
            }
        });
    }

    // Escape HTML for security
    escapeHtml(text) {
        if (!this.securityEnabled || !window.XSSProtection) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        return window.XSSProtection.sanitizeForDisplay(text);
    }

    // Update progress with throttling
    updateProgress() {
        const now = Date.now();
        if (now - this.lastUpdate < this.updateThrottle) return;

        this.lastUpdate = now;
        this.displayText();

        if (this.elements.progressBar) {
            const progress = (this.currentIndex / this.currentText.length) * 100;
            this.elements.progressBar.style.width = `${progress}%`;
        }
    }

    // Update displays with throttling
    updateDisplays() {
        const now = Date.now();
        if (now - this.lastUpdate < this.updateThrottle) return;

        this.lastUpdate = now;
        this.updateWpmDisplay();
        this.updateAccuracyDisplay();
        this.updateTimerDisplay();

        // Call progress callback
        if (this.callbacks.onProgress) {
            this.callbacks.onProgress(this.getStats());
        }
    }

    // Update WPM display
    updateWpmDisplay() {
        if (this.elements.wpmDisplay) {
            this.elements.wpmDisplay.textContent = this.wpm.toFixed(1);
        }
    }

    // Update accuracy display
    updateAccuracyDisplay() {
        if (this.elements.accuracyDisplay) {
            this.elements.accuracyDisplay.textContent = this.accuracy.toFixed(1);
        }
    }

    // Update timer display
    updateTimerDisplay() {
        if (this.elements.timerDisplay && this.startTime) {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            this.elements.timerDisplay.textContent =
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    // Start WPM timer with optimization
    startWpmTimer() {
        if (this.wpmTimer) {
            clearInterval(this.wpmTimer);
        }

        this.wpmTimer = setInterval(() => {
            this.calculateWpm();
            this.calculateAccuracy();

            // Time Attack Logic
            if (this.mode === 'timeAttack' && this.isActive) {
                const elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
                const remaining = Math.max(0, this.timeLimit - elapsedSeconds);

                if (this.elements.timerDisplay) {
                    // Update timer display for countdown
                    const minutes = Math.floor(remaining / 60);
                    const seconds = remaining % 60;
                    this.elements.timerDisplay.textContent =
                        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                }

                if (remaining <= 0) {
                    this.complete({ cause: 'timeout' });
                }
            }
        }, 1000); // Update every second instead of more frequently
    }

    // Calculate WPM with optimization
    calculateWpm() {
        if (!this.startTime) return;

        const elapsedMinutes = (Date.now() - this.startTime) / 60000;
        if (elapsedMinutes > 0) {
            // Calculate words (5 characters = 1 word)
            const words = this.totalTyped / 5;
            this.wpm = words / elapsedMinutes;
        }
    }

    // Calculate accuracy with optimization
    calculateAccuracy() {
        if (this.totalTyped > 0) {
            this.accuracy = ((this.totalTyped - this.totalErrors) / this.totalTyped) * 100;
        }
    }

    // Calculate final stats
    calculateFinalStats() {
        this.calculateWpm();
        this.calculateAccuracy();
    }

    // Complete typing session
    complete(options = {}) {
        this.stop();

        if (this.callbacks.onComplete) {
            const results = {
                ...this.getResults(),
                ...options
            };
            this.callbacks.onComplete(results);
        }
    }

    // Get current stats
    getStats() {
        return {
            wpm: this.wpm,
            accuracy: this.accuracy,
            totalTyped: this.totalTyped,
            totalErrors: this.totalErrors,
            elapsedTime: this.elements.timerDisplay ? this.elements.timerDisplay.textContent : '00:00',
            progress: (this.currentIndex / this.currentText.length) * 100
        };
    }

    // Get final results with security validation
    getResults() {
        const results = {
            wpm: this.wpm,
            accuracy: this.accuracy,
            totalTyped: this.totalTyped,
            totalErrors: this.totalErrors,
            duration: this.endTime ? (this.endTime - this.startTime) / 1000 : 0,
            cpm: this.getCpm(),
            errorRate: this.getErrorRate()
        };

        // Validate results if security is enabled
        if (this.securityEnabled && window.DataValidation) {
            try {
                return window.DataValidation.validateTypingSession({
                    text: this.currentText,
                    wpm: results.wpm,
                    accuracy: results.accuracy,
                    duration: results.duration
                });
            } catch (error) {
                this.handleSecurityError('invalid_results', error);
                return results; // Return original results if validation fails
            }
        }

        return results;
    }

    // Set callbacks
    setCallbacks(callbacks) {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }

    // Pause typing session
    pause() {
        if (this.isActive) {
            this.isActive = false;
            if (this.wpmTimer) {
                clearInterval(this.wpmTimer);
                this.wpmTimer = null;
            }
        }
    }

    // Resume typing session
    resume() {
        if (!this.isActive && this.startTime) {
            this.isActive = true;
            this.startWpmTimer();
        }
    }

    // Check if typing is complete
    isComplete() {
        return this.currentIndex >= this.currentText.length;
    }

    // Get CPM (Characters Per Minute)
    getCpm() {
        if (!this.startTime) return 0;

        const elapsedMinutes = (Date.now() - this.startTime) / 60000;
        return elapsedMinutes > 0 ? this.totalTyped / elapsedMinutes : 0;
    }

    // Get error rate
    getErrorRate() {
        return this.totalTyped > 0 ? (this.totalErrors / this.totalTyped) * 100 : 0;
    }

    // Get detailed error analysis
    getErrorAnalysis() {
        const errorTypes = new Map();

        this.errors.forEach((error, index) => {
            const key = `${error.expected}->${error.actual}`;
            errorTypes.set(key, (errorTypes.get(key) || 0) + 1);
        });

        return {
            totalErrors: this.totalErrors,
            errorRate: this.getErrorRate(),
            commonErrors: Array.from(errorTypes.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
        };
    }

    // Security configuration
    setSecurityConfig(config) {
        this.securityEnabled = config.securityEnabled !== undefined ? config.securityEnabled : this.securityEnabled;
        this.inputValidation = config.inputValidation !== undefined ? config.inputValidation : this.inputValidation;
    }

    // Get security status
    getSecurityStatus() {
        return {
            securityEnabled: this.securityEnabled,
            inputValidation: this.inputValidation,
            securityUtilsAvailable: !!window.SecurityUtils,
            xssProtectionAvailable: !!window.XSSProtection,
            securityMonitoringAvailable: !!window.SecurityMonitoring
        };
    }
}

// Utility class for text processing
class TypingTextUtils {
    // Calculate text difficulty
    static calculateDifficulty(text) {
        const words = text.split(/\s+/).length;
        const characters = text.length;
        const uniqueChars = new Set(text).size;

        // Simple difficulty calculation
        const avgWordLength = characters / words;
        const complexity = uniqueChars / characters;

        if (avgWordLength > 8 || complexity > 0.8) return 'hard';
        if (avgWordLength > 5 || complexity > 0.6) return 'medium';
        return 'easy';
    }

    // Get text statistics
    static getTextStats(text) {
        const words = text.split(/\s+/).filter(word => word.length > 0);
        const characters = text.length;
        const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);

        return {
            wordCount: words.length,
            characterCount: characters,
            sentenceCount: sentences.length,
            avgWordLength: words.length > 0 ? characters / words.length : 0,
            difficulty: this.calculateDifficulty(text)
        };
    }

    // Clean text for typing
    static cleanText(text) {
        return text.trim().replace(/\s+/g, ' ');
    }

    // Split text into words
    static splitIntoWords(text) {
        return text.split(/\s+/).filter(word => word.length > 0);
    }

    // Get word at position
    static getWordAtPosition(text, position) {
        const words = this.splitIntoWords(text);
        let charCount = 0;

        for (let i = 0; i < words.length; i++) {
            charCount += words[i].length + 1; // +1 for space
            if (charCount > position) {
                return words[i];
            }
        }

        return '';
    }
} 