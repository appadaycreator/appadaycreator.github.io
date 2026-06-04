// ロガーユーティリティ
// 開発環境と本番環境で適切なログレベル制御を提供

/**
 * ログレベル定義
 */
const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4
};

/**
 * 環境に基づいてログレベルを決定
 */
function getDefaultLogLevel() {
  // localStorage設定を優先
  const savedLevel = localStorage.getItem('logLevel');
  if (savedLevel && LogLevel[savedLevel] !== undefined) {
    return LogLevel[savedLevel];
  }

  // 開発環境判定（localhost, file://など）
  const isDevelopment = 
    location.hostname === 'localhost' ||
    location.hostname === '127.0.0.1' ||
    location.protocol === 'file:' ||
    location.hostname.includes('github.io') === false; // GitHub Pages以外は開発環境

  return isDevelopment ? LogLevel.DEBUG : LogLevel.WARN;
}

/**
 * Logger クラス
 * アプリケーション全体で使用する統一的なロギング機能を提供
 */
class Logger {
  constructor() {
    this.level = getDefaultLogLevel();
    this.prefix = '[CosmicTyping]';
  }

  /**
   * ログレベルを設定
   * @param {string} level - 'DEBUG', 'INFO', 'WARN', 'ERROR', 'NONE'
   */
  setLevel(level) {
    if (LogLevel[level] !== undefined) {
      this.level = LogLevel[level];
      localStorage.setItem('logLevel', level);
    }
  }

  /**
   * デバッグログ（開発環境のみ）
   */
  debug(...args) {
    if (this.level <= LogLevel.DEBUG) {
      console.log(`${this.prefix} [DEBUG]`, ...args);
    }
  }

  /**
   * 情報ログ
   */
  info(...args) {
    if (this.level <= LogLevel.INFO) {
      console.log(`${this.prefix} [INFO]`, ...args);
    }
  }

  /**
   * 警告ログ
   */
  warn(...args) {
    if (this.level <= LogLevel.WARN) {
      console.warn(`${this.prefix} [WARN]`, ...args);
    }
  }

  /**
   * エラーログ（常に出力）
   */
  error(...args) {
    if (this.level <= LogLevel.ERROR) {
      console.error(`${this.prefix} [ERROR]`, ...args);
    }
  }

  /**
   * グループログ開始
   */
  group(label) {
    if (this.level <= LogLevel.DEBUG) {
      console.group(`${this.prefix} ${label}`);
    }
  }

  /**
   * グループログ終了
   */
  groupEnd() {
    if (this.level <= LogLevel.DEBUG) {
      console.groupEnd();
    }
  }

  /**
   * テーブル形式でログ出力
   */
  table(data) {
    if (this.level <= LogLevel.DEBUG) {
      console.table(data);
    }
  }

  /**
   * パフォーマンス計測開始
   */
  time(label) {
    if (this.level <= LogLevel.DEBUG) {
      console.time(`${this.prefix} ${label}`);
    }
  }

  /**
   * パフォーマンス計測終了
   */
  timeEnd(label) {
    if (this.level <= LogLevel.DEBUG) {
      console.timeEnd(`${this.prefix} ${label}`);
    }
  }
}

// シングルトンインスタンス
const logger = new Logger();

// グローバルに公開（デバッグ用）
if (typeof window !== 'undefined') {
  window.logger = logger;
}

export { logger, LogLevel };
