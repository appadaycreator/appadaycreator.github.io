// Accessibility utilities for Cosmic Typing Adventure

// Screen reader utilities
const _logger = window.logger || { debug: () => {}, info: () => {}, warn: console.warn, error: console.error };
const ScreenReaderUtils = {
    // Announce message to screen readers
    announce(message, priority = 'polite') {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', priority);
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        
        announcement.textContent = message;
        document.body.appendChild(announcement);
        
        // Remove after announcement
        setTimeout(() => {
            if (announcement.parentNode) {
                announcement.parentNode.removeChild(announcement);
            }
        }, 1000);
    },

    // Announce typing progress
    announceTypingProgress(current, total, wpm, accuracy) {
        const progress = Math.round((current / total) * 100);
        const message = `進捗 ${progress}%、WPM ${wpm}、精度 ${accuracy}%`;
        this.announce(message);
    },

    // Announce typing completion
    announceCompletion(results) {
        const message = `タイピング完了。WPM ${results.wpm}、精度 ${results.accuracy}%、総文字数 ${results.totalTyped}、エラー数 ${results.totalErrors}`;
        this.announce(message, 'assertive');
    },

    // Announce errors
    announceError(error) {
        const message = `エラー: ${error}`;
        this.announce(message, 'assertive');
    },

    // Announce planet selection
    announcePlanetSelection(planetName, difficulty) {
        const message = `${planetName}を選択しました。難易度: ${difficulty}`;
        this.announce(message);
    }
};

