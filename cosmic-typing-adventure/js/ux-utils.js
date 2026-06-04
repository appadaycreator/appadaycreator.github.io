// User Experience utilities for Cosmic Typing Adventure

// Progressive enhancement utilities
const _logger = window.logger || { debug: () => {}, info: () => {}, warn: console.warn, error: console.error };
const ProgressiveEnhancement = {
    // Check browser capabilities
    checkCapabilities() {
        return {
            localStorage: !!window.localStorage,
            sessionStorage: !!window.sessionStorage,
            webWorkers: !!window.Worker,
            serviceWorkers: 'serviceWorker' in navigator,
            pushNotifications: 'PushManager' in window,
            geolocation: 'geolocation' in navigator,
            webGL: !!window.WebGLRenderingContext,
            canvas: !!document.createElement('canvas').getContext,
            audio: !!window.AudioContext,
            video: !!document.createElement('video').canPlayType,
            touch: 'ontouchstart' in window,
            pointer: 'onpointerdown' in window,
            intersectionObserver: 'IntersectionObserver' in window,
            mutationObserver: 'MutationObserver' in window,
            performanceObserver: 'PerformanceObserver' in window
        };
    },

    // Apply progressive enhancement
    applyEnhancement() {
        const capabilities = this.checkCapabilities();
        
        // Apply features based on capabilities
        if (capabilities.localStorage) {
            this.enablePersistentFeatures();
        }
        
        if (capabilities.intersectionObserver) {
            this.enableLazyLoading();
        }
        
        if (capabilities.touch || capabilities.pointer) {
            this.enableTouchFeatures();
        }
        
        if (capabilities.performanceObserver) {
            this.enablePerformanceMonitoring();
        }
        
        // Always enable basic features
        this.enableBasicFeatures();
    },

    // Enable persistent features
    enablePersistentFeatures() {
        // User preferences
        const savedPreferences = localStorage.getItem('userPreferences');
        if (savedPreferences) {
            try {
                const preferences = JSON.parse(savedPreferences);
                this.applyUserPreferences(preferences);
            } catch (error) {
                _logger.warn('Failed to load user preferences:', error);
            }
        }
        
        // Typing history
        const savedHistory = localStorage.getItem('typingHistory');
        if (savedHistory) {
            try {
                const history = JSON.parse(savedHistory);
                this.loadTypingHistory(history);
            } catch (error) {
                _logger.warn('Failed to load typing history:', error);
            }
        }
    },

    // Enable lazy loading
    enableLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    },

    // Enable touch features
    enableTouchFeatures() {
        // Touch-friendly button sizing
        const buttons = document.querySelectorAll('button, .btn');
        buttons.forEach(btn => {
            btn.style.minHeight = '44px';
            btn.style.minWidth = '44px';
        });
        
        // Touch-friendly input sizing
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.style.minHeight = '44px';
        });
    },

    // Enable performance monitoring
    enablePerformanceMonitoring() {
        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                if (entry.entryType === 'navigation') {
                    _logger.debug('Page load time:', entry.loadEventEnd - entry.loadEventStart);
                }
            });
        });
        
        observer.observe({ entryTypes: ['navigation', 'resource'] });
    },

    // Enable basic features
    enableBasicFeatures() {
        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Error handling
        this.setupErrorHandling();
        
        // Loading states
        this.setupLoadingStates();
    }
};

// User preferences management
const UserPreferences = {
    // Save user preferences
    savePreferences(preferences) {
        try {
            localStorage.setItem('userPreferences', JSON.stringify(preferences));
            return true;
        } catch (error) {
            _logger.error('Failed to save preferences:', error);
            return false;
        }
    },

    // Load user preferences
    loadPreferences() {
        try {
            const saved = localStorage.getItem('userPreferences');
            return saved ? JSON.parse(saved) : this.getDefaultPreferences();
        } catch (error) {
            _logger.error('Failed to load preferences:', error);
            return this.getDefaultPreferences();
        }
    },

    // Get default preferences
    getDefaultPreferences() {
        return {
            theme: 'auto',
            fontSize: 'medium',
            soundEnabled: true,
            vibrationEnabled: true,
            autoSave: true,
            showProgress: true,
            showTimer: true,
            showWPM: true,
            showAccuracy: true,
            difficulty: 'medium',
            language: 'ja'
        };
    },

    // Apply user preferences
    applyUserPreferences(preferences) {
        // Apply theme
        if (preferences.theme !== 'auto') {
            document.body.setAttribute('data-theme', preferences.theme);
        }
        
        // Apply font size
        document.body.setAttribute('data-font-size', preferences.fontSize);
        
        // Apply sound settings
        if (!preferences.soundEnabled) {
            document.body.classList.add('sound-disabled');
        }
        
        // Apply vibration settings
        if (!preferences.vibrationEnabled) {
            document.body.classList.add('vibration-disabled');
        }
        
        // Apply display settings
        if (!preferences.showProgress) {
            document.body.classList.add('hide-progress');
        }
        
        if (!preferences.showTimer) {
            document.body.classList.add('hide-timer');
        }
        
        if (!preferences.showWPM) {
            document.body.classList.add('hide-wpm');
        }
        
        if (!preferences.showAccuracy) {
            document.body.classList.add('hide-accuracy');
        }
    }
};

