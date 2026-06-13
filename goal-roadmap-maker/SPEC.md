# 目標ロードマップメーカー 技術仕様書

## 1. アプリケーション概要

### 1.1 基本情報
- **アプリケーション名**: 目標ロードマップメーカー (Goal Roadmap Maker)
- **技術スタック**: HTML5, CSS3, JavaScript (ES6+), Service Worker, PWA
- **UI フレームワーク**: TailwindCSS, Font Awesome
- **データ管理**: LocalStorage
- **対応ブラウザ**: Chrome, Firefox, Safari, Edge (最新版)

### 1.2 主要機能
1. 目標管理（CRUD）
2. カスタムステップ管理
3. 進捗トラッキング
4. 多言語対応（日本語・英語）
5. PWA対応（オフライン機能）
6. レスポンシブデザイン

## 2. データ構造

### 2.1 Goal オブジェクト
```javascript
{
  id: number,                    // 一意識別子
  title: string,                 // 目標タイトル
  description: string,           // 目標説明
  type: 'habit' | 'project' | 'numeric', // 目標タイプ
  deadline: string,              // 達成期限 (ISO形式)
  createdAt: string,             // 作成日時 (ISO形式)
  completed: boolean,            // 完了状態
  completedAt: string | null,    // 完了日時
  customSteps: Step[],           // カスタムステップ配列
  tasks: MonthlyTask[]           // 自動生成タスク配列
}
```

### 2.2 Step オブジェクト
```javascript
{
  id: number,                    // 一意識別子
  title: string,                 // ステップタイトル
  description: string,           // ステップ説明
  startDate: string,             // 開始日 (ISO形式)
  endDate: string,               // 終了日 (ISO形式)
  priority: 'high' | 'medium' | 'low', // 優先度
  completed: boolean,            // 完了状態
  completedAt: string | null,    // 完了日時
  createdAt: string              // 作成日時
}
```

## 3. 主要関数仕様

### 3.1 目標管理関数
- `createGoal()`: 新規目標作成
- `showGoalDetails(goalId)`: 目標詳細表示
- `showDeleteGoalConfirm(goalId)`: 削除確認ダイアログ表示
- `deleteGoal()`: 目標削除実行
- `calculateGoalProgress(goal)`: 目標進捗計算

### 3.2 ステップ管理関数
- `showAddStepModal(goalId)`: ステップ追加モーダル表示
- `addStep()`: カスタムステップ追加
- `toggleStepCompletion(goalId, stepId)`: ステップ完了状態切り替え
- `deleteStep(goalId, stepId)`: ステップ削除

### 3.3 ビュー管理関数
- `switchView(viewName)`: ビュー切り替え
- `updateRoadmapView()`: ロードマップビュー更新
- `updateCalendarView()`: カレンダービュー更新
- `updateDailyView()`: 日次ビュー更新

### 3.4 ユーティリティ関数
- `saveGoals()`: LocalStorageへの保存
- `loadGoals()`: LocalStorageから読み込み
- `showNotification(message, type)`: 通知表示
- `updateI18n()`: 多言語更新

## 4. モーダル・ダイアログ仕様

### 4.1 目標作成モーダル (`#goalModal`)
- フィールド: タイトル, タイプ, 期限, 説明
- バリデーション: タイトル必須, 期限必須
- 保存時: `createGoal()` 実行

### 4.2 ステップ追加モーダル (`#stepModal`)
- フィールド: タイトル, 説明, 開始日, 終了日, 優先度
- バリデーション: タイトル必須, 日付整合性チェック
- 保存時: `addStep()` 実行

### 4.3 削除確認モーダル (`#deleteGoalModal`)
- 機能: 削除前の確認, 関連データ警告表示
- アクション: 削除実行 / キャンセル

### 4.4 目標詳細モーダル (`#goalDetailsModal`)
- 表示内容: 基本情報, 進捗, カスタムステップ一覧
- 操作: ステップ完了切り替え, ステップ削除, 目標削除

## 5. ビュー仕様

### 5.1 ロードマップビュー
- 表示: 全目標のカード形式一覧
- 操作: ステップ追加, 詳細表示, 削除
- ソート: 作成日順

### 5.2 カレンダービュー
- 表示: 月次カレンダー形式
- 表示内容: 各日のタスク, 期限, 完了状態
- 操作: タスク完了切り替え

### 5.3 日次タスクビュー
- 表示: 今日のタスク一覧
- フィルタ: 完了/未完了
- 操作: タスク完了切り替え

## 6. PWA仕様

### 6.1 Service Worker
- ファイル: `sw.js`
- キャッシュ戦略: Cache First
- オフライン対応: 全ページ, CSS, JS, 画像

### 6.2 Manifest
- ファイル: `manifest.json`
- アイコン: 192x192, 512x512
- 表示モード: standalone
- テーマカラー: #3b82f6

