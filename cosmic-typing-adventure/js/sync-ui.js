// Sync UI Component for Cosmic Typing Adventure
// 同期状態を視覚的に表示するUIコンポーネント

import { syncManager, SyncStatus } from './sync-manager.js';
import { logger } from './logger.js';

/**
 * 同期UIクラス
 * 同期状態のインジケーターと詳細パネルを管理
 */
class SyncUI {
  constructor() {
    this.indicator = null;
    this.detailPanel = null;
    this.isInitialized = false;
    this.unsubscribe = null;
  }

  /**
   * 初期化
   */
  initialize() {
    if (this.isInitialized) return;

    logger.info('SyncUI: Initializing...');

    // 同期インジケーターの作成
    this.createSyncIndicator();

    // 同期詳細パネルの作成
    this.createDetailPanel();

    // 同期マネージャーのイベントをリッスン
    this.unsubscribe = syncManager.addSyncListener((event) => {
      this.handleSyncEvent(event);
    });

    // 初期状態を表示
    this.updateIndicator(syncManager.getSyncState());

    this.isInitialized = true;
    logger.info('SyncUI: Initialized successfully');
  }

  /**
   * 同期インジケーターの作成
   */
  createSyncIndicator() {
    // 既存のインジケーターを削除
    const existing = document.getElementById('sync-indicator');
    if (existing) {
      existing.remove();
    }

    // 新しいインジケーターを作成
    this.indicator = document.createElement('div');
    this.indicator.id = 'sync-indicator';
    this.indicator.className = 'sync-indicator';
    this.indicator.innerHTML = `
      <div class="sync-indicator-content">
        <span class="sync-icon" id="sync-icon">🔄</span>
        <span class="sync-text" id="sync-text">同期中</span>
        <span class="sync-queue" id="sync-queue" style="display: none;"></span>
      </div>
    `;

    // クリックで詳細パネルを開く
    this.indicator.addEventListener('click', () => {
      this.toggleDetailPanel();
    });

    // ページに追加
    document.body.appendChild(this.indicator);

    // スタイルを追加
    this.injectStyles();
  }

  /**
   * 同期詳細パネルの作成
   */
  createDetailPanel() {
    // 既存のパネルを削除
    const existing = document.getElementById('sync-detail-panel');
    if (existing) {
      existing.remove();
    }

    // 新しいパネルを作成
    this.detailPanel = document.createElement('div');
    this.detailPanel.id = 'sync-detail-panel';
    this.detailPanel.className = 'sync-detail-panel';
    this.detailPanel.style.display = 'none';
    this.detailPanel.innerHTML = `
      <div class="sync-detail-header">
        <h3>同期状態</h3>
        <button class="sync-detail-close" id="sync-detail-close">✕</button>
      </div>
      <div class="sync-detail-body">
        <div class="sync-status-row">
          <span class="sync-status-label">ネットワーク:</span>
          <span class="sync-status-value" id="sync-network-status">オンライン</span>
        </div>
        <div class="sync-status-row">
          <span class="sync-status-label">同期状態:</span>
          <span class="sync-status-value" id="sync-current-status">待機中</span>
        </div>
        <div class="sync-status-row">
          <span class="sync-status-label">キュー:</span>
          <span class="sync-status-value" id="sync-queue-count">0件</span>
        </div>
        <div class="sync-status-row">
          <span class="sync-status-label">最終同期:</span>
          <span class="sync-status-value" id="sync-last-time">未実行</span>
        </div>
        <div class="sync-status-row">
          <span class="sync-status-label">競合:</span>
          <span class="sync-status-value" id="sync-conflicts-count">0件</span>
        </div>
        <div class="sync-actions">
          <button class="sync-action-btn" id="sync-manual-trigger">今すぐ同期</button>
          <button class="sync-action-btn secondary" id="sync-view-conflicts">競合を確認</button>
        </div>
        <div class="sync-queue-list" id="sync-queue-list"></div>
      </div>
    `;

    // イベントリスナーを追加
    this.detailPanel.querySelector('#sync-detail-close').addEventListener('click', () => {
      this.hideDetailPanel();
    });

    this.detailPanel.querySelector('#sync-manual-trigger').addEventListener('click', () => {
      syncManager.triggerManualSync();
    });

    this.detailPanel.querySelector('#sync-view-conflicts').addEventListener('click', () => {
      this.showConflicts();
    });

    // ページに追加
    document.body.appendChild(this.detailPanel);
  }

