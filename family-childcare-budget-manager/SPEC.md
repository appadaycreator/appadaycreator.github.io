# ファミリー養育費管理システム 技術仕様書

## 1. システム概要

### 1.1 プロジェクト名
Family Childcare Budget Manager (ファミリー養育費管理システム)

### 1.2 目的
夫婦が協力して子供の教育費を計画的に貯蓄・管理するためのWebアプリケーション

### 1.3 主要機能
- ユーザー認証・管理
- 口座管理（追加・編集・削除）
- 支出記録・管理
- データ分析・可視化
- リアルタイムデータ同期
- PWA対応（オフライン利用）

## 2. アーキテクチャ

### 2.1 システム構成
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│                 │     │                  │     │                 │
│  フロントエンド  │ ←→ │    Supabase     │ ←→ │  PostgreSQL    │
│  (静的HTML/JS)  │     │  (BaaS/Auth)    │     │  (Database)    │
│                 │     │                  │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         ↓
┌─────────────────┐
│                 │
│  GitHub Pages   │
│  (Hosting)      │
│                 │
└─────────────────┘
```

### 2.2 技術スタック

#### フロントエンド
- **HTML5**: セマンティックマークアップ
- **CSS**: Tailwind CSS 2.2.19 (CDN)
- **JavaScript**: Vanilla JS (ES6+)
- **ライブラリ**:
  - Chart.js 3.9.1 (データ可視化)
  - Font Awesome 6.4.0 (アイコン)
  - Supabase JS Client 2.39.0

#### バックエンド
- **Supabase**: 
  - 認証サービス
  - リアルタイムデータベース
  - Row Level Security (RLS)
  - PostgreSQL データベース

#### インフラ
- **ホスティング**: GitHub Pages
- **CDN**: jsDelivr, unpkg
- **分析**: Google Tag Manager

## 3. データベース設計

### 3.1 テーブル構成

#### users (Supabase Auth管理)
```sql
- id: UUID (Primary Key)
- email: VARCHAR(255)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### budgets
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key → users.id)
- month: VARCHAR(7) -- 'YYYY-MM'形式
- monthly_goal: DECIMAL(10,2)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### accounts
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key → users.id)
- name: VARCHAR(100)
- type: VARCHAR(50) -- 'childcare', 'education', 'emergency'
- balance: DECIMAL(10,2)
- monthly_target: DECIMAL(10,2)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### categories
```sql
- id: UUID (Primary Key)
- name: VARCHAR(50)
- color: VARCHAR(7) -- '#RRGGBB'形式
- icon: VARCHAR(50)
- created_at: TIMESTAMP
```

#### expenses
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key → users.id)
- account_id: UUID (Foreign Key → accounts.id)
- category_id: UUID (Foreign Key → categories.id)
- amount: DECIMAL(10,2)
- description: TEXT
- date: DATE
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### 3.2 Row Level Security (RLS) ポリシー

各テーブルに対して以下のRLSポリシーを適用:
- SELECT: user_id = auth.uid()
- INSERT: user_id = auth.uid()
- UPDATE: user_id = auth.uid()
- DELETE: user_id = auth.uid()

## 4. API仕様

### 4.1 認証API (Supabase Auth)

#### サインアップ
```javascript
POST /auth/v1/signup
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### ログイン
```javascript
POST /auth/v1/token?grant_type=password
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### ログアウト
```javascript
POST /auth/v1/logout
Headers: {
  "Authorization": "Bearer {access_token}"
}
```

### 4.2 データAPI (Supabase REST)

#### 口座一覧取得
```javascript
GET /rest/v1/accounts
Headers: {
  "Authorization": "Bearer {access_token}",
  "apikey": "{anon_key}"
}
```

#### 口座追加
```javascript
POST /rest/v1/accounts
Headers: {
  "Authorization": "Bearer {access_token}",
  "apikey": "{anon_key}",
  "Content-Type": "application/json"
}
Body: {
  "name": "教育費",
  "type": "education",
  "balance": 0,
  "monthly_target": 50000
}
```

#### 支出記録
```javascript
POST /rest/v1/expenses
Headers: {
  "Authorization": "Bearer {access_token}",
  "apikey": "{anon_key}",
  "Content-Type": "application/json"
}
Body: {
  "account_id": "uuid",
  "category_id": "uuid",
  "amount": 5000,
  "description": "参考書購入",
  "date": "2024-12-24"
}
```

## 5. ファイル構成

```
family-childcare-budget-manager/
├── index.html          # メインアプリケーション
├── lp.html            # ランディングページ
├── how-to-use.html    # 使い方ガイド
├── contact.html       # お問い合わせ
├── privacy.html       # プライバシーポリシー
├── terms.html         # 利用規約
├── function.html      # 機能一覧（新規作成予定）
├── README.md          # プロジェクト説明
├── SPEC.md           # 技術仕様書（本ファイル）
├── manifest.json      # PWA設定
├── sw.js             # Service Worker
├── robots.txt        # SEO設定
├── sitemap.xml       # サイトマップ
├── sql/
│   └── database-schema.sql  # データベーススキーマ
├── tests/
│   └── test-suite.html      # テストスイート
└── .github/
    └── workflows/           # GitHub Actions

```

