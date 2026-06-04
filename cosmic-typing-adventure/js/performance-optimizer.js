// Performance Optimizer for Cosmic Typing Adventure

const _logger = window.logger || { debug: () => {}, info: () => {}, warn: console.warn, error: console.error };
class PerformanceOptimizer {
    constructor() {
        this.updateQueue = [];
        this.isUpdating = false;
        this.frameCount = 0;
        this.lastFrameTime = performance.now();
        this.fps = 60;
        
        this.init();
    }

    init() {
        this.setupOptimizations();
        this.startPerformanceMonitoring();
        _logger.debug('⚡ Performance Optimizer initialized');
    }

    setupOptimizations() {
        // Optimize Chart.js updates
        this.optimizeChartUpdates();
        
        // Optimize DOM operations
        this.optimizeDOMOperations();
        
        // Optimize memory usage
        this.optimizeMemoryUsage();
        
        // Optimize image loading
        this.optimizeImageLoading();
    }

    optimizeChartUpdates() {
        // Override Chart.js update method for better performance
        if (window.Chart) {
            const originalUpdate = Chart.prototype.update;
            Chart.prototype.update = function(mode, options) {
                // Use 'none' mode for faster updates
                if (mode === undefined) {
                    mode = 'none';
                }
                return originalUpdate.call(this, mode, options);
            };
        }
    }

    optimizeDOMOperations() {
        // Batch DOM updates
        this.setupBatchUpdates();
        
        // Optimize event listeners
        this.optimizeEventListeners();
        
        // Optimize CSS animations
        this.optimizeAnimations();
    }

    setupBatchUpdates() {
        // Create a batch update system
        this.batchUpdate = (updateFunction) => {
            this.updateQueue.push(updateFunction);
            
            if (!this.isUpdating) {
                this.processBatchUpdates();
            }
        };

        this.processBatchUpdates = () => {
            this.isUpdating = true;
            
            requestAnimationFrame(() => {
                while (this.updateQueue.length > 0) {
                    const update = this.updateQueue.shift();
                    try {
                        update();
                    } catch (error) {
                        _logger.error('Batch update error:', error);
                    }
                }
                
                this.isUpdating = false;
            });
        };
    }

    optimizeEventListeners() {
        // Use passive event listeners for better performance
        const addPassiveEventListener = (element, event, handler) => {
            element.addEventListener(event, handler, { passive: true });
        };

        // Optimize scroll events
        const scrollElements = document.querySelectorAll('.scrollable');
        scrollElements.forEach(element => {
            addPassiveEventListener(element, 'scroll', this.throttle(() => {
                // Handle scroll events
            }, 16)); // ~60fps
        });

        // Optimize resize events
        window.addEventListener('resize', this.throttle(() => {
            this.handleResize();
        }, 100));
    }

    optimizeAnimations() {
        // Use CSS transforms instead of changing layout properties
        const style = document.createElement('style');
        style.textContent = `
            .optimized-animation {
                will-change: transform;
                transform: translateZ(0);
            }
            
            .optimized-transition {
                transition: transform 0.2s ease-out;
            }
        `;
        document.head.appendChild(style);
    }

    optimizeMemoryUsage() {
        // Clean up unused objects
        this.setupMemoryCleanup();
        
        // Optimize object creation
        this.optimizeObjectCreation();
        
        // Monitor memory usage
        this.monitorMemoryUsage();
    }

    setupMemoryCleanup() {
        // Clean up intervals and timeouts
        const originalSetInterval = window.setInterval;
        const originalSetTimeout = window.setTimeout;
        
        this.activeIntervals = new Set();
        this.activeTimeouts = new Set();
        
        window.setInterval = (callback, delay, ...args) => {
            const id = originalSetInterval(callback, delay, ...args);
            this.activeIntervals.add(id);
            return id;
        };
        
        window.setTimeout = (callback, delay, ...args) => {
            const id = originalSetTimeout(callback, delay, ...args);
            this.activeTimeouts.add(id);
            return id;
        };
    }

    optimizeObjectCreation() {
        // Use object pooling for frequently created objects
        this.objectPool = new Map();
        
        this.getFromPool = (type) => {
            if (!this.objectPool.has(type)) {
                this.objectPool.set(type, []);
            }
            
            const pool = this.objectPool.get(type);
            return pool.length > 0 ? pool.pop() : this.createObject(type);
        };
        
        this.returnToPool = (type, object) => {
            if (!this.objectPool.has(type)) {
                this.objectPool.set(type, []);
            }
            
            const pool = this.objectPool.get(type);
            if (pool.length < 10) { // Limit pool size
                this.resetObject(object);
                pool.push(object);
            }
        };
    }