  /**
   * スタイルの注入
   */
  injectStyles() {
    const styleId = 'sync-ui-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .sync-indicator {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: white;
        border-radius: 50px;
        padding: 10px 20px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        cursor: pointer;
        z-index: 9999;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .sync-indicator:hover {
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        transform: translateY(-2px);
      }

      .sync-indicator-content {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .sync-icon {
        font-size: 20px;
        line-height: 1;
      }

      .sync-text {
        font-size: 14px;
        font-weight: 500;
        color: #374151;
      }

      .sync-queue {
        background: #3b82f6;
        color: white;
        border-radius: 12px;
        padding: 2px 8px;
        font-size: 12px;
        font-weight: 600;
      }

      /* 状態別のスタイル */
      .sync-indicator.idle {
        background: #f3f4f6;
      }

      .sync-indicator.syncing {
        background: #dbeafe;
      }

      .sync-indicator.syncing .sync-icon {
        animation: spin 1s linear infinite;
      }

      .sync-indicator.success {
        background: #d1fae5;
      }

      .sync-indicator.error {
        background: #fee2e2;
      }

      .sync-indicator.offline {
        background: #fef3c7;
      }

      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      /* 詳細パネル */
      .sync-detail-panel {
        position: fixed;
        bottom: 90px;
        right: 20px;
        width: 400px;
        max-width: calc(100vw - 40px);
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        z-index: 9998;
        overflow: hidden;
      }

      .sync-detail-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      .sync-detail-header h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }

      .sync-detail-close {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background 0.2s;
      }

      .sync-detail-close:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .sync-detail-body {
        padding: 20px;
        max-height: 500px;
        overflow-y: auto;
      }

      .sync-status-row {
        display: flex;
        justify-content: space-between;
        padding: 12px 0;
        border-bottom: 1px solid #e5e7eb;
      }

      .sync-status-row:last-of-type {
        border-bottom: none;
      }

      .sync-status-label {
        font-weight: 500;
        color: #6b7280;
      }

      .sync-status-value {
        font-weight: 600;
        color: #111827;
      }

      .sync-actions {
        display: flex;
        gap: 10px;
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #e5e7eb;
      }

      .sync-action-btn {
        flex: 1;
        padding: 10px 16px;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      .sync-action-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      }

      .sync-action-btn.secondary {
        background: #f3f4f6;
        color: #374151;
      }

      .sync-action-btn.secondary:hover {
        background: #e5e7eb;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .sync-queue-list {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #e5e7eb;
      }

      .sync-queue-item {
        padding: 12px;
        background: #f9fafb;
        border-radius: 8px;
        margin-bottom: 8px;
      }

      .sync-queue-item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
      }

      .sync-queue-item-type {
        font-weight: 600;
        color: #111827;
        font-size: 14px;
      }

      .sync-queue-item-status {
        font-size: 12px;
        padding: 2px 8px;
        border-radius: 12px;
        background: #e5e7eb;
        color: #6b7280;
      }

      .sync-queue-item-time {
        font-size: 12px;
        color: #9ca3af;
        margin-top: 4px;
      }

