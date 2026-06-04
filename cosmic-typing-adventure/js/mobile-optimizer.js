// Mobile Optimizer for Cosmic Typing Adventure

const _logger = window.logger || { debug: () => {}, info: () => {}, warn: console.warn, error: console.error };
class MobileOptimizer {
    constructor() {
        this.isMobile = this.detectMobile();
        this.isStandalone = this.detectStandalone();
        this.touchStartX = 0;
        this.touchStartY = 0;
        
        this.init();
    }

    init() {
        if (this.isMobile) {
            this.setupMobileFeatures();
            this.optimizeForMobile();
            _logger.debug('📱 Mobile optimization enabled');
        } else {
            _logger.debug('🖥️ Desktop mode detected');
        }
    }

    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    detectStandalone() {
        return window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
    }

    setupMobileFeatures() {
        this.setupTouchGestures();
        this.setupVirtualKeyboardOptimization();
        this.setupMobileUI();
        this.setupTouchFeedback();
    }

    setupTouchGestures() {
        // Swipe navigation
        document.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', (e) => {
            if (!this.touchStartX || !this.touchStartY) return;

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            const diffX = this.touchStartX - touchEndX;
            const diffY = this.touchStartY - touchEndY;

            // Minimum swipe distance
            const minSwipeDistance = 50;

            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > minSwipeDistance) {
                if (diffX > 0) {
                    // Swipe left - next section
                    this.navigateToNextSection();
                } else {
                    // Swipe right - previous section
                    this.navigateToPreviousSection();
                }
            }

