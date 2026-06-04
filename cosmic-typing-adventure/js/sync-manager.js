// Sync Manager for Cosmic Typing Adventure
// オンライン/オフライン同期を管理する包括的なシステム

import { logger } from './logger.js';

/**
 * 同期状態の定義
 */
export const SyncStatus = {
  IDLE: 'idle',           // 同期していない
  SYNCING: 'syncing',     // 同期中
  SUCCESS: 'success',     // 同期成功
  ERROR: 'error',         // 同期エラー
  OFFLINE: 'offline'      // オフライン
};

/**
 * 同期マネージャークラス
 * オフラインキュー、リトライメカニズム、データ競合解決を提供
 */
class SyncManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.syncStatus = SyncStatus.IDLE;
    this.syncQueue = [];
    this.retryAttempts = new Map(); // 各操作のリトライ回数を追跡
    this.maxRetries = 3;
    this.retryDelay = 2000; // 2秒
    this.isSyncing = false;
    this.syncListeners = new Set();
    this.lastSyncTime = null;
    this.autoSyncInterval = null;
    this.conflictResolution = 'latest'; // 'latest' | 'manual'
    
    // ローカルストレージキー
    this.QUEUE_KEY = 'sync_queue';
    this.SYNC_STATE_KEY = 'sync_state';
    this.CONFLICT_KEY = 'sync_conflicts';
    
    this.initialize();
  }

  /**
   * 初期化処理
   */
  initialize() {
    logger.info('SyncManager: Initializing...');
    
    // ネットワーク状態の監視
    this.setupNetworkMonitoring();
    
    // 保存されたキューを復元
    this.restoreQueue();
    
    // 定期的な自動同期（5分ごと）
    this.startAutoSync(5 * 60 * 1000);
    
    // ページ離脱時に同期を試行
    this.setupBeforeUnloadSync();
    
    // 初期同期状態を設定
    this.updateSyncStatus(this.isOnline ? SyncStatus.IDLE : SyncStatus.OFFLINE);
    
    logger.info('SyncManager: Initialized successfully');
  }

  /**
   * ネットワーク状態の監視設定
   */
  setupNetworkMonitoring() {
    window.addEventListener('online', () => {
      logger.info('SyncManager: Network online');
      this.isOnline = true;
      this.updateSyncStatus(SyncStatus.IDLE);
      this.notifySyncListeners({ type: 'network', status: 'online' });
      
      // オンライン復帰時に自動同期
      this.syncAllQueued();
    });

    window.addEventListener('offline', () => {
      logger.warn('SyncManager: Network offline');
      this.isOnline = false;
      this.updateSyncStatus(SyncStatus.OFFLINE);
      this.notifySyncListeners({ type: 'network', status: 'offline' });
    });
  }

  /**
   * ページ離脱時の同期設定
   */
  setupBeforeUnloadSync() {
    window.addEventListener('beforeunload', () => {
      if (this.syncQueue.length > 0 && this.isOnline) {
        // 同期キューを保存
        this.saveQueue();
      }
    });
  }

  /**
   * 自動同期の開始
   */
  startAutoSync(interval = 5 * 60 * 1000) {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
    }
    
    this.autoSyncInterval = setInterval(() => {
      if (this.isOnline && this.syncQueue.length > 0) {
        logger.info('SyncManager: Auto sync triggered');
        this.syncAllQueued();
      }
    }, interval);
  }

  /**
   * 自動同期の停止
   */
  stopAutoSync() {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
      this.autoSyncInterval = null;
    }
  }

  /**
   * 同期操作をキューに追加
   */
  addToQueue(operation) {
    const queueItem = {
      id: this.generateId(),
      timestamp: Date.now(),
      operation: operation.type,
      data: operation.data,
      retryCount: 0,
      status: 'pending',
      ...operation
    };
    
    this.syncQueue.push(queueItem);
    this.saveQueue();
    
    logger.info(`SyncManager: Operation added to queue (${queueItem.id})`);
    this.notifySyncListeners({ type: 'queue_updated', queueLength: this.syncQueue.length });
    
    // オンラインなら即座に同期を試行
    if (this.isOnline && !this.isSyncing) {
      this.syncAllQueued();
    }
    
    return queueItem.id;
  }

  /**
   * キュー内のすべての操作を同期
   */
  async syncAllQueued() {
    if (this.isSyncing) {
      logger.warn('SyncManager: Sync already in progress');
      return;
    }
    
    if (!this.isOnline) {
      logger.warn('SyncManager: Cannot sync while offline');
      return;
    }
    
    if (this.syncQueue.length === 0) {
      logger.info('SyncManager: Sync queue is empty');
      return;
    }
    
    this.isSyncing = true;
    this.updateSyncStatus(SyncStatus.SYNCING);
    
    logger.info(`SyncManager: Starting sync of ${this.syncQueue.length} operations`);
    
    const results = {
      success: 0,
      failed: 0,
      conflicts: 0
    };
    
    // キューのコピーを作成（同期中に新しい操作が追加される可能性があるため）
    const queueSnapshot = [...this.syncQueue];
    
    for (const item of queueSnapshot) {
      try {
        const result = await this.syncOperation(item);
        
        if (result.success) {
          results.success++;
          this.removeFromQueue(item.id);
        } else if (result.conflict) {
          results.conflicts++;
          await this.handleConflict(item, result.conflictData);
        } else {
          results.failed++;
          await this.handleSyncFailure(item, result.error);
        }
      } catch (error) {
        results.failed++;
        logger.error(`SyncManager: Error syncing operation ${item.id}:`, error);
        await this.handleSyncFailure(item, error);
      }
    }
    
    this.isSyncing = false;
    this.lastSyncTime = Date.now();
    
    // 同期結果に応じてステータスを更新
    if (results.failed === 0 && results.conflicts === 0) {
      this.updateSyncStatus(SyncStatus.SUCCESS);
      logger.info('同期が完了しました');
    } else if (results.failed > 0) {
      this.updateSyncStatus(SyncStatus.ERROR);
      logger.error(`同期エラー: ${results.failed}件の操作が失敗しました`);
    }
    
    logger.info(`SyncManager: Sync completed - Success: ${results.success}, Failed: ${results.failed}, Conflicts: ${results.conflicts}`);
    
    this.notifySyncListeners({
      type: 'sync_completed',
      results,
      queueLength: this.syncQueue.length
    });
    
    this.saveQueue();
    this.saveSyncState();
  }

  /**
   * 単一の操作を同期
   */
  async syncOperation(item) {
    logger.info(`SyncManager: Syncing operation ${item.id} (${item.operation})`);
    
    try {
      // 操作タイプに応じた処理を実行
      switch (item.operation) {
        case 'save_session':
          return await this.syncSession(item);
        case 'save_preferences':
          return await this.syncPreferences(item);
        case 'save_achievement':
          return await this.syncAchievement(item);
        case 'save_leaderboard':
          return await this.syncLeaderboard(item);
        case 'save_custom_text':
          return await this.syncCustomText(item);
        default:
          throw new Error(`Unknown operation type: ${item.operation}`);
      }
    } catch (error) {
      logger.error(`SyncManager: Failed to sync operation ${item.id}:`, error);
      return { success: false, error };
    }
  }

  /**
   * セッションデータの同期
   */
  async syncSession(item) {
    try {
      // Supabaseへの保存を試行
      const { data, error } = await window.supabaseClient
        .from('typing_sessions')
        .insert([{
          planet: item.data.planet,
          wpm: item.data.wpm,
          accuracy: item.data.accuracy,
          total_typed: item.data.totalTyped,
          total_errors: item.data.totalErrors,
          duration: item.data.duration,
          session_date: item.data.timestamp || new Date().toISOString(),
          local_id: item.id
        }]);
      
      if (error) {
        // データ競合の可能性をチェック
        if (error.code === '23505') { // Unique constraint violation
          return await this.checkForConflict(item, 'typing_sessions');
        }
        throw error;
      }
      
      logger.info(`SyncManager: Session ${item.id} synced successfully`);
      return { success: true, data };
    } catch (error) {
      logger.error(`SyncManager: Failed to sync session ${item.id}:`, error);
      return { success: false, error };
    }
  }

  /**
   * 設定の同期
   */
  async syncPreferences(item) {
    try {
      const { data, error } = await window.supabaseClient
        .from('user_preferences')
        .upsert([{
          ...item.data,
          updated_at: new Date().toISOString()
        }], { onConflict: 'user_id' });
      
      if (error) throw error;
      
      logger.info(`SyncManager: Preferences synced successfully`);
      return { success: true, data };
    } catch (error) {
      logger.error(`SyncManager: Failed to sync preferences:`, error);
      return { success: false, error };
    }
  }

  /**
   * 実績の同期
   */
  async syncAchievement(item) {
    try {
      const { data, error } = await window.supabaseClient
        .from('achievements')
        .insert([{
          ...item.data,
          unlocked_at: item.data.timestamp || new Date().toISOString()
        }]);
      
      if (error) {
        if (error.code === '23505') {
          // 実績は既に解放済み
          return { success: true, data: null };
        }
        throw error;
      }
      
      logger.info(`SyncManager: Achievement synced successfully`);
      return { success: true, data };
    } catch (error) {
      logger.error(`SyncManager: Failed to sync achievement:`, error);
      return { success: false, error };
    }
  }

  /**
   * リーダーボードスコアの同期
   */
  async syncLeaderboard(item) {
    try {
      const { data, error } = await window.supabaseClient
        .from('leaderboard')
        .insert([{
          ...item.data,
          created_at: item.data.timestamp || new Date().toISOString()
        }]);
      
      if (error) throw error;
      
      logger.info(`SyncManager: Leaderboard score synced successfully`);
      return { success: true, data };
    } catch (error) {
      logger.error(`SyncManager: Failed to sync leaderboard score:`, error);
      return { success: false, error };
    }
  }

  /**
   * カスタムテキストの同期
   */
  async syncCustomText(item) {
    try {
      const { data, error } = await window.supabaseClient
        .from('custom_texts')
        .insert([{
          ...item.data,
          created_at: item.data.timestamp || new Date().toISOString()
        }]);
      
      if (error) throw error;
      
      logger.info(`SyncManager: Custom text synced successfully`);
      return { success: true, data };
    } catch (error) {
      logger.error(`SyncManager: Failed to sync custom text:`, error);
      return { success: false, error };
    }
  }

  /**
   * データ競合のチェック
   */
  async checkForConflict(item, tableName) {
    try {
      // ローカルとリモートのタイムスタンプを比較
      const { data: remoteData, error } = await window.supabaseClient
        .from(tableName)
        .select('*')
        .eq('local_id', item.id)
        .single();
      
      if (error || !remoteData) {
        return { success: false, error };
      }
      
      const localTimestamp = new Date(item.timestamp).getTime();
      const remoteTimestamp = new Date(remoteData.session_date || remoteData.updated_at).getTime();
      
      if (localTimestamp > remoteTimestamp) {
        // ローカルデータの方が新しい
        return {
          success: false,
          conflict: true,
          conflictData: {
            local: item.data,
            remote: remoteData,
            resolution: 'local_newer'
          }
        };
      } else {
        // リモートデータの方が新しい、またはタイムスタンプが同じ
        return { success: true };
      }
    } catch (error) {
      logger.error('SyncManager: Error checking for conflict:', error);
      return { success: false, error };
    }
  }

  /**
   * データ競合の処理
   */
  async handleConflict(item, conflictData) {
    logger.warn(`SyncManager: Conflict detected for operation ${item.id}`);
    
    // 競合をローカルストレージに保存
    this.saveConflict({
      id: item.id,
      timestamp: Date.now(),
      item,
      conflictData
    });
    
    // 競合解決戦略に応じて処理
    if (this.conflictResolution === 'latest') {
      // 最新データを優先（タイムスタンプベース）
      if (conflictData.resolution === 'local_newer') {
        // ローカルデータで上書き
        try {
          await this.forceUpdateRemote(item);
          this.removeFromQueue(item.id);
          logger.info(`SyncManager: Conflict resolved - local data applied`);
        } catch (error) {
          logger.error('SyncManager: Failed to resolve conflict:', error);
        }
      } else {
        // リモートデータを優先
        this.removeFromQueue(item.id);
        logger.info(`SyncManager: Conflict resolved - remote data kept`);
      }
    } else {
      // 手動解決が必要
      this.notifySyncListeners({
        type: 'conflict_detected',
        conflict: { item, conflictData }
      });
    }
  }

  /**
   * リモートデータを強制更新
   */
  async forceUpdateRemote(item) {
    const tableName = this.getTableNameForOperation(item.operation);
    const { error } = await window.supabaseClient
      .from(tableName)
      .update(item.data)
      .eq('local_id', item.id);
    
    if (error) throw error;
  }

  /**
   * 同期失敗の処理
   */
  async handleSyncFailure(item, error) {
    item.retryCount = (item.retryCount || 0) + 1;
    item.lastError = error.message;
    item.lastAttempt = Date.now();
    
    if (item.retryCount >= this.maxRetries) {
      // 最大リトライ回数に達した
      item.status = 'failed';
      logger.error(`SyncManager: Operation ${item.id} failed after ${this.maxRetries} retries`);
      
      this.notifySyncListeners({
        type: 'sync_failed',
        item,
        error
      });
    } else {
      // リトライを予約
      item.status = 'retry_scheduled';
      const delay = this.retryDelay * Math.pow(2, item.retryCount - 1); // 指数バックオフ
      
      logger.warn(`SyncManager: Scheduling retry for operation ${item.id} (attempt ${item.retryCount + 1}/${this.maxRetries}) in ${delay}ms`);
      
      setTimeout(() => {
        if (this.isOnline) {
          this.syncAllQueued();
        }
      }, delay);
    }
    
    this.saveQueue();
  }

  /**
   * キューから操作を削除
   */
  removeFromQueue(itemId) {
    const index = this.syncQueue.findIndex(item => item.id === itemId);
    if (index !== -1) {
      this.syncQueue.splice(index, 1);
      logger.info(`SyncManager: Operation ${itemId} removed from queue`);
    }
  }

  /**
   * キューの保存
   */
  saveQueue() {
    try {
      localStorage.setItem(this.QUEUE_KEY, JSON.stringify(this.syncQueue));
    } catch (error) {
      logger.error('SyncManager: Failed to save queue:', error);
    }
  }

  /**
   * キューの復元
   */
  restoreQueue() {
    try {
      const saved = localStorage.getItem(this.QUEUE_KEY);
      if (saved) {
        this.syncQueue = JSON.parse(saved);
        logger.info(`SyncManager: Restored ${this.syncQueue.length} operations from queue`);
      }
    } catch (error) {
      logger.error('SyncManager: Failed to restore queue:', error);
      this.syncQueue = [];
    }
  }

  /**
   * 同期状態の保存
   */
  saveSyncState() {
    try {
      const state = {
        lastSyncTime: this.lastSyncTime,
        syncStatus: this.syncStatus,
        queueLength: this.syncQueue.length
      };
      localStorage.setItem(this.SYNC_STATE_KEY, JSON.stringify(state));
    } catch (error) {
      logger.error('SyncManager: Failed to save sync state:', error);
    }
  }

  /**
   * 競合の保存
   */
  saveConflict(conflict) {
    try {
      const conflicts = this.getConflicts();
      conflicts.push(conflict);
      localStorage.setItem(this.CONFLICT_KEY, JSON.stringify(conflicts));
    } catch (error) {
      logger.error('SyncManager: Failed to save conflict:', error);
    }
  }

  /**
   * 競合の取得
   */
  getConflicts() {
    try {
      const saved = localStorage.getItem(this.CONFLICT_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      logger.error('SyncManager: Failed to get conflicts:', error);
      return [];
    }
  }

  /**
   * 競合のクリア
   */
  clearConflicts() {
    try {
      localStorage.removeItem(this.CONFLICT_KEY);
    } catch (error) {
      logger.error('SyncManager: Failed to clear conflicts:', error);
    }
  }

  /**
   * 同期ステータスの更新
   */
  updateSyncStatus(status) {
    this.syncStatus = status;
    this.notifySyncListeners({ type: 'status_changed', status });
    this.saveSyncState();
  }

  /**
   * 同期リスナーの登録
   */
  addSyncListener(callback) {
    this.syncListeners.add(callback);
    return () => this.syncListeners.delete(callback);
  }

  /**
   * 同期リスナーへの通知
   */
  notifySyncListeners(event) {
    this.syncListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        logger.error('SyncManager: Error in sync listener:', error);
      }
    });
  }

  /**
   * 操作タイプからテーブル名を取得
   */
  getTableNameForOperation(operation) {
    const mapping = {
      'save_session': 'typing_sessions',
      'save_preferences': 'user_preferences',
      'save_achievement': 'achievements',
      'save_leaderboard': 'leaderboard',
      'save_custom_text': 'custom_texts'
    };
    return mapping[operation] || 'typing_sessions';
  }

  /**
   * ユニークIDの生成
   */
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 同期状態の取得
   */
  getSyncState() {
    return {
      status: this.syncStatus,
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      queueLength: this.syncQueue.length,
      lastSyncTime: this.lastSyncTime,
      conflicts: this.getConflicts().length
    };
  }

  /**
   * 手動同期のトリガー
   */
  async triggerManualSync() {
    logger.info('SyncManager: Manual sync triggered');
    logger.info('同期を開始しています...');
    await this.syncAllQueued();
  }

  /**
   * キューのクリア（デバッグ用）
   */
  clearQueue() {
    this.syncQueue = [];
    this.saveQueue();
    logger.info('SyncManager: Queue cleared');
  }

  /**
   * リセット（デバッグ用）
   */
  reset() {
    this.stopAutoSync();
    this.clearQueue();
    this.clearConflicts();
    this.syncStatus = SyncStatus.IDLE;
    this.isSyncing = false;
    this.lastSyncTime = null;
    this.syncListeners.clear();
    logger.info('SyncManager: Reset complete');
  }
}

// シングルトンインスタンスをエクスポート
export const syncManager = new SyncManager();

// グローバルアクセス用（循環参照を避けるため）
if (typeof window !== 'undefined') {
  window.syncManager = syncManager;
}