// Keyboard navigation utilities
const KeyboardNavigationUtils = {
    // Setup keyboard navigation for planet cards
    setupPlanetNavigation() {
        const planetCards = document.querySelectorAll('.planet-card');
        
        planetCards.forEach((card, index) => {
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            card.setAttribute('aria-label', `${card.querySelector('.planet-name').textContent}を選択`);
            
            // Handle Enter and Space key
            card.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    card.click();
                }
            });
            
            // Handle arrow keys for navigation
            card.addEventListener('keydown', (event) => {
                if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                    event.preventDefault();
                    const nextCard = planetCards[index + 1] || planetCards[0];
                    nextCard.focus();
                } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                    event.preventDefault();
                    const prevCard = planetCards[index - 1] || planetCards[planetCards.length - 1];
                    prevCard.focus();
                }
            });
        });
    },

    // Setup keyboard navigation for typing area
    setupTypingNavigation() {
        const typingInput = document.getElementById('typing-input');
        const startBtn = document.getElementById('start-btn');
        const resetBtn = document.getElementById('reset-btn');
        const backBtn = document.getElementById('back-btn');
        
        if (typingInput) {
            typingInput.setAttribute('aria-describedby', 'typing-instructions');
            
            // Add instructions for screen readers
            const instructions = document.createElement('div');
            instructions.id = 'typing-instructions';
            instructions.className = 'sr-only';
            instructions.textContent = 'タイピングを開始するには、開始ボタンを押してください。タイピング中は、表示されたテキストを正確に入力してください。';
            typingInput.parentNode.insertBefore(instructions, typingInput);
        }
        
        // Setup button navigation
        [startBtn, resetBtn, backBtn].forEach(btn => {
            if (btn) {
                btn.addEventListener('keydown', (event) => {
                    if (event.key === 'Tab') {
                        // Allow normal tab navigation
                        return;
                    }
                    
                    // Handle arrow key navigation between buttons
                    const buttons = [startBtn, resetBtn, backBtn].filter(Boolean);
                    const currentIndex = buttons.indexOf(btn);
                    
                    if (event.key === 'ArrowRight') {
                        event.preventDefault();
                        const nextBtn = buttons[currentIndex + 1] || buttons[0];
                        nextBtn.focus();
                    } else if (event.key === 'ArrowLeft') {
                        event.preventDefault();
                        const prevBtn = buttons[currentIndex - 1] || buttons[buttons.length - 1];
                        prevBtn.focus();
                    }
                });
            }
        });
    },

    // Setup focus management
    setupFocusManagement() {
        // Skip link functionality
        const skipLink = document.querySelector('.skip-link');
        if (skipLink) {
            skipLink.addEventListener('click', (event) => {
                event.preventDefault();
                const target = document.querySelector(skipLink.getAttribute('href'));
                if (target) {
                    target.focus();
                    target.scrollIntoView();
                }
            });
        }
        
        // Focus trap for modal-like sections
        this.setupFocusTrap('.typing-practice');
        this.setupFocusTrap('.results');
    },

    // Setup focus trap for specific elements
    setupFocusTrap(selector) {
        const element = document.querySelector(selector);
        if (!element) return;
        
        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        element.addEventListener('keydown', (event) => {
            if (event.key === 'Tab') {
                if (event.shiftKey) {
                    if (document.activeElement === firstElement) {
                        event.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        event.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        });
    }
};

// Color contrast utilities
const ColorContrastUtils = {
    // Calculate relative luminance
    getRelativeLuminance(r, g, b) {
        const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    },

    // Calculate contrast ratio
    getContrastRatio(l1, l2) {
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        return (lighter + 0.05) / (darker + 0.05);
    },

    // Check if colors meet WCAG contrast requirements
    meetsWCAGContrast(color1, color2, level = 'AA') {
        const l1 = this.getRelativeLuminance(...color1);
        const l2 = this.getRelativeLuminance(...color2);
        const ratio = this.getContrastRatio(l1, l2);
        
        const requirements = {
            'AA': { normal: 4.5, large: 3 },
            'AAA': { normal: 7, large: 4.5 }
        };
        
        return ratio >= requirements[level].normal;
    },

    // Apply high contrast mode
    applyHighContrast() {
        document.body.classList.add('high-contrast');
        this.announceHighContrastMode();
    },

    // Remove high contrast mode
    removeHighContrast() {
        document.body.classList.remove('high-contrast');
        this.announceHighContrastMode();
    },

    // Announce contrast mode change
    announceHighContrastMode() {
        const isHighContrast = document.body.classList.contains('high-contrast');
        const message = isHighContrast ? '高コントラストモードを有効にしました' : '高コントラストモードを無効にしました';
        ScreenReaderUtils.announce(message);
    }
};

// Motion and animation utilities
const MotionUtils = {
    // Check if user prefers reduced motion
    prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },

    // Apply reduced motion styles
    applyReducedMotion() {
        if (this.prefersReducedMotion()) {
            document.body.classList.add('reduced-motion');
        }
    },

    // Safe animation function
    safeAnimate(element, animation, duration = 300) {
        if (this.prefersReducedMotion()) {
            // Apply instant change instead of animation
            element.style.transition = 'none';
            animation();
            setTimeout(() => {
                element.style.transition = '';
            }, 10);
        } else {
            // Apply normal animation
            animation();
        }
    }
};

// Text scaling utilities
const TextScalingUtils = {
    // Increase text size
    increaseTextSize() {
        const currentSize = this.getCurrentTextSize();
        const newSize = Math.min(currentSize + 0.1, 2.0);
        this.setTextSize(newSize);
        this.announceTextSizeChange(newSize);
    },

    // Decrease text size
    decreaseTextSize() {
        const currentSize = this.getCurrentTextSize();
        const newSize = Math.max(currentSize - 0.1, 0.8);
        this.setTextSize(newSize);
        this.announceTextSizeChange(newSize);
    },

    // Reset text size
    resetTextSize() {
        this.setTextSize(1.0);
        this.announceTextSizeChange(1.0);
    },

    // Get current text size
    getCurrentTextSize() {
        const root = document.documentElement;
        return parseFloat(getComputedStyle(root).fontSize) / 16;
    },

    // Set text size
    setTextSize(size) {
        const root = document.documentElement;
        root.style.fontSize = `${size}rem`;
        localStorage.setItem('textSize', size.toString());
    },

    // Announce text size change
    announceTextSizeChange(size) {
        const percentage = Math.round(size * 100);
        const message = `文字サイズを${percentage}%に設定しました`;
        ScreenReaderUtils.announce(message);
    },

    // Load saved text size
    loadSavedTextSize() {
        const savedSize = localStorage.getItem('textSize');
        if (savedSize) {
            this.setTextSize(parseFloat(savedSize));
        }
    }
};

// Accessibility preferences management
const AccessibilityPreferences = {
    // Save user preferences
    savePreferences(preferences) {
        localStorage.setItem('accessibilityPreferences', JSON.stringify(preferences));
    },

    // Load user preferences
    loadPreferences() {
        const saved = localStorage.getItem('accessibilityPreferences');
        return saved ? JSON.parse(saved) : this.getDefaultPreferences();
    },

    // Get default preferences
    getDefaultPreferences() {
        return {
            highContrast: false,
            largeText: false,
            reducedMotion: false,
            screenReaderAnnouncements: true,
            keyboardNavigation: true
        };
    },

    // Apply preferences
    applyPreferences(preferences) {
        if (preferences.highContrast) {
            ColorContrastUtils.applyHighContrast();
        }
        
        if (preferences.largeText) {
            TextScalingUtils.setTextSize(1.2);
        }
        
        if (preferences.reducedMotion) {
            MotionUtils.applyReducedMotion();
        }
        
        if (preferences.keyboardNavigation) {
            KeyboardNavigationUtils.setupPlanetNavigation();
            KeyboardNavigationUtils.setupTypingNavigation();
            KeyboardNavigationUtils.setupFocusManagement();
        }
    }
};

// Accessibility testing utilities
const AccessibilityTesting = {
    // Test keyboard navigation
    testKeyboardNavigation() {
        const results = {
            planetCards: false,
            typingArea: false,
            buttons: false,
            focusTrap: false
        };
        
        // Test planet card navigation
        const planetCards = document.querySelectorAll('.planet-card');
        if (planetCards.length > 0) {
            results.planetCards = true;
        }
        
        // Test typing area
        const typingInput = document.getElementById('typing-input');
        if (typingInput && typingInput.getAttribute('aria-describedby')) {
            results.typingArea = true;
        }
        
        // Test button accessibility
        const buttons = document.querySelectorAll('button');
        let accessibleButtons = 0;
        buttons.forEach(btn => {
            if (btn.getAttribute('aria-label') || btn.textContent.trim()) {
                accessibleButtons++;
            }
        });
        results.buttons = accessibleButtons === buttons.length;
        
        return results;
    },

    // Test color contrast
    testColorContrast() {
        const results = {
            textContrast: false,
            linkContrast: false,
            buttonContrast: false
        };
        
        // Test main text contrast
        const mainText = document.querySelector('.text-content');
        if (mainText) {
            const style = getComputedStyle(mainText);
            const textColor = this.parseColor(style.color);
            const bgColor = this.parseColor(style.backgroundColor);
            
            if (textColor && bgColor) {
                const ratio = ColorContrastUtils.getContrastRatio(
                    ColorContrastUtils.getRelativeLuminance(...textColor),
                    ColorContrastUtils.getRelativeLuminance(...bgColor)
                );
                results.textContrast = ratio >= 4.5;
            }
        }
        
        return results;
    },

    // Parse color string to RGB
    parseColor(colorString) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = colorString;
        const color = ctx.fillStyle;
        
        if (color.startsWith('rgb')) {
            const match = color.match(/\d+/g);
            return match ? match.map(Number) : null;
        }
        
        return null;
    },

    // Generate accessibility report
    generateAccessibilityReport() {
        const keyboardResults = this.testKeyboardNavigation();
        const contrastResults = this.testColorContrast();
        
        return {
            keyboardNavigation: keyboardResults,
            colorContrast: contrastResults,
            timestamp: new Date().toISOString(),
            recommendations: this.generateRecommendations(keyboardResults, contrastResults)
        };
    },

    // Generate recommendations
    generateRecommendations(keyboardResults, contrastResults) {
        const recommendations = [];
        
        if (!keyboardResults.planetCards) {
            recommendations.push('惑星カードにキーボードナビゲーションを追加してください');
        }
        
        if (!keyboardResults.typingArea) {
            recommendations.push('タイピングエリアにアクセシビリティ属性を追加してください');
        }
        
        if (!contrastResults.textContrast) {
            recommendations.push('テキストのコントラスト比を改善してください');
        }
        
        return recommendations;
    }
};

