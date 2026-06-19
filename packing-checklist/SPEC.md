# 持ち物チェックリスト - 技術仕様書

## アプリケーション概要

**名称**: 持ち物チェックリスト (Packing Checklist)
**バージョン**: 1.7.0
**更新日**: 2026-06-20
**URL**: https://appadaycreator.github.io/packing-checklist/

旅行・出張・日常の持ち物をチェックリストで管理するPWAアプリ。
テンプレートから素早く作成でき、忘れ物をゼロにする。

## 機能仕様

### 1. チェックリスト機能

#### 1.1 データ構造

```javascript
// チェックリスト
{
  id: string,           // UID
  name: string,         // リスト名（必須）
  tripType: string,     // 旅行種別（travel/business/overseas）
  departureDate: string,// 出発日（ISO形式）
  days: number,         // 泊数
  items: array,         // アイテム配列
  createdAt: string     // 作成日時
}

// アイテム
{
  id: string,
  name: string,         // アイテム名（必須）
  category: string,     // カテゴリ
  quantity: number,     // 個数
  required: boolean,    // 必須フラグ
  checked: boolean,     // チェック済みフラグ
  note: string          // メモ
}
```

#### 1.2 テンプレート

| テンプレート名 | 種別 | 説明 |
|-------------|------|------|
| 国内旅行 | travel | 1泊2日〜の国内旅行に最適 |
| 出張 | business | 1泊2日の出張に最適 |
| 海外旅行 | overseas | 海外旅行に必要な持ち物一覧 |

### 2. データ管理

#### 2.1 ストレージ

- **ローカルストレージ**: `sb_` プレフィックスのキーで管理
- Supabaseモック（インライン実装）でlocalStorageをラップ
- 外部API通信なし

```javascript
localStorage.getItem('sb_checklists')   // チェックリスト配列
localStorage.getItem('sb_items')        // アイテム配列
localStorage.getItem('language')        // 言語設定（'ja'|'en'）
localStorage.getItem('fontSize')        // フォントサイズ
```

### 3. UI/UX仕様

#### 3.1 画面構成

| セクション | ID | 概要 |
|-----------|-----|------|
| ホーム | home-section | 統計・最近のリスト |
| テンプレート | templates-section | テンプレート一覧・検索 |
| チェックリスト | checklist-section | リスト詳細・操作 |
| 履歴 | history-section | 過去のリスト |
| お気に入り | favorite-items | よく使うアイテム |
| お問い合わせ | contact-section | コンタクトフォーム |

#### 3.2 グラフ表示（Chart.js）

- **progress-chart**: チェック進捗（ドーナツグラフ）
- **monthly-chart**: 月次利用統計（棒グラフ）

#### 3.3 共有機能

- URL共有（クリップボードコピー）
- Twitter（X）共有

### 4. 多言語対応

- 日本語 (ja) / 英語 (en)
- CSSクラスベース切り替え

### 5. PWA対応

- マニフェスト: `manifest.json`
- Service Worker: `sw.js`（Cache First戦略）
- オフライン対応

### 6. アクセシビリティ

- フォントサイズ変更（font-size-select / font-size-toggle）
- レスポンシブデザイン（モバイルファースト）

## テスト

| ファイル | フレームワーク | 概要 |
|---------|--------------|------|
| `tests/e2e/packing-checklist.spec.js` | Playwright | 本番URL対象E2E（Jest対象外） |

```bash
# Playwrightテスト（本番デプロイ後）
npx playwright test
```

## 開発環境

```bash
# ローカルサーバー起動
python -m http.server 8000
# http://localhost:8000/packing-checklist/
```

## デプロイ

GitHub Pages（mainブランチ push → 自動デプロイ）

## 変更履歴

### v1.7.0 (2026-06-20)
- V1: ローディング画面のUX改善（アニメーション強化・進捗メッセージ・バウンスドット追加）
- V2: Cookie同意バナーのボタン視認性改善（サイズ拡大・ボーダー追加・コントラスト向上・localStorage保存修正）
- V3: Cookie通知のテキスト可読性改善（背景色濃化・テキストコントラスト強化・行間改善）

### v1.6.0 (2026-06-19)
- M2: アイテム追加モーダルのUX改善（入力フォーム・バリデーション強化）
  - アイテム名フィールドにplaceholder追加（「例：パスポート、充電器、常備薬...」）
  - 全フィールドにaria-label・for属性を追加（アクセシビリティ向上）
  - アイテム名の必須バリデーション実装（空の場合は赤枠＋エラーメッセージ表示）
  - 数量フィールドにスライダーと連動する数値入力を追加（1～20のスライダー・1～99の手入力対応）
  - カテゴリセレクトに「-- カテゴリを選択 --」のプレースホルダーオプション追加
  - メモフィールドにplaceholder追加（「例：ブランド名・サイズ・注意事項など」）