            // Reset touch coordinates
            this.touchStartX = 0;
            this.touchStartY = 0;
        });
    }

    navigateToNextSection() {
        const sections = ['game', 'stats', 'fleet', 'settings'];
        const currentSection = this.getCurrentSection();
        const currentIndex = sections.indexOf(currentSection);
        const nextIndex = (currentIndex + 1) % sections.length;
        
        if (window.showSection) {
            window.showSection(sections[nextIndex]);
        }
    }

    navigateToPreviousSection() {
        const sections = ['game', 'stats', 'fleet', 'settings'];
        const currentSection = this.getCurrentSection();
        const currentIndex = sections.indexOf(currentSection);
        const prevIndex = (currentIndex - 1 + sections.length) % sections.length;
        
        if (window.showSection) {
            window.showSection(sections[prevIndex]);
        }
    }

    getCurrentSection() {
        const sections = document.querySelectorAll('.section-content');
        for (let section of sections) {
            if (!section.classList.contains('hidden')) {
                return section.id.replace('Section', '');
            }
        }
        return 'game';
    }

    setupVirtualKeyboardOptimization() {
        // Optimize input field for mobile
        const typingInput = document.getElementById('typingInput');
        if (typingInput) {
            // Prevent zoom on focus
            typingInput.style.fontSize = '16px';
            
            // Add mobile-specific attributes
            typingInput.setAttribute('autocomplete', 'off');
            typingInput.setAttribute('autocorrect', 'off');
            typingInput.setAttribute('autocapitalize', 'off');
            typingInput.setAttribute('spellcheck', 'false');
            
            // Handle virtual keyboard events
            typingInput.addEventListener('focus', () => {
                this.handleKeyboardOpen();
            });
            
            typingInput.addEventListener('blur', () => {
                this.handleKeyboardClose();
            });
        }
    }

    handleKeyboardOpen() {
        // Adjust viewport when virtual keyboard opens
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }
        
        // Scroll to input field
        const typingInput = document.getElementById('typingInput');
        if (typingInput) {
            setTimeout(() => {
                typingInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }
    }

    handleKeyboardClose() {
        // Restore viewport when virtual keyboard closes
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
        }
    }

    setupMobileUI() {
        // Add mobile-specific CSS classes
        document.body.classList.add('mobile-optimized');
        
        // Optimize navigation for mobile
        this.optimizeMobileNavigation();
        
        // Optimize charts for mobile
        this.optimizeMobileCharts();
        
        // Optimize buttons for touch
        this.optimizeTouchTargets();
    }

    optimizeMobileNavigation() {
        // Make mobile menu more accessible
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenu) {
            mobileMenu.style.touchAction = 'manipulation';
        }
        
        // Increase touch targets
        const buttons = document.querySelectorAll('button, .nav-btn');
        buttons.forEach(button => {
            button.style.minHeight = '44px';
            button.style.minWidth = '44px';
        });
    }

    optimizeMobileCharts() {
        // Adjust chart containers for mobile
        const chartContainers = document.querySelectorAll('.chart-container');
        chartContainers.forEach(container => {
            container.style.height = '300px';
            container.style.maxHeight = '50vh';
        });
    }

    optimizeTouchTargets() {
        // Ensure all interactive elements are touch-friendly
        const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
        interactiveElements.forEach(element => {
            element.style.touchAction = 'manipulation';
        });
    }

    setupTouchFeedback() {
        // Add touch feedback to buttons
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('touchstart', () => {
                button.style.transform = 'scale(0.95)';
            });
            
            button.addEventListener('touchend', () => {
                button.style.transform = 'scale(1)';
            });
            
            button.addEventListener('touchcancel', () => {
                button.style.transform = 'scale(1)';
            });
        });
    }

    optimizeForMobile() {
        // Add mobile-specific optimizations
        this.addMobileStyles();
        this.optimizePerformance();
        this.setupMobileEventHandlers();
    }

    addMobileStyles() {
        // Add mobile-specific CSS
        const style = document.createElement('style');
        style.textContent = `
            .mobile-optimized {
                -webkit-tap-highlight-color: transparent;
                -webkit-touch-callout: none;
                -webkit-user-select: none;
                user-select: none;
            }
            
            .mobile-optimized button {
                -webkit-tap-highlight-color: transparent;
                transition: transform 0.1s ease;
            }
            
            .mobile-optimized .chart-container {
                height: 300px !important;
                max-height: 50vh !important;
            }
            
            .mobile-optimized .typing-interface {
                padding: 20px;
            }
            
            .mobile-optimized .mission-btn {
                min-height: 60px;
                font-size: 16px;
            }
            
            @media (max-width: 768px) {
                .mobile-optimized .section-content {
                    padding: 10px;
                }
                
                .mobile-optimized .bg-cosmic-card {
                    margin-bottom: 10px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    optimizePerformance() {
        // Optimize for mobile performance
        if (this.isMobile) {
            // Reduce animations on mobile
            document.body.style.setProperty('--animation-duration', '0.2s');
            
            // Optimize image loading
            const images = document.querySelectorAll('img');
            images.forEach(img => {
                img.loading = 'lazy';
            });
        }
    }

    setupMobileEventHandlers() {
        // Handle orientation changes
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 100);
        });
        
        // Handle resize events
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    handleOrientationChange() {
        // Adjust layout for orientation change
        _logger.debug('Orientation changed');
        
        // Recalculate chart sizes
        if (window.updateCharts) {
            window.updateCharts();
        }
        
        // Adjust mobile menu
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenu && mobileMenu.classList.contains('open')) {
            this.closeMobileMenu();
        }
    }

    handleResize() {
        // Handle window resize
        if (this.isMobile) {
            // Adjust mobile-specific layouts
            this.optimizeMobileCharts();
        }
    }

    closeMobileMenu() {
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenu) {
            mobileMenu.classList.remove('open');
        }
    }

    // Public methods for external use
    isMobileDevice() {
        return this.isMobile;
    }

    isStandaloneMode() {
        return this.isStandalone;
    }

    getMobileInfo() {
        return {
            isMobile: this.isMobile,
            isStandalone: this.isStandalone,
            userAgent: navigator.userAgent,
            screenSize: `${window.innerWidth}x${window.innerHeight}`,
            orientation: window.orientation || 'unknown'
        };
    }
} 