// Initialize accessibility features
const initAccessibility = () => {
    // Load saved preferences
    const preferences = AccessibilityPreferences.loadPreferences();
    AccessibilityPreferences.applyPreferences(preferences);
    
    // Load saved text size
    TextScalingUtils.loadSavedTextSize();
    
    // Apply reduced motion if preferred
    MotionUtils.applyReducedMotion();
    
    // Setup keyboard shortcuts
    document.addEventListener('keydown', (event) => {
        // Ctrl/Cmd + = : Increase text size
        if ((event.ctrlKey || event.metaKey) && event.key === '=') {
            event.preventDefault();
            TextScalingUtils.increaseTextSize();
        }
        
        // Ctrl/Cmd + - : Decrease text size
        if ((event.ctrlKey || event.metaKey) && event.key === '-') {
            event.preventDefault();
            TextScalingUtils.decreaseTextSize();
        }
        
        // Ctrl/Cmd + 0 : Reset text size
        if ((event.ctrlKey || event.metaKey) && event.key === '0') {
            event.preventDefault();
            TextScalingUtils.resetTextSize();
        }
        
        // Ctrl/Cmd + H : Toggle high contrast
        if ((event.ctrlKey || event.metaKey) && event.key === 'h') {
            event.preventDefault();
            if (document.body.classList.contains('high-contrast')) {
                ColorContrastUtils.removeHighContrast();
            } else {
                ColorContrastUtils.applyHighContrast();
            }
        }
    });
    
    _logger.debug('Accessibility features initialized');
};

// Export accessibility utilities for global access
// window.ScreenReaderUtils = ScreenReaderUtils;
// window.KeyboardNavigationUtils = KeyboardNavigationUtils;
// window.ColorContrastUtils = ColorContrastUtils;
// window.MotionUtils = MotionUtils;
// window.TextScalingUtils = TextScalingUtils;
// window.AccessibilityPreferences = AccessibilityPreferences;
// window.AccessibilityTesting = AccessibilityTesting;
// window.initAccessibility = initAccessibility;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAccessibility);
} else {
    initAccessibility();
} 