// Feedback and notifications
const FeedbackUtils = {
    // Show success message
    showSuccess(message, duration = 3000) {
        this.showNotification(message, 'success', duration);
    },

    // Show error message
    showError(message, duration = 5000) {
        this.showNotification(message, 'error', duration);
    },

    // Show info message
    showInfo(message, duration = 3000) {
        this.showNotification(message, 'info', duration);
    },

    // Show warning message
    showWarning(message, duration = 4000) {
        this.showNotification(message, 'warning', duration);
    },

    // Show notification
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close" aria-label="閉じる">×</button>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Auto remove
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
        
        // Manual close
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
    },

    // Get notification icon
    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    },

    // Provide haptic feedback
    provideHapticFeedback(type = 'light') {
        if ('vibrate' in navigator && !document.body.classList.contains('vibration-disabled')) {
            const patterns = {
                light: 50,
                medium: 100,
                heavy: 200,
                success: [50, 50, 50],
                error: [100, 50, 100]
            };
            
            const pattern = patterns[type] || patterns.light;
            navigator.vibrate(pattern);
        }
    },

    // Provide audio feedback
    provideAudioFeedback(type = 'click') {
        if (document.body.classList.contains('sound-disabled')) return;
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        const frequencies = {
            click: 800,
            success: 1000,
            error: 400,
            warning: 600
        };
        
        oscillator.frequency.setValueAtTime(frequencies[type] || frequencies.click, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }
};

