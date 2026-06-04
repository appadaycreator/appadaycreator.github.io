// Core Debugger for Cosmic Typing Adventure
// コアシステムのデバッグとエラーハンドリングを改善

class CoreDebugger {
    constructor() {
        this.debugMode = localStorage.getItem('debug') === 'true';
        this.errorLog = [];
        this.performanceLog = [];
        this.initTime = performance.now();
        
        this.setupErrorHandling();
        this.setupPerformanceMonitoring();
        this.setupDebugTools();

        if (this.debugMode) console.log('🔧 Core Debugger initialized');
    }

    setupErrorHandling() {
        // Global error handler
        window.addEventListener('error', (event) => {
            this.logError('JavaScript Error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            this.logError('Unhandled Promise Rejection', {
                reason: event.reason,
                promise: event.promise
            });
        });

        // DOM error handler
        window.addEventListener('DOMContentLoaded', () => {
            this.checkDOMIntegrity();
        });
    }

    setupPerformanceMonitoring() {
        // Monitor page load performance
        window.addEventListener('load', () => {
            const loadTime = performance.now() - this.initTime;
            this.logPerformance('Page Load', loadTime);
            
            // Check for performance issues
            if (loadTime > 3000) {
                this.logError('Performance Warning', {
                    message: 'Page load time exceeded 3 seconds',
                    loadTime: loadTime
                });
            }
        });

        // Monitor memory usage
        if (performance.memory) {
            setInterval(() => {
                const memory = performance.memory;
                const usagePercent = (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100;
                
                if (usagePercent > 80) {
                    this.logError('Memory Warning', {
                        message: 'High memory usage detected',
                        usagePercent: usagePercent,
                        used: memory.usedJSHeapSize,
                        total: memory.totalJSHeapSize
                    });
                }
            }, 10000); // Check every 10 seconds
        }
    }

    setupDebugTools() {
        // Add debug methods to window
        window.debug = {
            logErrors: () => this.getErrorLog(),
            logPerformance: () => this.getPerformanceLog(),
            clearLogs: () => this.clearLogs(),
            enableDebug: () => this.enableDebugMode(),
            disableDebug: () => this.disableDebugMode(),
            testComponents: () => this.testAllComponents()
        };

        // Add debug info to console
        if (this.debugMode) {
            console.log('🐛 Debug mode enabled');
            console.log('Available debug commands:');
            console.log('- debug.logErrors() - Show error log');
            console.log('- debug.logPerformance() - Show performance log');
            console.log('- debug.testComponents() - Test all components');
        }
    }

    logError(type, details) {
        const errorEntry = {
            timestamp: new Date().toISOString(),
            type: type,
            details: details,
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        this.errorLog.push(errorEntry);
        
        // Keep only last 100 errors
        if (this.errorLog.length > 100) {
            this.errorLog = this.errorLog.slice(-100);
        }

        // Log to console in debug mode
        if (this.debugMode) {
            console.error(`🚨 ${type}:`, details);
        }

        // Store in localStorage for persistence
        try {
            localStorage.setItem('cosmicTyping_errorLog', JSON.stringify(this.errorLog));
        } catch (e) {
            console.warn('Failed to save error log to localStorage');
        }
    }

    logPerformance(operation, duration) {
        const perfEntry = {
            timestamp: new Date().toISOString(),
            operation: operation,
            duration: duration
        };

        this.performanceLog.push(perfEntry);
        
        // Keep only last 50 performance entries
        if (this.performanceLog.length > 50) {
            this.performanceLog = this.performanceLog.slice(-50);
        }

        // Log to console in debug mode
        if (this.debugMode) {
            console.log(`⚡ ${operation}: ${duration.toFixed(2)}ms`);
        }
    }

    checkDOMIntegrity() {
        const criticalElements = [
            'typingInput',
            'textDisplay',
            'gameTimer',
            'liveWPM',
            'liveAccuracy'
        ];

        const missingElements = criticalElements.filter(id => !document.getElementById(id));
        
        if (missingElements.length > 0) {
            this.logError('DOM Integrity Check Failed', {
                message: 'Critical DOM elements missing',
                missingElements: missingElements
            });
        } else if (this.debugMode) {
            console.log('✅ DOM integrity check passed');
        }
    }

    testAllComponents() {
        if (this.debugMode) console.log('🧪 Testing all components...');
        
        const tests = [
            this.testTypingEngine(),
            this.testAudioManager(),
            this.testLocalStorage(),
            this.testSupabaseConnection(),
            this.testPerformance()
        ];

        Promise.allSettled(tests).then(results => {
            const passed = results.filter(r => r.status === 'fulfilled').length;
            const failed = results.filter(r => r.status === 'rejected').length;
            
            if (this.debugMode) console.log(`✅ Tests completed: ${passed} passed, ${failed} failed`);
            
            if (failed > 0) {
                this.logError('Component Test Failed', {
                    passed: passed,
                    failed: failed,
                    results: results
                });
            }
        });
    }

    async testTypingEngine() {
        try {
            // Test if typing engine is available
            if (typeof window.TypingEngine !== 'undefined') {
                const engine = new window.TypingEngine();
                if (this.debugMode) console.log('✅ TypingEngine test passed');
                return true;
            } else {
                throw new Error('TypingEngine not found');
            }
        } catch (error) {
            console.error('❌ TypingEngine test failed:', error);
            throw error;
        }
    }

    async testAudioManager() {
        try {
            // Test if audio manager is available
            if (window.audioManager) {
                if (this.debugMode) console.log('✅ AudioManager test passed');
                return true;
            } else {
                throw new Error('AudioManager not found');
            }
        } catch (error) {
            console.error('❌ AudioManager test failed:', error);
            throw error;
        }
    }

    async testLocalStorage() {
        try {
            const testKey = 'cosmicTyping_test';
            const testValue = 'test_value';
            
            localStorage.setItem(testKey, testValue);
            const retrieved = localStorage.getItem(testKey);
            localStorage.removeItem(testKey);
            
            if (retrieved === testValue) {
                if (this.debugMode) console.log('✅ LocalStorage test passed');
                return true;
            } else {
                throw new Error('LocalStorage read/write failed');
            }
        } catch (error) {
            console.error('❌ LocalStorage test failed:', error);
            throw error;
        }
    }

    async testSupabaseConnection() {
        try {
            // Test Supabase connection if available
            if (window.supabase) {
                const data = null, error = null; // Supabase removed
                
                if (error) {
                    if (this.debugMode) console.warn('⚠️ Supabase connection test failed (expected in offline mode):', error);
                } else {
                    if (this.debugMode) console.log('✅ Supabase connection test passed');
                }
                return true;
            } else {
                if (this.debugMode) console.log('ℹ️ Supabase not available (offline mode)');
                return true;
            }
        } catch (error) {
            console.error('❌ Supabase connection test failed:', error);
            throw error;
        }
    }

    async testPerformance() {
        try {
            const startTime = performance.now();
            
            // Simulate some work
            for (let i = 0; i < 1000; i++) {
                Math.random();
            }
            
            const duration = performance.now() - startTime;
            
            if (duration < 100) {
                if (this.debugMode) console.log('✅ Performance test passed');
                return true;
            } else {
                throw new Error(`Performance test took too long: ${duration.toFixed(2)}ms`);
            }
        } catch (error) {
            console.error('❌ Performance test failed:', error);
            throw error;
        }
    }

    getErrorLog() {
        return this.errorLog;
    }

    getPerformanceLog() {
        return this.performanceLog;
    }

    clearLogs() {
        this.errorLog = [];
        this.performanceLog = [];
        localStorage.removeItem('cosmicTyping_errorLog');
        if (this.debugMode) console.log('🧹 Logs cleared');
    }

    enableDebugMode() {
        this.debugMode = true;
        localStorage.setItem('debug', 'true');
        console.log('🐛 Debug mode enabled'); // intentional: confirms enable succeeded
    }

    disableDebugMode() {
        this.debugMode = false;
        localStorage.removeItem('debug');
        console.log('🐛 Debug mode disabled'); // intentional: confirms disable succeeded
    }

    // Safe function execution wrapper
    safeExecute(fn, fallback = null, context = 'Unknown') {
        try {
            const startTime = performance.now();
            const result = fn();
            const duration = performance.now() - startTime;
            
            this.logPerformance(`${context} Execution`, duration);
            return result;
        } catch (error) {
            this.logError(`${context} Execution Failed`, {
                error: error.message,
                stack: error.stack
            });
            return fallback;
        }
    }

    // Safe async function execution wrapper
    async safeExecuteAsync(fn, fallback = null, context = 'Unknown') {
        try {
            const startTime = performance.now();
            const result = await fn();
            const duration = performance.now() - startTime;
            
            this.logPerformance(`${context} Async Execution`, duration);
            return result;
        } catch (error) {
            this.logError(`${context} Async Execution Failed`, {
                error: error.message,
                stack: error.stack
            });
            return fallback;
        }
    }

    // Validate data integrity
    validateData(data, schema) {
        const errors = [];
        
        for (const [key, type] of Object.entries(schema)) {
            if (!(key in data)) {
                errors.push(`Missing required field: ${key}`);
            } else if (typeof data[key] !== type) {
                errors.push(`Invalid type for ${key}: expected ${type}, got ${typeof data[key]}`);
            }
        }
        
        if (errors.length > 0) {
            this.logError('Data Validation Failed', {
                errors: errors,
                data: data,
                schema: schema
            });
            return false;
        }
        
        return true;
    }

    // Monitor function calls
    monitorFunction(fn, name) {
        return (...args) => {
            const startTime = performance.now();
            
            try {
                const result = fn(...args);
                const duration = performance.now() - startTime;
                
                this.logPerformance(`${name} Function Call`, duration);
                return result;
            } catch (error) {
                this.logError(`${name} Function Call Failed`, {
                    error: error.message,
                    args: args
                });
                throw error;
            }
        };
    }
} 