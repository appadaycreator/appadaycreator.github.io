// Security utilities for Cosmic Typing Adventure

// Input validation and sanitization utilities
const _logger = window.logger || { debug: () => {}, info: () => {}, warn: console.warn, error: console.error };
export const SecurityUtils = {
    // Sanitize HTML content
    sanitizeHtml(input) {
        if (typeof input !== 'string') return '';

        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    },

    // Sanitize text content (remove all HTML)
    sanitizeText(input) {
        if (typeof input !== 'string') return '';

        const div = document.createElement('div');
        div.innerHTML = input;
        return div.textContent || div.innerText || '';
    },

    // Validate and sanitize user input
    validateUserInput(input, options = {}) {
        const {
            maxLength = 1000,
            allowedTags = [],
            stripHtml = true,
            trim = true
        } = options;

        if (typeof input !== 'string') {
            throw new Error('Input must be a string');
        }

        let sanitized = input;

        // Trim whitespace
        if (trim) {
            sanitized = sanitized.trim();
        }

        // Check length
        if (sanitized.length > maxLength) {
            throw new Error(`Input exceeds maximum length of ${maxLength} characters`);
        }

        // Strip HTML if requested
        if (stripHtml) {
            sanitized = this.sanitizeText(sanitized);
        } else if (allowedTags.length > 0) {
            sanitized = this.sanitizeHtmlWithAllowedTags(sanitized, allowedTags);
        }

        return sanitized;
    },

    // Sanitize HTML with allowed tags
    sanitizeHtmlWithAllowedTags(input, allowedTags) {
        const div = document.createElement('div');
        div.innerHTML = input;

        // Remove all tags except allowed ones
        const walker = document.createTreeWalker(
            div,
            NodeFilter.SHOW_ELEMENT,
            null,
            false
        );

        const nodesToRemove = [];
        let node;
        while (node = walker.nextNode()) {
            if (!allowedTags.includes(node.tagName.toLowerCase())) {
                nodesToRemove.push(node);
            }
        }

        nodesToRemove.forEach(node => {
            const parent = node.parentNode;
            while (node.firstChild) {
                parent.insertBefore(node.firstChild, node);
            }
            parent.removeChild(node);
        });

        return div.innerHTML;
    },

    // Validate email format
    validateEmail(email) {
        if (typeof email !== 'string') return false;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    },

    // Validate URL format
    validateUrl(url) {
        if (typeof url !== 'string') return false;

        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },

    // Validate typing text content
    validateTypingText(text) {
        if (typeof text !== 'string') {
            throw new Error('Text must be a string');
        }

        const sanitized = this.sanitizeText(text);

        if (sanitized.length < 10) {
            throw new Error('Text must be at least 10 characters long');
        }

        if (sanitized.length > 10000) {
            throw new Error('Text must be less than 10,000 characters');
        }

        // Check for potentially harmful content
        const harmfulPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /data:text\/html/gi
        ];

        for (const pattern of harmfulPatterns) {
            if (pattern.test(sanitized)) {
                throw new Error('Text contains potentially harmful content');
            }
        }

        return sanitized;
    },

    // Validate user statistics
    validateUserStats(stats) {
        const requiredFields = ['wpm', 'accuracy', 'totalTyped', 'totalErrors'];

        for (const field of requiredFields) {
            if (!(field in stats)) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        // Validate data types and ranges
        if (typeof stats.wpm !== 'number' || stats.wpm < 0 || stats.wpm > 1000) {
            throw new Error('Invalid WPM value');
        }

        if (typeof stats.accuracy !== 'number' || stats.accuracy < 0 || stats.accuracy > 100) {
            throw new Error('Invalid accuracy value');
        }

        if (typeof stats.totalTyped !== 'number' || stats.totalTyped < 0) {
            throw new Error('Invalid total typed value');
        }

        if (typeof stats.totalErrors !== 'number' || stats.totalErrors < 0) {
            throw new Error('Invalid total errors value');
        }

        return stats;
    },

    // Generate secure random string
    generateSecureToken(length = 32) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';

        const array = new Uint8Array(length);
        crypto.getRandomValues(array);

        for (let i = 0; i < length; i++) {
            result += chars.charAt(array[i] % chars.length);
        }

        return result;
    },

    // Hash sensitive data (simple implementation)
    hashData(data) {
        if (typeof data !== 'string') {
            data = JSON.stringify(data);
        }

        // Simple hash function (for production, use proper crypto)
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }

        return hash.toString(36);
    },

    // Encrypt sensitive data (simple implementation)
    encryptData(data, key) {
        if (typeof data !== 'string') {
            data = JSON.stringify(data);
        }

        // Simple XOR encryption (for production, use proper crypto)
        let encrypted = '';
        for (let i = 0; i < data.length; i++) {
            const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % key.length);
            encrypted += String.fromCharCode(charCode);
        }

        return btoa(encrypted); // Base64 encode
    },

    // Decrypt data
    decryptData(encryptedData, key) {
        try {
            const decoded = atob(encryptedData);
            let decrypted = '';

            for (let i = 0; i < decoded.length; i++) {
                const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
                decrypted += String.fromCharCode(charCode);
            }

            return decrypted;
        } catch (error) {
            throw new Error('Failed to decrypt data');
        }
    }
};

