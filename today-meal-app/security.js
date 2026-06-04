// セキュリティ機能モジュール
// 入力値サニタイゼーション、XSS対策、ファイルセキュリティを提供

const SecurityModule = {
  // HTMLエスケープ関数（強化版）
  escapeHtml(text) {
    try {
      if (typeof text !== 'string') return '';
      
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    } catch (error) {
      debugLog('HTML escape error:', error);
      return '';
    }
  },

  // 入力値サニタイゼーション（強化版）
  sanitizeInput(input) {
    try {
      if (typeof input !== 'string') return '';
      
      return input
        .trim()
        .replace(/[<>]/g, '') // HTMLタグの除去
        .replace(/javascript:/gi, '') // JavaScriptプロトコルの除去
        .replace(/on\w+\s*=/gi, '') // イベントハンドラーの除去
        .replace(/data:/gi, '') // データプロトコルの除去
        .replace(/vbscript:/gi, '') // VBScriptプロトコルの除去
        .replace(/expression\s*\(/gi, '') // CSS expressionの除去
        .replace(/url\s*\(/gi, '') // CSS url()の除去
        .replace(/['"]/g, '') // クォートの除去
        .replace(/[;()]/g, ''); // セミコロンと括弧の除去
    } catch (error) {
      debugLog('Input sanitization error:', error);
      return '';
    }
  },

  // ファイル名のサニタイゼーション
  sanitizeFileName(fileName) {
    try {
      if (typeof fileName !== 'string') return 'unknown';
      
      return fileName
        .replace(/[^a-zA-Z0-9._-]/g, '_') // 安全でない文字を置換
        .replace(/\.{2,}/g, '.') // 連続するドットを単一に
        .replace(/^\.+|\.+$/g, '') // 先頭・末尾のドットを除去
        .substring(0, 255); // ファイル名長制限
    } catch (error) {
      debugLog('Filename sanitization error:', error);
      return 'sanitized_file';
    }
  },

  // ファイル内容の検証
  validateFileContent(file) {
    try {
      if (!file || !(file instanceof File)) {
        return { valid: false, reason: 'Invalid file object' };
      }

      // ファイルサイズチェック
      if (file.size > Config.security.maxFileSize) {
        return { valid: false, reason: 'File size exceeds limit' };
      }

      // ファイル形式チェック
      if (!Config.security.allowedImageTypes.includes(file.type)) {
        return { valid: false, reason: 'File type not allowed' };
      }

      // ファイル名チェック
      if (!Config.validation.safeFileNameRegex.test(file.name)) {
        return { valid: false, reason: 'Invalid file name' };
      }

      // ファイル拡張子チェック
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      if (!allowedExtensions.includes(fileExtension)) {
        return { valid: false, reason: 'File extension not allowed' };
      }

      return { valid: true };
    } catch (error) {
      debugLog('File validation error:', error);
      return { valid: false, reason: 'Validation error' };
    }
  },

  // 疑似ウイルススキャン（実際のウイルススキャンはサーバー側で実装）
  async scanFile(file) {
    try {
      if (!file || !(file instanceof File)) {
        return { clean: false, reason: 'Invalid file' };
      }

      // ファイル内容の基本チェック
      const validation = this.validateFileContent(file);
      if (!validation.valid) {
        return { clean: false, reason: validation.reason };
      }

      // ファイルヘッダーのチェック（簡易版）
      const buffer = await file.slice(0, 1024).arrayBuffer();
      const uint8Array = new Uint8Array(buffer);
      
      // 画像ファイルのマジックナンバーチェック
      const isImage = this.checkImageMagicNumbers(uint8Array);
      if (!isImage) {
        return { clean: false, reason: 'File does not appear to be a valid image' };
      }

      // ファイルサイズの異常チェック
      if (file.size === 0) {
        return { clean: false, reason: 'Empty file' };
      }

      // ファイル名の危険なパターンチェック
      const dangerousPatterns = [
        /\.exe$/i,
        /\.bat$/i,
        /\.cmd$/i,
        /\.scr$/i,
        /\.pif$/i,
        /\.com$/i,
        /\.vbs$/i,
        /\.js$/i,
        /\.jar$/i
      ];

      for (const pattern of dangerousPatterns) {
        if (pattern.test(file.name)) {
          return { clean: false, reason: 'Potentially dangerous file type' };
        }
      }

      return { clean: true };
    } catch (error) {
      debugLog('File scan error:', error);
      return { clean: false, reason: 'Scan error' };
    }
  },

  // 画像ファイルのマジックナンバーチェック
  checkImageMagicNumbers(uint8Array) {
    try {
      // JPEG: FF D8 FF
      if (uint8Array[0] === 0xFF && uint8Array[1] === 0xD8 && uint8Array[2] === 0xFF) {
        return true;
      }

      // PNG: 89 50 4E 47
      if (uint8Array[0] === 0x89 && uint8Array[1] === 0x50 && 
          uint8Array[2] === 0x4E && uint8Array[3] === 0x47) {
        return true;
      }

      // GIF: 47 49 46 38
      if (uint8Array[0] === 0x47 && uint8Array[1] === 0x49 && 
          uint8Array[2] === 0x46 && uint8Array[3] === 0x38) {
        return true;
      }

      // WebP: 52 49 46 46 ... 57 45 42 50
      if (uint8Array[0] === 0x52 && uint8Array[1] === 0x49 && 
          uint8Array[2] === 0x46 && uint8Array[3] === 0x46 &&
          uint8Array[8] === 0x57 && uint8Array[9] === 0x45 && 
          uint8Array[10] === 0x42 && uint8Array[11] === 0x50) {
        return true;
      }

      return false;
    } catch (error) {
      debugLog('Magic number check error:', error);
      return false;
    }
  },

  // SQLインジェクション対策（Supabaseが自動処理するが、追加の保護）
  sanitizeForDatabase(input) {
    try {
      if (typeof input !== 'string') return '';
      
      return input
        .replace(/['"]/g, '') // クォートの除去
        .replace(/[;]/g, '') // セミコロンの除去
        .replace(/--/g, '') // SQLコメントの除去
        .replace(/\/\*/g, '') // SQLコメントの除去
        .replace(/\*\//g, '') // SQLコメントの除去
        .replace(/union/gi, '') // UNIONの除去
        .replace(/select/gi, '') // SELECTの除去
        .replace(/insert/gi, '') // INSERTの除去
        .replace(/update/gi, '') // UPDATEの除去
        .replace(/delete/gi, '') // DELETEの除去
        .replace(/drop/gi, '') // DROPの除去
        .replace(/create/gi, '') // CREATEの除去
        .replace(/alter/gi, '') // ALTERの除去
        .replace(/exec/gi, '') // EXECの除去
        .replace(/execute/gi, ''); // EXECUTEの除去
    } catch (error) {
      debugLog('Database sanitization error:', error);
      return '';
    }
  },

  // CSRF対策（トークン生成）
  generateCSRFToken() {
    try {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      debugLog('CSRF token generation error:', error);
      return Math.random().toString(36).substring(2, 15);
    }
  },

  // パスワード強度チェック
  validatePasswordStrength(password) {
    try {
      if (typeof password !== 'string') {
        return { strong: false, reasons: ['Password must be a string'] };
      }

      const reasons = [];
      
      if (password.length < Config.security.minPasswordLength) {
        reasons.push(`Password must be at least ${Config.security.minPasswordLength} characters long`);
      }

      if (!/[a-z]/.test(password)) {
        reasons.push('Password must contain at least one lowercase letter');
      }

      if (!/[A-Z]/.test(password)) {
        reasons.push('Password must contain at least one uppercase letter');
      }

      if (!/[0-9]/.test(password)) {
        reasons.push('Password must contain at least one number');
      }

      if (!/[^a-zA-Z0-9]/.test(password)) {
        reasons.push('Password must contain at least one special character');
      }

      // 一般的なパスワードのチェック
      const commonPasswords = [
        'password', '123456', '123456789', 'qwerty', 'abc123',
        'password123', 'admin', 'letmein', 'welcome', 'monkey'
      ];

      if (commonPasswords.includes(password.toLowerCase())) {
        reasons.push('Password is too common');
      }

      return {
        strong: reasons.length === 0,
        reasons: reasons
      };
    } catch (error) {
      debugLog('Password validation error:', error);
      return { strong: false, reasons: ['Password validation error'] };
    }
  },

  // レート制限（簡易版）
  rateLimit: new Map(),
  
  checkRateLimit(key, maxRequests = 10, windowMs = 60000) {
    try {
      const now = Date.now();
      const windowStart = now - windowMs;
      
      if (!this.rateLimit.has(key)) {
        this.rateLimit.set(key, []);
      }
      
      const requests = this.rateLimit.get(key);
      
      // 古いリクエストを削除
      const validRequests = requests.filter(time => time > windowStart);
      this.rateLimit.set(key, validRequests);
      
      if (validRequests.length >= maxRequests) {
        return { allowed: false, remaining: 0 };
      }
      
      // 新しいリクエストを追加
      validRequests.push(now);
      this.rateLimit.set(key, validRequests);
      
      return { 
        allowed: true, 
        remaining: maxRequests - validRequests.length 
      };
    } catch (error) {
      debugLog('Rate limit check error:', error);
      return { allowed: true, remaining: maxRequests };
    }
  }
};

// グローバルに公開
window.SecurityModule = SecurityModule;