## 6. セキュリティ仕様

### 6.1 認証・認可
- Supabase Authによるメール/パスワード認証
- JWTトークンベースの認証
- Row Level Security (RLS) によるデータアクセス制御

### 6.2 データ保護
- HTTPS通信の強制
- Supabase環境変数の使用（APIキー等）
- クライアントサイドでの最小限のデータ保持

### 6.3 入力検証
- フロントエンドでの入力値検証
- SQLインジェクション対策（Supabase RLS）
- XSS対策（HTMLエスケープ）

## 7. パフォーマンス仕様

### 7.1 最適化施策
- Service Workerによるキャッシング
- 静的アセットのCDN配信
- 画像の遅延読み込み
- Chart.jsの動的インポート

### 7.2 目標パフォーマンス
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Lighthouse Score: > 90

## 8. PWA仕様

### 8.1 manifest.json設定
```json
{
  "name": "ファミリー養育費管理",
  "short_name": "養育費管理",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3B82F6",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 8.2 Service Worker機能
- オフラインキャッシング
- バックグラウンド同期
- プッシュ通知（将来実装予定）

## 9. ブラウザ対応

### 9.1 対応ブラウザ
- Chrome 90+
- Safari 14+
- Firefox 88+
- Edge 90+

### 9.2 モバイル対応
- iOS 14+
- Android 8+
- レスポンシブデザイン対応

## 10. 開発・デプロイ

### 10.1 開発環境
```bash
# ローカルサーバー起動
python -m http.server 8000