// XSS Protection utilities
export const XSSProtection = {
    // Check for XSS patterns
    detectXSS(input) {
        const xssPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /vbscript:/gi,
            /on\w+\s*=/gi,
            /data:text\/html/gi,
            /data:application\/javascript/gi,
            /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
            /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
            /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi
        ];

        for (const pattern of xssPatterns) {
            if (pattern.test(input)) {
                return true;
            }
        }

        return false;
    },

    // Sanitize user input for display
    sanitizeForDisplay(input) {
        if (typeof input !== 'string') return '';

        return input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    },

    // Safe innerHTML assignment
    safeInnerHTML(element, content) {
        if (!element || !(element instanceof Element)) {
            throw new Error('Invalid element provided');
        }

        const sanitized = SecurityUtils.sanitizeHtml(content);

        if (XSSProtection.detectXSS(sanitized)) {
            throw new Error('Content contains potentially harmful code');
        }

        element.innerHTML = sanitized;
    }
};

// CSRF Protection utilities
export const CSRFProtection = {
    // Generate CSRF token
    generateCSRFToken() {
        return SecurityUtils.generateSecureToken(32);
    },

    // Validate CSRF token
    validateCSRFToken(token, storedToken) {
        if (!token || !storedToken) return false;
        return token === storedToken;
    },

    // Add CSRF token to requests
    addCSRFTokenToRequest(requestData) {
        const token = this.generateCSRFToken();
        return {
            ...requestData,
            csrfToken: token
        };
    }
};

// Content Security Policy utilities
export const CSPUtils = {
    // Generate CSP header
    generateCSPHeader() {
        return [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: https:",
            "connect-src 'self'",
            "frame-src 'none'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'"
        ].join('; ');
    },

    // Validate CSP compliance
    validateCSPCompliance(scriptContent) {
        const unsafePatterns = [
            /eval\s*\(/gi,
            /new\s+Function\s*\(/gi,
            /setTimeout\s*\([^)]*['"`][^'"`]*['"`]/gi,
            /setInterval\s*\([^)]*['"`][^'"`]*['"`]/gi
        ];

        for (const pattern of unsafePatterns) {
            if (pattern.test(scriptContent)) {
                return false;
            }
        }

        return true;
    }
};

// Data validation utilities
export const DataValidation = {
    // Validate user profile data
    validateUserProfile(profile) {
        const required = ['username', 'email'];
        const optional = ['displayName', 'avatar', 'preferences'];

        for (const field of required) {
            if (!profile[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        // Validate username
        if (typeof profile.username !== 'string' || profile.username.length < 3 || profile.username.length > 20) {
            throw new Error('Username must be 3-20 characters long');
        }

        if (!/^[a-zA-Z0-9_]+$/.test(profile.username)) {
            throw new Error('Username can only contain letters, numbers, and underscores');
        }

        // Validate email
        if (!SecurityUtils.validateEmail(profile.email)) {
            throw new Error('Invalid email format');
        }

        return profile;
    },

    // Validate typing session data
    validateTypingSession(session) {
        const required = ['text', 'wpm', 'accuracy', 'duration'];

        for (const field of required) {
            if (!(field in session)) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        // Validate text
        if (typeof session.text !== 'string' || session.text.length < 10) {
            throw new Error('Text must be at least 10 characters long');
        }

        // Validate performance metrics
        if (typeof session.wpm !== 'number' || session.wpm < 0 || session.wpm > 1000) {
            throw new Error('Invalid WPM value');
        }

        if (typeof session.accuracy !== 'number' || session.accuracy < 0 || session.accuracy > 100) {
            throw new Error('Invalid accuracy value');
        }

        if (typeof session.duration !== 'number' || session.duration < 0) {
            throw new Error('Invalid duration value');
        }

        return session;
    }
};

// Security monitoring utilities
export const SecurityMonitoring = {
    // Track security events
    securityEvents: [],

    // Log security event
    logSecurityEvent(event) {
        const securityEvent = {
            timestamp: new Date().toISOString(),
            type: event.type,
            details: event.details,
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        this.securityEvents.push(securityEvent);

        // Keep only last 100 events
        if (this.securityEvents.length > 100) {
            this.securityEvents = this.securityEvents.slice(-100);
        }

        _logger.warn('Security event logged:', securityEvent);
    },

    // Detect suspicious activity
    detectSuspiciousActivity(input) {
        const suspiciousPatterns = [
            /<script/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /data:text\/html/gi,
            /eval\s*\(/gi,
            /new\s+Function/gi
        ];

        for (const pattern of suspiciousPatterns) {
            if (pattern.test(input)) {
                this.logSecurityEvent({
                    type: 'suspicious_input',
                    details: { pattern: pattern.source, input: input.substring(0, 100) }
                });
                return true;
            }
        }

        return false;
    },

    // Get security report
    getSecurityReport() {
        return {
            totalEvents: this.securityEvents.length,
            events: this.securityEvents.slice(-10), // Last 10 events
            timestamp: new Date().toISOString()
        };
    }
};

// Initialize security features
export const initSecurity = () => {
    // Setup global error handler for security
    window.addEventListener('error', (event) => {
        SecurityMonitoring.logSecurityEvent({
            type: 'javascript_error',
            details: { error: event.error?.message || 'Unknown error' }
        });
    });

    // Monitor for suspicious DOM modifications
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const html = node.outerHTML || node.innerHTML;
                        if (html && SecurityMonitoring.detectSuspiciousActivity(html)) {
                            _logger.warn('Suspicious DOM modification detected');
                        }
                    }
                });
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    _logger.debug('Security features initialized');
};

// Initialize when DOM is ready
// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', initSecurity);
// } else {
//     initSecurity();
// }