    createObject(type) {
        // Create objects based on type
        switch (type) {
            case 'notification':
                return document.createElement('div');
            case 'particle':
                return document.createElement('div');
            default:
                return {};
        }
    }

    resetObject(object) {
        // Reset object to initial state
        if (object.classList) {
            object.className = '';
            object.innerHTML = '';
        }
    }

    monitorMemoryUsage() {
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
                const totalMB = Math.round(memory.totalJSHeapSize / 1024 / 1024);
                
                if (usedMB > 100) { // Warning threshold
                    _logger.warn(`High memory usage: ${usedMB}MB / ${totalMB}MB`);
                    this.cleanupMemory();
                }
            }, 5000);
        }
    }

    cleanupMemory() {
        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }
        
        // Clear unused intervals and timeouts
        this.activeIntervals.forEach(id => {
            clearInterval(id);
        });
        this.activeIntervals.clear();
        
        this.activeTimeouts.forEach(id => {
            clearTimeout(id);
        });
        this.activeTimeouts.clear();
    }

    optimizeImageLoading() {
        // Lazy load images
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }

    startPerformanceMonitoring() {
        // Monitor FPS
        this.monitorFPS();
        
        // Monitor frame time
        this.monitorFrameTime();
        
        // Monitor long tasks
        this.monitorLongTasks();
    }

    monitorFPS() {
        const measureFPS = () => {
            this.frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - this.lastFrameTime >= 1000) {
                this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastFrameTime));
                this.frameCount = 0;
                this.lastFrameTime = currentTime;
                
                // Log low FPS
                if (this.fps < 30) {
                    _logger.warn(`Low FPS detected: ${this.fps}`);
                    this.optimizeForLowFPS();
                }
            }
            
            requestAnimationFrame(measureFPS);
        };
        
        requestAnimationFrame(measureFPS);
    }

    monitorFrameTime() {
        let lastFrameTime = performance.now();
        
        const measureFrameTime = () => {
            const currentTime = performance.now();
            const frameTime = currentTime - lastFrameTime;
            
            if (frameTime > 16.67) { // More than 60fps threshold
                _logger.warn(`Long frame detected: ${frameTime.toFixed(2)}ms`);
            }
            
            lastFrameTime = currentTime;
            requestAnimationFrame(measureFrameTime);
        };
        
        requestAnimationFrame(measureFrameTime);
    }

    monitorLongTasks() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (entry.duration > 50) { // Long task threshold
                        _logger.warn(`Long task detected: ${entry.duration}ms`, entry);
                    }
                });
            });
            
            observer.observe({ entryTypes: ['longtask'] });
        }
    }

    optimizeForLowFPS() {
        // Reduce animations
        document.body.style.setProperty('--animation-duration', '0.1s');
        
        // Disable complex effects
        document.body.classList.add('low-fps-mode');
        
        // Reduce chart updates
        if (window.updateCharts) {
            const originalUpdateCharts = window.updateCharts;
            window.updateCharts = this.throttle(originalUpdateCharts, 1000);
        }
    }

    throttle(func, delay) {
        let timeoutId;
        let lastExecTime = 0;
        
        return function (...args) {
            const currentTime = Date.now();
            
            if (currentTime - lastExecTime > delay) {
                func.apply(this, args);
                lastExecTime = currentTime;
            } else {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                    lastExecTime = Date.now();
                }, delay - (currentTime - lastExecTime));
            }
        };
    }

    debounce(func, delay) {
        let timeoutId;
        
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }

    handleResize() {
        // Optimize resize handling
        this.batchUpdate(() => {
            // Update chart sizes
            if (window.updateCharts) {
                window.updateCharts();
            }
            
            // Update mobile optimizations
            if (window.mobileOptimizer) {
                window.mobileOptimizer.handleResize();
            }
        });
    }

    // Public methods
    getPerformanceMetrics() {
        return {
            fps: this.fps,
            memory: performance.memory ? {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            } : null,
            userAgent: navigator.userAgent,
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink
            } : null
        };
    }

    optimizeChartUpdate(chart, newData) {
        this.batchUpdate(() => {
            if (chart && chart.data) {
                chart.data.datasets[0].data = newData;
                chart.update('none');
            }
        });
    }
} 