## 7. 多言語対応

### 7.1 対応言語
- 日本語 (ja) - デフォルト
- 英語 (en)

### 7.2 実装方式
- 翻訳データ: JavaScript オブジェクト内定義
- 切り替え: `data-i18n` 属性ベース
- 保存: LocalStorage

## 8. レスポンシブ対応

### 8.1 ブレークポイント
- Mobile: ~768px
- Tablet: 768px~1024px  
- Desktop: 1024px~

### 8.2 適応項目
- サイドバー: モバイルで折りたたみ
- グリッド: カラム数調整
- フォントサイズ: ユーザー選択可能

## 9. エラーハンドリング

### 9.1 データ検証
- 入力値検証
- データ型チェック
- 必須項目チェック

### 9.2 例外処理
- LocalStorage エラーハンドリング
- JSON パースエラー対応
- DOM 要素不存在エラー対応

## 10. パフォーマンス要件

- 初期ロード: 3秒以内
- 画面遷移: 1秒以内
- データ保存: 即時（非同期）
- メモリ使用量: 50MB以下

## 11. セキュリティ

- XSS対策: 入力値サニタイズ
- データ保護: ローカルのみ保存
- 外部API: なし（完全オフライン動作）

## 12. AI開発対応アーキテクチャ (v1.4.0)

### 12.1 モジュール構造
- **src/core/models/**: データモデル層（GoalModel）
- **src/core/services/**: ビジネスロジック層（GoalService）
- **src/ui/components/**: UI コンポーネント層（GoalComponent）
- **明確な責任分離**: 単一責任の原則遵守

### 12.2 AI開発支援機能
- **自己文書化コード**: JSDocによる型情報完備
- **テスタブル設計**: 各モジュールの独立性確保
- **エラーハンドリング**: 一貫したエラー処理パターン
- **イベント駆動**: オブザーバーパターンによる疎結合

### 12.3 開発効率化
- **パターン統一**: 同一の処理は同一パターンで実装
- **モック対応**: 外部依存の抽象化
- **デバッグ支援**: 詳細ログとエラー追跡
- **変更影響分析**: 明確な依存関係定義

## 13. テスト要件

### 13.1 機能テスト
- 目標CRUD操作
- ステップ管理操作  
- ビュー切り替え
- データ永続化

### 13.2 UI/UX テスト
- レスポンシブ対応
- アクセシビリティ
- ブラウザ互換性
- PWA機能

### 13.3 退行テスト
- 既存機能の動作確認
- データ整合性チェック
- エラーハンドリング検証

## 14. 最新アップデート (v1.5.2)

### 14.1 モバイルUI改善
- **モバイルサイドバー実装**: 右スライドサイドバーで全機能アクセス
- **ハンバーガーメニュー連携**: lg:hidden breakpoint対応
- **オーバーレイ機能**: 背景クリックで閉じる操作
- **アニメーション**: CSS transform transition対応

### 14.2 PWA機能強化
- **ServiceWorker最適化**: 環境別パス解決（localhost vs GitHub Pages）
- **manifest.json改善**: 相対パス使用でGitHub Pages対応
- **アイコン問題解決**: パス統一化による404エラー回避
- **メタタグ最適化**: deprecated警告解消

### 14.3 UIManager拡張
```javascript
// 新規メソッド
toggleMobileMenu(): void    // モバイルサイドバー開閉
closeMobileMenu(): void     // モバイルサイドバー強制閉じ
showModal(modalId): void    // モーダル表示
switchView(viewName): void  // ビュー切り替え
```

### 14.4 イベント処理改善
- モバイルメニューボタン (#mobileMenuToggle)
- サイドバー閉じるボタン (#closeMobileSidebar)  
- オーバーレイクリック (#mobileOverlay)
- ESCキー対応・モーダル背景クリック対応

### 14.5 テスト環境整備
- モバイル専用テストスイート (test-mobile-sidebar.js)
- レスポンシブビューポート対応 (375x667px)
- 自動機能検証・スクリーンショット取得
- gitignore整備（開発ファイル除外）
## 15. PWA品質改善 (v1.5.6)

### 15.1 PWA theme-colorダークモード対応
- **対象ファイル**: index.html, app.html, lp.html, contact.html, terms.html, privacy.html, privacy-policy.html, usage.html
- **変更内容**: `<meta name="theme-color">` を media属性付き2タグに変更
  - ライトモード: `content="#3b82f6"` (青)
  - ダークモード: `content="#111827"` (ダークグレー)
- **効果**: JSロード前からダークモード時に正しいステータスバー色が表示される

### 15.2 console.log削除（本番品質向上）
- **対象ファイル**: js/goal-manager.js
- **変更内容**: 開発用console.logを全削除（console.errorは維持）
- **効果**: ユーザーの開発者ツールへの内部ロジック情報露出を防止