// Loading and progress indicators
const LoadingUtils = {
    // Show loading spinner
    showLoading(message = '読み込み中...') {
        const spinner = document.createElement('div');
        spinner.className = 'loading-overlay';
        spinner.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p class="loading-message">${message}</p>
            </div>
        `;
        
        document.body.appendChild(spinner);
        
        // Animate in
        setTimeout(() => {
            spinner.classList.add('show');
        }, 10);
        
        return spinner;
    },

    // Hide loading spinner
    hideLoading(spinner) {
        if (spinner) {
            spinner.classList.remove('show');
            setTimeout(() => {
                if (spinner.parentNode) {
                    spinner.parentNode.removeChild(spinner);
                }
            }, 300);
        }
    },

    // Show progress bar
    showProgress(container, initialValue = 0) {
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-container';
        progressBar.innerHTML = `
            <div class="progress-bar">
                <div class="progress-fill" style="transform: scaleX(${initialValue / 100})"></div>
            </div>
            <div class="progress-text">${initialValue}%</div>
        `;
        
        container.appendChild(progressBar);
        
        return {
            update: (value) => {
                const fill = progressBar.querySelector('.progress-fill');
                const text = progressBar.querySelector('.progress-text');
                
                fill.style.transform = `scaleX(${value / 100})`;
                text.textContent = `${value}%`;
            },
            remove: () => {
                if (progressBar.parentNode) {
                    progressBar.parentNode.removeChild(progressBar);
                }
            }
        };
    }
};

// Keyboard shortcuts
const KeyboardShortcuts = {
    // Setup keyboard shortcuts
    setupShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Escape: Close modals, go back
            if (event.key === 'Escape') {
                this.handleEscape();
            }
            
            // Ctrl/Cmd + S: Save
            if ((event.ctrlKey || event.metaKey) && event.key === 's') {
                event.preventDefault();
                this.handleSave();
            }
            
            // Ctrl/Cmd + R: Reset
            if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
                event.preventDefault();
                this.handleReset();
            }
            
            // Space: Start/stop typing
            if (event.key === ' ' && !event.target.matches('input, textarea')) {
                event.preventDefault();
                this.handleSpace();
            }
        });
    },

    // Handle escape key
    handleEscape() {
        const modal = document.querySelector('.modal.show');
        if (modal) {
            this.closeModal(modal);
        } else {
            // Go back to planet selection
            const typingPractice = document.querySelector('.typing-practice');
            if (typingPractice && typingPractice.style.display !== 'none') {
                this.goBackToPlanets();
            }
        }
    },

    // Handle save
    handleSave() {
        // Save current progress
        if (window.typingEngine && window.typingEngine.isActive) {
            const stats = window.typingEngine.getStats();
            this.saveProgress(stats);
            FeedbackUtils.showSuccess('進捗を保存しました');
        }
    },

    // Handle reset
    handleReset() {
        if (window.typingEngine) {
            window.typingEngine.reset();
            FeedbackUtils.showInfo('タイピングをリセットしました');
        }
    },

    // Handle space key
    handleSpace() {
        const startBtn = document.getElementById('start-btn');
        if (startBtn && !startBtn.disabled) {
            startBtn.click();
        }
    },

    // Close modal
    closeModal(modal) {
        modal.classList.remove('show');
        FeedbackUtils.provideHapticFeedback('light');
    },

    // Go back to planets
    goBackToPlanets() {
        const planetSelection = document.querySelector('.planet-selection');
        const typingPractice = document.querySelector('.typing-practice');
        
        if (planetSelection && typingPractice) {
            planetSelection.style.display = 'block';
            typingPractice.style.display = 'none';
            FeedbackUtils.provideHapticFeedback('light');
        }
    },

    // Save progress
    saveProgress(stats) {
        try {
            const progress = {
                timestamp: new Date().toISOString(),
                stats: stats
            };
            
            const savedProgress = localStorage.getItem('typingProgress');
            const progressHistory = savedProgress ? JSON.parse(savedProgress) : [];
            progressHistory.push(progress);
            
            // Keep only last 10 entries
            if (progressHistory.length > 10) {
                progressHistory.splice(0, progressHistory.length - 10);
            }
            
            localStorage.setItem('typingProgress', JSON.stringify(progressHistory));
        } catch (error) {
            _logger.error('Failed to save progress:', error);
        }
    }
};

// Error handling
const ErrorHandling = {
    // Setup error handling
    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            this.handleError(event.error);
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason);
        });
    },

    // Handle error
    handleError(error) {
        _logger.error('Application error:', error);
        
        const errorMessage = this.getErrorMessage(error);
        FeedbackUtils.showError(errorMessage);
        
        // Log error for analytics
        this.logError(error);
    },

    // Get user-friendly error message
    getErrorMessage(error) {
        if (error.message) {
            return error.message;
        }
        
        if (typeof error === 'string') {
            return error;
        }
        
        return '予期しないエラーが発生しました。ページを再読み込みしてください。';
    },

    // Log error
    logError(error) {
        const errorLog = {
            timestamp: new Date().toISOString(),
            message: error.message || error.toString(),
            stack: error.stack,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        // Store in localStorage for debugging
        try {
            const existingLogs = localStorage.getItem('errorLogs') || '[]';
            const logs = JSON.parse(existingLogs);
            logs.push(errorLog);
            
            // Keep only last 50 errors
            if (logs.length > 50) {
                logs.splice(0, logs.length - 50);
            }
            
            localStorage.setItem('errorLogs', JSON.stringify(logs));
        } catch (e) {
            _logger.error('Failed to log error:', e);
        }
    }
};

// Initialize UX features
const initUX = () => {
    // Apply progressive enhancement
    ProgressiveEnhancement.applyEnhancement();
    
    // Setup keyboard shortcuts
    KeyboardShortcuts.setupShortcuts();
    
    // Setup error handling
    ErrorHandling.setupErrorHandling();
    
    // Apply user preferences
    const preferences = UserPreferences.loadPreferences();
    UserPreferences.applyUserPreferences(preferences);
    
    _logger.debug('UX features initialized');
};

// Export UX utilities for global access
// window.ProgressiveEnhancement = ProgressiveEnhancement;
// window.UserPreferences = UserPreferences;
// window.FeedbackUtils = FeedbackUtils;
// window.LoadingUtils = LoadingUtils;
// window.KeyboardShortcuts = KeyboardShortcuts;
// window.ErrorHandling = ErrorHandling;
// window.initUX = initUX;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUX);
} else {
    initUX();
} 