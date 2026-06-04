// 環境変数による設定管理
// このファイルは本番環境では適切に設定された環境変数を使用します

const Config = {
  // Supabase設定
  supabase: {
    // 環境変数から取得（本番環境では必須）
    // 開発環境ではダミー値を設定
    url: window.SUPABASE_URL || 
         (typeof process !== 'undefined' && process.env && process.env.REACT_APP_SUPABASE_URL) || 
         'https://your-project.supabase.co',
    anonKey: window.SUPABASE_ANON_KEY || 
             (typeof process !== 'undefined' && process.env && process.env.REACT_APP_SUPABASE_ANON_KEY) || 
             'your-anon-key-here'
  },
  
  // セキュリティ設定
  security: {
    // ファイルアップロード制限
    maxFileSize: 10 * 1024 * 1024, // 10MB（簡素化版）
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    
    // 入力値制限（簡素化版）
    maxMealNameLength: 200,
    maxCategoryLength: 50,
    maxIngredientLength: 50,
    minPasswordLength: 6,
    
    // CSP設定
    csp: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      'style-src': ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      'img-src': ["'self'", "data:", "https:", "blob:"],
      'connect-src': ["'self'", window.SUPABASE_URL || (typeof process !== 'undefined' && process.env && process.env.REACT_APP_SUPABASE_URL) || ''],
      'font-src': ["'self'", "https://cdn.jsdelivr.net"],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"]
    }
  },
  
  // アプリケーション設定
  app: {
    name: 'Today Meal App',
    version: '2.2.0',
    debugMode: false
  },
  
  // バリデーション設定
  validation: {
    emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    safeFileNameRegex: /^[a-zA-Z0-9._-]+$/,
    htmlTagRegex: /<[^>]*>/g
  }
};

// 設定の検証
function validateConfig() {
  const errors = [];
  
  if (!Config.supabase.url || Config.supabase.url === 'https://your-project.supabase.co') {
    errors.push('Supabase URL is not configured. Please set SUPABASE_URL environment variable.');
  }
  
  if (!Config.supabase.anonKey || Config.supabase.anonKey === 'your-anon-key-here') {
    errors.push('Supabase anonymous key is not configured. Please set SUPABASE_ANON_KEY environment variable.');
  }
  
  if (errors.length > 0) {
    // 開発環境では警告のみ表示
    if (typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost') {
      console.warn('Configuration validation warnings (development mode):', errors);
      console.warn('Supabase機能は無効化されています。本番環境では適切な設定が必要です。');
    } else {
      // 本番環境では設定エラーを表示
      console.error('Configuration validation failed:', errors);
      const errorDiv = document.createElement('div');
      errorDiv.className = 'alert alert-danger';
      errorDiv.innerHTML = `
        <h4>設定エラー</h4>
        <ul>
          ${errors.map(error => `<li>${error}</li>`).join('')}
        </ul>
        <p>管理者にお問い合わせください。</p>
      `;
      document.body.insertBefore(errorDiv, document.body.firstChild);
    }
    
    return false;
  }
  
  return true;
}

// 設定をグローバルに公開
window.Config = Config;
window.validateConfig = validateConfig;

// 設定の初期化
if (typeof window !== 'undefined') {
  validateConfig();
}