### v1.5.0 (2026-06-13)
- M2: コア機能のUX改善（入力UI・バリデーション） - フェーズ2直接実装
  - P1: テンプレート検索・フィルター入力にラベルを追加（検索補助テキスト「例：旅行、出張...」追記）
  - P1: チェックリスト基本情報に数値スライダーを追加（日数・参加人数をスライダー＋数値入力で双方向同期）
  - P1: 入力フォーム全体にplaceholder文を充実（具体例：「例：沖縄旅行」「例：田中 太郎」）
  - P2: 入力バリデーション・エラーメッセージを実装
    - チェックリスト名の必須バリデーション
    - 出張情報の日数（1～30日）・参加人数（1～20人）の範囲チェック
    - お問い合わせフォーム全体の詳細バリデーション
      - 名前：2文字以上の入力要求
      - メール：正規表現による有効性チェック
      - メッセージ：10～500文字の文字数チェック（リアルタイム文字数表示付き）
  - P2: aria-label属性の強化（入力補助テキスト付き）
  - P3: 入力エラー時のビジュアルフィードバック（赤枠＆背景色変更）
  - P3: CSS拡張（range input の見栄え改善・スライダーデザイン）

### v1.4.0 (2026-06-06)
- P1: `pc-delete-modal` / `pc-complete-modal` をHTMLに追加（削除確認ダイアログ・全完了モーダルが機能していなかった）
- P1: カテゴリフィルターのバグ修正（英語値で日本語テキストを検索していたため全カテゴリで非表示になっていた）
  - `updateItemsList()` でアイテムカードに `data-category` 属性を付与
  - `filterItemsByCategory()` を `card.dataset.category` 参照に変更
- P2: チェックリスト操作ボタンをモバイル対応（`flex-wrap gap-2`、モバイルではアイコンのみ表示）
- P2: 利用規約の第2条「Supabaseで管理」→ローカルストレージ説明に修正
- P2: 使い方の「5. アカウント登録」→「5. データの保存」に修正（LocalStorage説明）
- P2: ナビ・カテゴリフィルター・フォントサイズ・言語切り替えボタンに `data-ux="1"` を付与（`ux-behavior`スクリプトによる8秒disabled問題を解消）

### v1.3.0 (2026-06-04)
- P1: ボタンのaria-label属性を全7件に追加（アクセシビリティ改善）
  - `#login-btn` → aria-label="ログイン情報"
  - `#create-checklist` → aria-label="新しいチェックリストを作成"
  - `#quick-start` → aria-label="クイックスタート"
  - `#save-checklist` → aria-label="チェックリストを保存"
  - `#share-checklist` → aria-label="チェックリストを共有"
  - `#copy-checklist-text` → aria-label="チェックリストをテキストでコピー"
  - `#add-item` → aria-label="アイテムを追加"

### v1.2.0 (2026-05-31)
- P1: チェック状態の自動保存バグ修正（`toggleItem()`でlocalStorageへ即時保存）
- P1: アイテムカテゴリ表示を日本語化（`categoryLabels`マップを`updateItemsList()`に適用）
- P2: 「ログイン」ボタンを「💾 登録不要」インジケーターに変更（LocalStorage専用App表明）
- P2: クイックスタートを国内旅行テンプレートの即時作成に変更（テンプレート一覧遷移廃止）
- P2: 空リスト時にドーナツグラフを非表示化（アイテムなし時のcanvas display:none）
- P3: 「天気予報」ラベルを「季節の準備ヒント」に変更
- P3: head内の壊れたSVGファビコンテキストノードを削除（HTMLバリデーション改善）

### v1.1.0 (2026-05-29)
- P1: PWA theme-color を `#1976d2` → `#4f46e5`（ブランドカラー統一）
- P2: `editItem()` 関数を実装（✏️ボタンが機能しないバグ修正）
- P2: ホーム空状態UX改善（テンプレート誘導CTAを追加）
- P2: 天気予報エリアを季節別準備ヒントに転換（常に有用なコンテンツ表示）
- P3: テンプレートカテゴリバッジを日本語化（travel→旅行 等）
- P3: フッター著作権年を 2024 → 2026 に修正
- P4: チェックリスト画面に印刷ボタンを追加

## ライセンス

MIT License