# 環境変数設定
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
```

### 10.2 デプロイプロセス
1. GitHubリポジトリへのプッシュ
2. GitHub Pagesの自動デプロイ
3. Service Workerキャッシュバージョン更新

### 10.3 テスト
- ユニットテスト: tests/test-suite.html
- E2Eテスト: 手動テスト（将来自動化予定）
- ブラウザ互換性テスト

## 11. 監視・分析

### 11.1 アナリティクス
- Google Tag Manager (GTM-TXQGZRF9)
- ユーザー行動分析
- エラートラッキング

### 11.2 エラー監視
- コンソールエラーログ
- Supabaseエラーハンドリング
- ユーザーフィードバック収集

## 12. 今後の拡張計画

### 12.1 機能拡張
- [ ] 予算アラート機能
- [ ] 家族メンバー管理
- [ ] 領収書画像アップロード
- [ ] AIによる支出分析・提案
- [ ] 複数通貨対応

### 12.2 技術改善
- [x] アプリケーション安定性向上（2024.12完了）
  - getFromLocalStorage未定義エラーの解消
  - 初期化プロセスのエラーハンドリング強化
  - Try-catch文による堅牢なエラー処理の実装
- [x] 支出管理機能の完全修正（2024.12完了）
- [x] フォームフィールド名の修正とデータ保存機能（2024.12完了）
- [x] リアルタイム支出履歴表示機能（2024.12完了）
- [x] サイドバーナビゲーション改善（2024.12完了）
- [x] 使い方ページへのアクセス性向上（2024.12完了）
- [x] 外部リンクナビゲーション修正（preventDefault条件分岐改善、2024.12完了）
- [ ] TypeScript導入
- [ ] コンポーネントベースアーキテクチャ
- [ ] 自動テストの充実
- [ ] CI/CDパイプライン構築
- [ ] パフォーマンス監視ツール導入

## 13. ライセンス

MITライセンス

---

## 14. 更新履歴

### v1.2.0 (2026-06-04)
#### アクセシビリティ強化（WCAG 2.1 AA準拠・フェーズ2・P1実装完了）
- [x] ボタンaria-label完全実装
  - モーダルフォームのボタン群
    - 新規口座追加：`aria-label="新規口座を追加"` （line 1188）
    - 口座追加キャンセル：`aria-label="新規口座追加ダイアログを閉じる"` （line 1189）
    - 口座情報更新：`aria-label="口座情報を更新"` （line 1218）
    - 口座編集キャンセル：`aria-label="口座編集ダイアログを閉じる"` （line 1220）
    - 入金記録：`aria-label="入金を記録"` （line 1242）
    - 入金記録キャンセル：`aria-label="入金記録ダイアログを閉じる"` （line 1243）
    - 支出記録：`aria-label="支出を記録"` （line 1280）
    - 支出追加キャンセル：`aria-label="支出追加ダイアログを閉じる"` （line 1281）
  - 既実装（v1.1.0）の継続
    - 通知設定トグル（月末レポート・目標達成アラート）
    - データ管理ボタン（エクスポート・同期・削除）
    - ランディングページのCTAボタン（今すぐ始める・アカウント作成）
    - シェアモーダルボタン（Twitter・Facebook・LINE）
    - 口座操作ボタン（編集・メニュー・入金記録）
- [x] PWA theme-color設定確認・最適化完了
  - manifest.json: `"theme_color": "#3B82F6"` ✅ （Primary Blue色で統一）
  - HTMLメタタグ: `<meta name="theme-color" content="#3B82F6">` ✅
  - 両ファイルの色設定が一貫性を持つ
- 改善効果
  - スクリーンリーダー利用者がすべてのボタン機能を正確に理解可能
  - キーボードナビゲーション時の操作意図が明確化
  - WCAG 2.1 AA レベルの達成基準 1.4.3（コントラスト）と 4.1.2（名前・役割・値）に準拠

### v1.3.0 (2026-06-05)
#### UX改善・初回ユーザーガイダンス・パフォーマンス最適化（フェーズ2・P1-P2実装完了）
- [x] 初回ユーザー向けオンボーディングモーダル実装
  - 3ステップガイド: アプリ説明 → 口座作成 → 支出記録
  - localStorage で `hasVisited` フラグを管理（初回訪問判定）
  - スキップ・次へ・完了ボタンで柔軟な操作導線
  - 既存モーダルと統一されたデザイン
- [x] チャート読み込み中のスケルトンローダー実装
  - 年間貯蓄推移・支出分析チャート用スケルトン UI
  - グレーアウトアニメーション（loading animation）で読み込み中を表示
  - Canvas 表示前にスケルトンを表示・完全読み込み後に自動消滅
- 改善効果
  - 初回訪問ユーザーが機能を理解しやすく、利用開始率向上
  - チャート読み込み中の不安を軽減（UX向上）
  - ページ遷移時の体感速度が改善

### v1.3.1 (2026-06-06)
#### PWA設定の最適化・アイコン設定修正（フェーズ1-2自動改善実装）
- [x] PWA manifest.json アイコン設定の最適化
  - favicon.ico の重複削除（16x16・32x32）
  - 192x192・512x512 PNG アイコンのみに統一
  - モバイルアプリケーション化時のアイコン表示をクリーン化
- [x] theme-color 設定の確認・検証
  - manifest.json: `"theme_color": "#3B82F6"` ✅
  - index.html メタタグ: `<meta name="theme-color" content="#3B82F6">` ✅
  - PWA インストール時のアドレスバー・ステータスバー色が統一
- [x] H1 セマンティックタグの確認
  - ダッシュボード：`<h1>ファミリー養育費管理</h1>`（既実装）
  - ページ見出し階層が正規化済み（h1→h2→h3）
- 改善効果
  - PWA インストール時のユーザー体験が向上（アイコン表示の正確性向上）
  - SEO スコアの向上（H1 タグによる構造化強化）
  - ブラウザネイティブのPWA検出が改善

### v1.4.0 (2026-06-06)
#### ダークモード完全対応・設定ページ修正・エクスポート改善（フェーズ2・P1-P2実装完了）
- [x] ダークモードのTailwind UI完全対応
  - `[data-theme="dark"]` セレクタにTailwindハードコードクラス上書きCSSを追加
  - ヘッダー・ナビ・カード内テキスト・背景・入力フォームがダークモードに対応
  - `text-gray-800`, `text-gray-600`, `bg-white`, `bg-gray-100`, `border-gray-200` 等を暗色で上書き
- [x] 設定ページのバージョン情報・リンク修正（P1）
  - バージョン表示: `1.0.0` → `1.3.1` に更新
  - 最終更新日: `2024年1月15日` → `2026年6月6日` に更新
  - 利用規約リンク: `href="#"` → `terms.html` に修正
  - プライバシーポリシーリンク: `href="#"` → `privacy.html` に修正
  - お問い合わせリンク: `href="#"` → `contact.html` に修正
- [x] データエクスポートボタンの確実な紐付け改善
  - ボタンに `id="exportDataBtn"` を付与（querySelector による脆弱な参照を廃止）
  - `getElementById` ベースのイベントリスナー設定に変更（信頼性向上）
- 改善効果
  - ダークモード設定が視覚的に正しく反映されるようになり、夜間利用体験が向上
  - 設定ページの古い情報による不信感を解消
  - 外部ページへのリンクが正常に機能し、法的コンテンツへのアクセスが可能に

### v1.4.1 (2026-06-10)
#### UX改善：入力フィールドへのplaceholder属性追加（M2施策実装）
- [x] 8個のinput要素へplaceholder属性を追加
  - 口座編集フォーム: 口座名（`例: 教育費口座`）、残高（`1000000`）、月間目標（`50000`）
  - 入金記録フォーム: 日付（`YYYY-MM-DD`）
  - 支出追加フォーム: 日付（`YYYY-MM-DD`）
  - ログインフォーム: メールアドレス（`your@email.com`）、パスワード（`パスワード入力`）
  - その他フォーム: 金額入力フィールド（`金額`）
- 改善効果
  - ユーザーが入力欄に何を入力すべきか直感的に理解でき、入力エラーが削減
  - フォーム完成度向上、初回ユーザーの学習曲線が緩和
  - UX改善による利用開始率向上、ドロップレート低下

最終更新日: 2026年6月10日
リリース対象: family-childcare-budget-manager v1.4.1