      /* モバイル対応 */
      @media (max-width: 768px) {
        .sync-indicator {
          bottom: 80px;
          right: 10px;
          padding: 8px 16px;
        }

        .sync-detail-panel {
          bottom: 140px;
          right: 10px;
          width: calc(100vw - 20px);
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * 同期イベントのハンドリング
   */
  handleSyncEvent(event) {
    logger.info('SyncUI: Handling sync event:', event.type);

    switch (event.type) {
      case 'status_changed':
        this.updateIndicator(syncManager.getSyncState());
        this.updateDetailPanel();
        break;
      
      case 'network':
        this.updateIndicator(syncManager.getSyncState());
        this.updateDetailPanel();
        break;
      
      case 'queue_updated':
        this.updateIndicator(syncManager.getSyncState());
        this.updateDetailPanel();
        break;
      
      case 'sync_completed':
        this.updateIndicator(syncManager.getSyncState());
        this.updateDetailPanel();
        break;
      
      case 'conflict_detected':
        this.showConflictNotification(event.conflict);
        break;
      
      case 'sync_failed':
        this.showErrorNotification(event.item, event.error);
        break;
    }
  }

  /**
   * インジケーターの更新
   */
  updateIndicator(state) {
    if (!this.indicator) return;

    const icon = this.indicator.querySelector('#sync-icon');
    const text = this.indicator.querySelector('#sync-text');
    const queue = this.indicator.querySelector('#sync-queue');

    // 状態に応じたアイコンとテキスト
    const statusConfig = {
      [SyncStatus.IDLE]: { icon: '✅', text: '同期完了', class: 'idle' },
      [SyncStatus.SYNCING]: { icon: '🔄', text: '同期中', class: 'syncing' },
      [SyncStatus.SUCCESS]: { icon: '✅', text: '同期完了', class: 'success' },
      [SyncStatus.ERROR]: { icon: '❌', text: '同期エラー', class: 'error' },
      [SyncStatus.OFFLINE]: { icon: '📡', text: 'オフライン', class: 'offline' }
    };

    const config = statusConfig[state.status] || statusConfig[SyncStatus.IDLE];

    // クラスの更新
    this.indicator.className = `sync-indicator ${config.class}`;

    // アイコンとテキストの更新
    icon.textContent = config.icon;
    text.textContent = config.text;

    // キュー数の表示
    if (state.queueLength > 0) {
      queue.textContent = `${state.queueLength}`;
      queue.style.display = 'block';
    } else {
      queue.style.display = 'none';
    }
  }

  /**
   * 詳細パネルの更新
   */
  updateDetailPanel() {
    if (!this.detailPanel) return;

    const state = syncManager.getSyncState();

    // ネットワーク状態
    const networkStatus = this.detailPanel.querySelector('#sync-network-status');
    if (networkStatus) {
      networkStatus.textContent = state.isOnline ? 'オンライン' : 'オフライン';
      networkStatus.style.color = state.isOnline ? '#10b981' : '#ef4444';
    }

    // 同期状態
    const currentStatus = this.detailPanel.querySelector('#sync-current-status');
    if (currentStatus) {
      const statusText = {
        [SyncStatus.IDLE]: '待機中',
        [SyncStatus.SYNCING]: '同期中',
        [SyncStatus.SUCCESS]: '完了',
        [SyncStatus.ERROR]: 'エラー',
        [SyncStatus.OFFLINE]: 'オフライン'
      };
      currentStatus.textContent = statusText[state.status] || '不明';
    }

    // キュー数
    const queueCount = this.detailPanel.querySelector('#sync-queue-count');
    if (queueCount) {
      queueCount.textContent = `${state.queueLength}件`;
    }

    // 最終同期時刻
    const lastTime = this.detailPanel.querySelector('#sync-last-time');
    if (lastTime) {
      if (state.lastSyncTime) {
        const date = new Date(state.lastSyncTime);
        lastTime.textContent = this.formatRelativeTime(date);
      } else {
        lastTime.textContent = '未実行';
      }
    }

    // 競合数
    const conflictsCount = this.detailPanel.querySelector('#sync-conflicts-count');
    if (conflictsCount) {
      conflictsCount.textContent = `${state.conflicts}件`;
      conflictsCount.style.color = state.conflicts > 0 ? '#ef4444' : '#10b981';
    }

    // キューリストの更新
    this.updateQueueList();
  }

  /**
   * キューリストの更新
   */
  updateQueueList() {
    const queueList = this.detailPanel.querySelector('#sync-queue-list');
    if (!queueList) return;

    const queue = syncManager.syncQueue;

    if (queue.length === 0) {
      queueList.innerHTML = '<p style="color: #9ca3af; text-align: center;">キューは空です</p>';
      return;
    }

    const operationNames = {
      'save_session': 'セッション保存',
      'save_preferences': '設定保存',
      'save_achievement': '実績解放',
      'save_leaderboard': 'スコア登録',
      'save_custom_text': 'カスタムテキスト'
    };

    queueList.innerHTML = queue.map(item => `
      <div class="sync-queue-item">
        <div class="sync-queue-item-header">
          <span class="sync-queue-item-type">${operationNames[item.operation] || item.operation}</span>
          <span class="sync-queue-item-status">${item.status || 'pending'}</span>
        </div>
        <div class="sync-queue-item-time">${this.formatRelativeTime(new Date(item.timestamp))}</div>
      </div>
    `).join('');
  }

  /**
   * 詳細パネルの表示切り替え
   */
  toggleDetailPanel() {
    if (this.detailPanel.style.display === 'none') {
      this.showDetailPanel();
    } else {
      this.hideDetailPanel();
    }
  }

  /**
   * 詳細パネルを表示
   */
  showDetailPanel() {
    if (!this.detailPanel) return;
    this.detailPanel.style.display = 'block';
    this.updateDetailPanel();
  }

  /**
   * 詳細パネルを非表示
   */
  hideDetailPanel() {
    if (!this.detailPanel) return;
    this.detailPanel.style.display = 'none';
  }

  /**
   * 競合を表示
   */
  showConflicts() {
    const conflicts = syncManager.getConflicts();
    
    if (conflicts.length === 0) {
      alert('競合はありません');
      return;
    }

    // 簡易的な競合表示（将来的にはモーダルで実装）
    const message = conflicts.map((c, i) => 
      `競合 ${i + 1}: ${c.item.operation} (${new Date(c.timestamp).toLocaleString('ja-JP')})`
    ).join('\n');

    alert(`検出された競合:\n\n${message}\n\n競合は自動的に最新データが優先されます。`);
  }

  /**
   * 競合通知の表示
   */
  showConflictNotification(conflict) {
    logger.warn('SyncUI: Conflict notification:', conflict);
    // 実装: トースト通知やモーダルで表示
  }

  /**
   * エラー通知の表示
   */
  showErrorNotification(item, error) {
    logger.error('SyncUI: Error notification:', item, error);
    // 実装: トースト通知で表示
  }

  /**
   * 相対時刻のフォーマット
   */
  formatRelativeTime(date) {
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}日前`;
    if (hours > 0) return `${hours}時間前`;
    if (minutes > 0) return `${minutes}分前`;
    if (seconds > 0) return `${seconds}秒前`;
    return 'たった今';
  }

  /**
   * クリーンアップ
   */
  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }

    if (this.indicator) {
      this.indicator.remove();
      this.indicator = null;
    }

    if (this.detailPanel) {
      this.detailPanel.remove();
      this.detailPanel = null;
    }

    this.isInitialized = false;
    logger.info('SyncUI: Destroyed');
  }
}

// シングルトンインスタンスをエクスポート
export const syncUI = new SyncUI();
