// Common utilities for Cosmic Typing Adventure - Optimized Version

// Performance monitoring utilities
const _logger = window.logger || { debug: () => {}, info: () => {}, warn: console.warn, error: console.error };
export const PerformanceUtils = {
    // Measure execution time
    measureTime(fn, label = 'Function') {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        _logger.debug(`${label} took ${(end - start).toFixed(2)}ms`);
        return result;
    },

    // Measure memory usage
    getMemoryUsage() {
        if (performance.memory) {
            return {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            };
        }
        return null;
    },

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
    },

    // Throttle function for performance
    throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// Image optimization utilities
export const ImageUtils = {
    // Lazy load images
    lazyLoadImages() {
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

    // Preload critical images
    preloadImages(imageUrls) {
        imageUrls.forEach(url => {
            const img = new Image();
            img.src = url;
        });
    },

    // Optimize image loading
    optimizeImageLoading() {
        // Add loading="lazy" to non-critical images
        const images = document.querySelectorAll('img:not([loading])');
        images.forEach(img => {
            if (!img.classList.contains('critical')) {
                img.loading = 'lazy';
            }
        });
    }
};

// DOM optimization utilities
export const DOMUtils = {
    // Batch DOM updates
    batchDOMUpdates(updates) {
        requestAnimationFrame(() => {
            updates.forEach(update => update());
        });
    },

    // Efficient element creation
    createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);

        // Set attributes
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'textContent') {
                element.textContent = value;
            } else {
                element.setAttribute(key, value);
            }
        });

        // Add children
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else {
                element.appendChild(child);
            }
        });

        return element;
    },

    // Efficient element removal
    removeElement(element) {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    },

    // Efficient class manipulation
    toggleClass(element, className, force) {
        if (force === undefined) {
            element.classList.toggle(className);
        } else {
            element.classList.toggle(className, force);
        }
    }
};

// Storage utilities with performance optimization
export const StorageUtils = {
    // Efficient localStorage operations
    setItem(key, value) {
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(key, serialized);
            return true;
        } catch (error) {
            _logger.error('Failed to save to localStorage:', error);
            return false;
        }
    },

    getItem(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            _logger.error('Failed to read from localStorage:', error);
            return defaultValue;
        }
    },

    removeItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            _logger.error('Failed to remove from localStorage:', error);
            return false;
        }
    },

    // Clear old data
    cleanupOldData(maxAge = 30 * 24 * 60 * 60 * 1000) { // 30 days
        const now = Date.now();
        const keys = Object.keys(localStorage);

        keys.forEach(key => {
            try {
                const item = JSON.parse(localStorage.getItem(key));
                if (item && item.timestamp && (now - item.timestamp) > maxAge) {
                    localStorage.removeItem(key);
                }
            } catch (error) {
                // Skip invalid items
            }
        });
    }
};

// Network utilities
export const NetworkUtils = {
    // Check online status
    isOnline() {
        return navigator.onLine;
    },

    // Retry function with exponential backoff
    async retry(fn, maxRetries = 3, delay = 1000) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await fn();
            } catch (error) {
                if (i === maxRetries - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
            }
        }
    },

    // Fetch with timeout
    async fetchWithTimeout(url, options = {}, timeout = 5000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }
};

// Animation utilities
export const AnimationUtils = {
    // Smooth scroll to element
    scrollToElement(element, offset = 0) {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    },

    // Fade in element
    fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.display = 'block';

        let start = performance.now();

        function animate(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);

            element.style.opacity = progress;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }

        requestAnimationFrame(animate);
    },

    // Fade out element
    fadeOut(element, duration = 300) {
        let start = performance.now();
        const initialOpacity = parseFloat(getComputedStyle(element).opacity) || 1;

        function animate(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);

            element.style.opacity = initialOpacity * (1 - progress);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
            }
        }

        requestAnimationFrame(animate);
    }
};

// Error handling utilities
export const ErrorUtils = {
    // Global error handler
    setupGlobalErrorHandler() {
        window.addEventListener('error', (event) => {
            _logger.error('Global error:', event.error);
            // Send to analytics if needed
        });

        window.addEventListener('unhandledrejection', (event) => {
            _logger.error('Unhandled promise rejection:', event.reason);
            // Send to analytics if needed
        });
    },

    // Safe function execution
    safeExecute(fn, fallback = null) {
        try {
            return fn();
        } catch (error) {
            _logger.error('Function execution failed:', error);
            return fallback;
        }
    },

    // Async safe execution
    async safeExecuteAsync(fn, fallback = null) {
        try {
            return await fn();
        } catch (error) {
            _logger.error('Async function execution failed:', error);
            return fallback;
        }
    }
};

// Accessibility utilities
export const AccessibilityUtils = {
    // Focus management
    trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        element.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        });
    },

    // Announce to screen readers
    announce(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.style.position = 'absolute';
        announcement.style.left = '-10000px';
        announcement.style.width = '1px';
        announcement.style.height = '1px';
        announcement.style.overflow = 'hidden';

        document.body.appendChild(announcement);
        announcement.textContent = message;

        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
};

// Initialize utilities
export const initUtils = () => {
    // Setup global error handler
    ErrorUtils.setupGlobalErrorHandler();

    // Optimize image loading
    ImageUtils.optimizeImageLoading();

    // Cleanup old data
    StorageUtils.cleanupOldData();

    _logger.debug('Common utilities initialized');
};
