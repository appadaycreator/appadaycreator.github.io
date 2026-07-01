# 細胞の冒険 - 技術仕様書

## 📝 更新履歴

### v2.5.0 (2026-07-01) - CV向上：モバイル最適化・視覚的UI改善・見出し具体化 [improve_auto #42 深層改善モード]
- **[V1:HIGH]** モバイルヒーロータイトルの切断対応
  - #hero h1 に `word-break: break-all` + `max-width: 100%` + `overflow: hidden` + `padding: 0 16px` を適用
  - モバイルで見出し「細胞の冒険｜生物・」が画面右で切断される問題を解決
- **[V2:HIGH]** モバイルファーストビュー CTA 表示最適化
  - #hero セクションの padding-bottom をモバイル時 20px に縮小
  - メインCTAボタン「いますぐゲーム開始」がファーストビュー内に収まるよう改善
  - Cookie同意バナー（z-index:40）の下に CTA が埋もれるレイアウトを改善
- **[V4:MED]** 学習コンテンツセクションの視認性向上
  - 4つの学習カード（細胞・進化論・生態系・ライフゲーム）の「今すぐ学ぶ →」「詳しく学ぶ →」ボタンを learn-card-btn クラスで視認性強化
  - 背景色：bg-blue-600 → background: #f59e0b（アンバー）に変更、color: #000 で高コントラスト化
  - ヒーロー下部・信頼バッジ直下に「📚 学習教材を見る（PR）」リンクを追加し、ファーストビュー内に収益化CTA引き上げ
- **[V5:MED]** 信頼バッジ（社会的証明）の視覚的強化
  - 信頼バッジの数字部分（15,000人・小3〜大人・完全無料）を badge-number クラスで強調
  - font-size: 2rem / font-weight: 900 / color: #ffffff に拡大して社会的証明の説得力向上
  - カード背景を `rgba(255,255,255,0.1)` → `rgba(0,200,100,0.2)` に変更して視覚的重み付け
  - モバイルで flex-wrap を有効化して 3 枚カードの画面外はみ出しを解決
- **[深層改善 E]** h2/h3見出しの具体化
  - About セクションの見出し「使い方」→「Conway's Game of Lifeの遊び方と基本ルール」に変更
  - サービス固有のキーワードを含める提案に応じ、検索流入（SEO）向上狙い

### v2.4.0 (2026-06-22) - UI/UX改善：CTA強化・サイドバー簡素化・Cookie最適化 [improve_auto #42]
- **[V1] CTAボタンの重要度強化（メインボタン > サブボタン）**
  - メインボタン：px を 8 → 10、py を 4 → 5、テキストサイズを lg → xl sm:text-2xl に拡大
  - テキスト：「いますぐプレイ」→「いますぐゲーム開始」に具体的表現に変更
  - ボタンサイズ視覚的ハイライト：`border-2 border-green-400`、シャドウ強化（shadow-green-600/80）
  - サブボタン（チュートリアル）：px 6 → 5、py 2 → 2、テキストカラーを text-gray-300 → text-gray-200、bg を gray-700 → gray-600 に調整してハイライト低減
  - 各ボタン間 gap を 4 → 4 で視覚的分離
- **[V4] デスクトップサイドバーメニューの簡素化（ユーザー意思決定の複雑化を解決）**
  - 「細胞タイプ」セクション（384-409行）完全削除：通常細胞・分裂細胞・防御細胞の表示は直感的でなく、ユーザーが最初に何をすべきか判然としない
  - セクション削除により、サイドバー表示は「ゲームモード」→「統計」→「グラフ」→「生存率」→「ミッション」の5セクション（元6セクション）に簡素化
  - 初見ユーザーが「ゲーム開始」ボタンで即座にゲーム開始可能なUIに改善
- **[V2] Cookie同意バナーの配置・視認性改善**
  - z-index を 500 → 40 に低下（バナーが主要コンテンツを覆い隠す問題を解決）
  - ゲーム開始ボタンへのアクセスがバナーで物理的に阻害されない配置へ改善
  - padding を 0.75rem 1rem → 1rem に増加（より広い内部余白でテキスト・ボタンの視認性向上）
  - background を solid → `rgba(..., 0.95)` 半透明に変更（背景コンテンツの視認性を確保）
  - ボタン min-height を 40px → 44px に拡大（タップターゲットサイズ WCAG 2.1 AAレベル準拠）
  - プライバシーリンク色を #34d399 → #4ade80 に変更（より明るく、チュートリアル CTA ボタン青との区別を強化）
- **[V5] 信頼性指標の数値精度向上と説得力強化**
  - プレイヤー数表記：「15,000+」→「15,000人」に変更（「+」記号の曖昧さを排除）
  - ラベル：「プレイヤー」→「アクティブプレイヤー」に具体化
  - 各セクションに左ボーダー（border-l-4）追加：視覚的に独立した情報グループとして強調
  - 対応学年ラベル：「対応学年」→「推奨年齢層」に変更（より直感的）
  - 無料ラベル：「無料・広告最小」→「完全無料」「会員登録不要」に分割（より説得力向上）
- **[改善5択 B] CTA文言強化（行動動詞・矢印・時間効率性の追加）**
  - Learning CTA セクション：「🔬 今すぐ無料で請求する」→「🔬 今すぐ無料請求 → 」に簡潔化・矢印付加
  - サブテキスト：「登録不要・完全無料」→「登録不要・30秒で完了」に時間効率性を追加
  - Z会 CTA：「🎓 資料を今すぐ取り寄せる」→「🎓 無料資料を取得 → 」に簡潔化・矢印付加
  - Z会信頼性：「Z会 - 全国の受験生が選択」→「Z会・約15万人が選択」に数値ベースの根拠追加

### v2.3.0 (2026-06-10) - M2 UX改善: 入力フォームプレースホルダー日本語化 [improve_auto #42]
- **M2**: 隠し入力フォーム（car_n, car_v）のプレースホルダー日本語化
  - `car_n` input: "name" → "プレイヤー名（1-50文字）"に変更
  - `car_v` input: プレースホルダーを新規追加 "0-9999の数値を入力"
  - 両要素にaria-label日本語属性を追加し、アクセシビリティを向上
  - M2施策: コア機能のUX改善（入力UI・バリデーション）を実装

### v2.2.0 (2026-06-09) - P0収益化・P1SEO・P2継続率向上 [improve_auto]
- **P0**: 学習教材 CTA セクション追加
  - Share セクション直後に「🎓 もっと深く学びたい方へ」CTA バナー追加
  - px.a8.net アフィリエイトリンク（理科・生物通信講座 + Z会）を目立つ位置に配置
  - 申込クリック率向上を目指す
- **P0**: 関連サービスリンク充実
  - 「関連サービス」セクションを4個 → 6個に拡張
  - サイドバー関連リンク：ナンプレクエスト、ケミカルクエスト、CrosPuzz、ゴルフアイアン、パッキングチェックリスト、英語学習ナビゲーター
  - グリッドレイアウトを auto-fit で両デバイス対応
- **P1**: FAQ 拡張（7問 → 10問）
  - FAQPageスキーマに3問追加：「ゲーム内で何を学べますか？」「PC・スマートフォンのどちらで遊べば楽しいですか？」「このゲームは子ども向けですか？」
  - HTML側の `<dl>` にも同期（Google Rich Results で10問全て表示）
- **P2**: シェア「コピー」機能の充実
  - `copyLink()` 関数を改善、スコア情報（世代・個体数・最大個体数）を含むテキストコピー実装
  - clipboard APIでスコア付きコピー実現（フォールバック付き）
  - showToast で「📋 スコア付きコピーしました！」通知表示

### v2.1.0 (2026-06-08) - SEO & ユーザー導線改善 [improve_auto]
- **P1**: meta descriptionの修正
  - 従来: "Conway登録不要・完全無料でご利用いただけます。スマホ・PC対応。's Game of Life..."（文言が断裂）
  - 改善: "Conway's Game of Lifeベースの教育ゲーム。生物学の基礎を楽しく学べるシミュレーション...」（155文字、正確・簡潔）
- **P1**: FAQPageスキーマの内容修正
  - 従来: 実際のFAQセクション（7問）とスキーマのQ&A内容が異なり、Google検索結果での表示が不正確
  - 改善: 以下の7問に統一し、Google Rich Results Testで正確に表示
    1. 細胞の冒険は無料ですか？
    2. スマートフォンでも使えますか？
    3. 入力データはサーバーに送信されますか？
    4. ライフゲームとは何ですか？
    5. ゲームの進行状況は保存されますか？
    6. オフラインで遊べますか？
    7. キーボードショートカットはありますか？
- **P1**: Twitter Card meta descriptionの修正
  - 従来: "...Conway" （末尾が破損）
  - 改善: "Conway's Game of Lifeベースの教育ゲーム。..."（OGP/Twitter共有で正確に表示）
- **P2**: 学習セクション説明文の拡張
  - 4つの学習カード（細胞・進化論・生態系・ライフゲーム）の説明文を 60字 → 120-150字 に拡張
  - ゲーム体験との関連性を明示し、教育的価値を強調
  - 「ライフゲーム」説明に歴史背景（1970年コンウェイ考案、50年以上愛用）を追加
- **P1**: dateModified を 2026-05-30 → 2026-06-08 に更新（SEOシグナル強化）

### v2.0.0 (2026-06-07) - アクセシビリティ & キーボード操作強化
- **P1**: playPauseBtn のアクセシビリティ改善
  - aria-pressed 属性で再生・一時停止状態を正確に管理
  - innerHTML ではなく textContent で更新（スクリーンリーダー対応）
  - HTML に aria-pressed="false" を初期状態として追加
- **P1**: パターンボタンのキーボードショートカット機能実装
  - G=グライダー、O=振動子、S=静物、U=ガン（Gun）
  - P=パルサー、B=ブロック、E=R五面体、D=ダイハード
  - キーボード入力時のボタンハイライト機能（0.3秒）
  - パターンボタンに data-tooltip でキーボードショートカット情報を追加
  - パターン選択セクションのヘッダーにキーボード操作ガイドを表示
- **既実装P1**: ミッション達成システム（v1.3以降で実装済み）
- **既実装P2**: トースト通知システム（showToast関数で実装済み）
- **既実装P2**: showLearnModal()関数（学習モーダル機能）
- **既実装P2**: シェア機能（Twitter/Facebook/LINE）

### v1.9.0 (2026-06-06) - モバイル最適化・グリッド表示改善
- **P1**: パターンボタンのレイアウト最適化
  - PC: `grid-cols-4` (4列)、モバイル: `grid-cols-2` (2列)
  - gap: `2` → `md:gap-3` で、モバイルはタッチ距離が拡大
  - 文字サイズ: `text-sm` → `text-xs sm:text-sm` でモバイル可読性向上
  - padding: `p-2` → `md:p-3` でボタン高さ拡大
- **P1**: グリッドサイズセレクト・速度スライダーのモバイル最適化
  - speedSlider: 高さ `h-11` 、幅 `w-32 md:w-40` 追加
  - gridSize select: 最小高さ `min-h-11`、パディング `py-2` 設定
  - 両要素のタッチターゲット最小サイズ: 44px 確保
- **P1**: グリッド背景色・枠線のコントラスト改善
  - background: `#374151` → `#0f1419` （より暗い背景で見やすく）
  - border: `#4b5563` → `#7ef1e2` （シアン色で明確に枠線表示）
  - WCAG AAレベルのコントラスト比向上
- **P1**: グリッド横スクロール自動スケーリング機能
  - スクロールコンテナに `scroll-behavior: smooth` 追加
  - 大規模グリッド（セルサイズ≤6px且つ幅超過時）に `transform: scale()` を自動適用
  - モバイルで最小75%スケールでグリッド全体が表示可能に
  - calcCellSize() の最小値: `8px` → `4px` に縮小（スケーリング対象の判定精度向上）

### v1.8.0 (2026-06-06) - UI/UX改善・ダークテーマ統一
- ✅ 学習セクションの「詳しく学ぶ」ボタンをテキストリンク → 実ボタンに統一
  - スタイル: `bg-blue-600 hover:bg-blue-700` + ホバースケール効果 (`hover:scale-105`)
  - 4つすべての学習カード（細胞・進化論・生態系・ライフゲーム）に適用
  - ユーザビリティ向上：ボタンの可視性と操作感が向上
- ✅ ダークテーマの一貫性を改善
  - 「他のゲームも試してみよう」セクション: `#f0f9ff`（白） → `#1f2937`（ダークグレー）
  - 「関連サービス」セクション: `#fff`（白） → `bg-gray-800`（ダークグレー）
  - 全ページの背景が統一されたダークテーマに
- ✅ アフィリエイトセクションのグラデーション色をサイトテーマに統一
  - 従来: `from-blue-900 to-purple-900`（紫系）
  - 改善: `from-green-900 to-emerald-900`（グリーン系、サイトアクセント色に統一）
- ✅ パターンボタンのホバーフィードバック強化
  - 8つすべてのパターンボタン（グライダー・振動子・静物・ガン・パルサー・ブロック・R五面体・ダイハード）に `hover:scale-105` 効果を追加
  - ホバー時に拡大アニメーション表示、ユーザー操作感が向上

### v1.7.0 (2026-06-04) - PWA テーマ色統一
- ✅ PWA manifest `theme_color` をデフォルト値 `#111827`（ダークグレー）に統一
  - 従来: `#059669`（エメラルド、ダーク向けのみ）→ 新規: `#111827`（背景色と統一）
  - 理由: PWAマニフェストは media クエリ非対応のため、fixed value のみ可能。ライトモード用デバイスでもダークテーマに統一したスプラッシュスクリーン・ステータスバーを表示
  - HTMLメタタグは light/dark media 対応のままで、ブラウザで正しく切り替わる

### v1.6.0 (2026-06-03) - Phase 2 改善
- ✅ PWA theme-color の light/dark モード対応
  - Light mode: #10b981 (green-500)
  - Dark mode: #059669 (emerald-600)
- ✅ 学習セクションの 4 つの「詳しく学ぶ」ボタンに aria-label を追加
  - 細胞について
  - 進化論
  - 生態系
  - ライフゲーム
  - WCAG 2.1 AA 準拠のアクセシビリティ改善

## 📋 プロジェクト概要

### 基本情報
- **プロジェクト名**: 細胞の冒険 - Cellular Adventure RPG
- **バージョン**: 2.1.0
- **開発言語**: HTML5, CSS3, JavaScript (ES6+)
- **フレームワーク**: バニラJS（フレームワーク不使用）
- **デザインシステム**: Tailwind CSS
- **PWA対応**: 完全対応

### 開発目標
1. **教育的価値**: 生物学の基礎概念を視覚的に学習
2. **技術的優秀性**: 最新のWeb技術を活用
3. **ユーザビリティ**: 直感的で使いやすいインターフェース
4. **パフォーマンス**: 高速でスムーズな動作
5. **アクセシビリティ**: 誰でも利用可能な設計

## 🏗️ アーキテクチャ

### 技術スタック詳細

#### フロントエンド
```javascript
// 主要技術
- HTML5: セマンティックマークアップ
- CSS3: Tailwind CSS + カスタムスタイル
- JavaScript: ES6+ (モジュールパターン)
- PWA: Service Worker + Web App Manifest
```

#### ライブラリ・フレームワーク
```json
{
  "tailwindcss": "^2.2.19",
  "fontawesome": "^6.4.0",
  "google-fonts": "Noto Sans JP, Orbitron"
}
```

#### 開発ツール
```bash
# 推奨開発環境
- Node.js: v14以上
- ブラウザ: Chrome DevTools
- エディタ: VS Code
- バージョン管理: Git
```

## 🎮 機能仕様

### コア機能

#### 1. ライフゲームシミュレーション
```javascript
// Conway's Game of Life ルール
const rules = {
  survival: [2, 3],    // 生存条件: 2-3個の隣接細胞
  birth: [3],          // 誕生条件: ちょうど3個の隣接細胞
  death: [0, 1, 4, 5, 6, 7, 8] // 死亡条件: その他
};
```

#### 2. グリッドシステム
```javascript
// グリッド設定
const gridConfig = {
  defaultSize: { width: 30, height: 20 },
  cellSize: 12, // px
  maxSize: { width: 50, height: 40 },
  minSize: { width: 20, height: 15 }
};
```

#### 3. パターンシステム
```javascript
// プリセットパターン
const patterns = {
  glider: [[0,1,0], [0,0,1], [1,1,1]],
  oscillator: [[0,1,0], [0,1,0], [0,1,0]],
  still: [[0,1,1,0], [1,0,0,1], [0,1,1,0]],
  gun: [/* Gosper Glider Gun */]
};
```

### UI/UX機能

#### 1. レスポンシブデザイン
```css
/* ブレークポイント */
@media (max-width: 768px) { /* モバイル */ }
@media (min-width: 769px) and (max-width: 1024px) { /* タブレット */ }
@media (min-width: 1025px) { /* デスクトップ */ }
```

#### 2. ダークテーマ
```css
/* カラーパレット */
:root {
  --bg-primary: #111827;    /* 背景色 */
  --bg-secondary: #1f2937;  /* セカンダリ背景 */
  --text-primary: #ffffff;   /* テキスト色 */
  --accent-green: #10b981;  /* アクセント色 */
}
```

#### 3. アニメーション
```css
/* 細胞アニメーション */
.cell.alive {
  background: linear-gradient(45deg, #10b981, #34d399);
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
  transition: all 0.2s ease;
}
```

### データ管理

#### 1. ローカルストレージ
```javascript
// データ構造
const gameData = {
  grid: Array[height][width],    // グリッド状態
  generation: Number,            // 世代数
  settings: {                    // 設定
    speed: Number,
    gridSize: String,
    language: String
  },
  history: Array[50],           // 履歴（最大50件）
  timestamp: Date
};
```

#### 2. 統計計算
```javascript
// 統計計算ロジック
const calculateStats = (grid) => {
  const population = grid.flat().filter(cell => cell).length;
  const totalCells = grid.length * grid[0].length;
  const survivalRate = (population / totalCells) * 100;
  
  return { population, survivalRate };
};
```

## 🔧 技術実装詳細

### パフォーマンス最適化

#### 1. レンダリング最適化
```javascript
// 変更された細胞のみ更新
function updateChangedCells(changedCells) {
  changedCells.forEach(({ x, y, born }) => {
    const cell = document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
    if (cell) {
      cell.className = `cell ${born ? 'born' : 'dying'}`;
      setTimeout(() => {
        cell.className = gameState.grid[y][x] ? 'cell alive' : 'cell';
      }, 500);
    }
  });
}
```

#### 2. メモリ管理
```javascript
// 効率的なグリッド操作
function createGrid(width, height) {
  return Array(height).fill().map(() => Array(width).fill(false));
}

// 履歴の制限
function addToHistory(state) {
  history.push(state);
  if (history.length > 50) {
    history = history.slice(-50);
  }
}
```

#### 3. キャッシュ戦略
```javascript
// Service Worker キャッシュ
const CACHE_NAME = 'cellular-adventure-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/css/style.css',
  '/assets/js/game.js'
];
```

### セキュリティ

#### 1. XSS対策
```javascript
// 入力値のサニタイゼーション
function sanitizeInput(input) {
  return input.replace(/[<>]/g, '');
}
```

#### 2. CSP設定
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
               style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com;
               font-src 'self' https://fonts.gstatic.com;
               img-src 'self' data: https:;">
```

## 📱 PWA仕様

### Web App Manifest
```json
{
  "name": "細胞の冒険",
  "short_name": "CellularRPG",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1f2937",
  "theme_color": "#1f2937",
  "icons": [
    {
      "src": "icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Service Worker
```javascript
// オフライン対応
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
```

## 🌐 多言語対応

### 翻訳システム
```javascript
const translations = {
  ja: {
    'nav.game': 'ゲーム',
    'nav.learn': '学習',
    'game.play': '再生',
    'game.pause': '一時停止'
  },
  en: {
    'nav.game': 'Game',
    'nav.learn': 'Learn',
    'game.play': 'Play',
    'game.pause': 'Pause'
  }
};
```

### 言語切り替え
```javascript
function updateLanguage(lang) {
  document.documentElement.lang = lang;
  const elements = document.querySelectorAll('[data-translate]');
  elements.forEach(element => {
    const key = element.getAttribute('data-translate');
    const translation = translations[lang][key];
    if (translation) {
      element.textContent = translation;
    }
  });
}
```

## 🧪 テスト仕様

### 単体テスト
```javascript
// テストケース例
describe('Game of Life Rules', () => {
  test('細胞の誕生', () => {
    const grid = createEmptyGrid(3, 3);
    grid[1][1] = true; // 中央に細胞を配置
    const nextGen = nextGeneration(grid);
    expect(nextGen[1][1]).toBe(false); // 単独細胞は死亡
  });
});
```

### 統合テスト
```javascript
// UI統合テスト
describe('Game Controls', () => {
  test('再生ボタンの動作', () => {
    const playButton = document.getElementById('playPauseBtn');
    playButton.click();
    expect(gameState.isRunning).toBe(true);
  });
});
```

### パフォーマンステスト
```javascript
// パフォーマンス測定
function measurePerformance() {
  const start = performance.now();
  nextGeneration();
  const end = performance.now();
  console.log(`世代更新時間: ${end - start}ms`);
}
```

## 📊 監視・分析

### エラー監視
```javascript
// エラーハンドリング
window.addEventListener('error', (event) => {
  console.error('アプリケーションエラー:', event.error);
  // エラー報告システムに送信
});
```

### パフォーマンス監視
```javascript
// パフォーマンス指標
window.addEventListener('load', () => {
  const loadTime = performance.now();
  console.log(`ページ読み込み時間: ${loadTime}ms`);
});
```

### ユーザー行動分析
```javascript
// イベント追跡
function trackEvent(eventName, data) {
  console.log(`イベント: ${eventName}`, data);
  // 分析システムに送信
}
```

## 🔄 デプロイメント

### ビルドプロセス
```bash
# 開発環境
npm run dev

# 本番ビルド
npm run build

# テスト実行
npm test
```

### デプロイ環境
```yaml
# GitHub Pages設定
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
```

## 📈 スケーラビリティ

### 将来の拡張性
1. **3D表示**: WebGLを使用した3D細胞表示
2. **マルチプレイヤー**: WebRTCを使用したリアルタイム対戦
3. **AI機能**: TensorFlow.jsを使用したAI対戦
4. **モバイルアプリ**: React Native版の開発

### 技術的負債
- [ ] テストカバレッジの向上
- [ ] TypeScriptへの移行
- [ ] 状態管理ライブラリの導入
- [ ] ビルドツールの導入

## 📋 品質保証

### コード品質
- **ESLint**: JavaScriptの品質管理
- **Prettier**: コードフォーマット統一
- **Husky**: Git hooksによる品質チェック

### ブラウザ対応
- **Chrome**: 最新版
- **Firefox**: 最新版
- **Safari**: 最新版
- **Edge**: 最新版

### アクセシビリティ
- **WCAG 2.1**: AAレベル準拠
- **キーボード操作**: 完全対応
- **スクリーンリーダー**: 対応済み

---

## 変更履歴

### v1.4.0 (2026-05-30) [improve_auto]
- **P1**: PWA manifest `background_color`/`theme_color` を `#10b981`(緑) → `#111827`/`#1f2937`(ダーク) に変更（スプラッシュ画面のダークテーマ統一）
- **P1**: `index.html` の `<meta name="theme-color">` も同様に `#1f2937` に変更
- **P1**: `ux-behavior` スクリプトのセレクターを `button:not([type=reset]):not([data-ux])` → `button[type=submit],input[type=submit]` に修正（全ゲームボタンが disabled + テキスト上書きされる致命的バグ解消）
- **P1**: フッターの法的情報リンクを `#privacy`/`#terms`/`#disclaimer`（存在しないアンカー）→ `privacy-policy.html`/`terms.html`/`privacy.html` に修正
- **P1**: 白・ライトカラー背景の6セクション（他のゲームも・お問い合わせ・計算の仕組み・理科講座・学習サービス・related-link）をダークテーマ統一
- **P2**: よくある質問を3問 → 7問に拡充（ライフゲームとは・データ保存・オフライン・キーボードショートカット追加）
- **P2**: HowTo schema ステップを汎用テキスト → 実際のライフゲーム操作手順（配置→再生→速度調整→パターン→ミッション）に書き換え
- **P2**: Service Worker の二重登録（インラインBlob SW + 外部service-worker.js）を解消。外部SWのみに統一
- **P3**: `@media (prefers-reduced-motion: reduce)` 追加（animate-float・cell.born/.dying・sidebar-transition をオフ、WCAG 2.1 AA 対応強化）
- **P4**: Schema.org `dateModified` を `2026-05-23` → `2026-05-30` に更新

### v1.3.0 (2026-05-29) [improve_auto]
- **P1**: モバイルヒーローボタンを `flex-col sm:flex-row` + `w-full` で縦並びレイアウトに修正（390px幅でボタン切れ解消）
- **P1**: ヒーロー説明文に `<br class="sm:hidden">` 追加 + `text-base sm:text-xl` でモバイル折り返し対応
- **P1**: ゲームボタン px をモバイルで `px-3 sm:px-4` に削減（ランダムボタンの表示切れ解消）
- **P1**: グリッドサイズ変更時に実行中のシミュレーションを自動停止（状態不整合バグ修正）
- **P1**: ナビ「お問い合わせ」リンク3箇所を `#contact` → `contact.html` に修正（存在しないアンカーバグ）
- **P1**: `html, body { overflow-x: hidden }` 追加でモバイル横スクロール防止
- **P2**: 「⏭ 1ステップ」ボタン追加（一時停止中に1世代だけ進める教育機能）
- **P2**: PCマウスドラッグ描画対応（mousedown/mousemove でセルを連続描画、最初のセル状態でon/offモード決定）
- **P2**: Space=再生/停止、→=1ステップ(停止中)、R=リセット のキーボードショートカット追加
- **P2**: ガンパターン選択時に40x30グリッドへ自動拡張（幅36のパターンがデフォルト30幅でクリップされる問題修正）
- **P2**: モバイル向け統計パネル（世代/個体数/最大/達成）をゲームグリッド下に追加
- **P3**: 全滅時（population=0かつ実行中）に自動停止 + 「💀 全滅！X世代で絶滅」エラートースト表示
- **P3**: セルDOM参照を `cellElements[y][x]` 2D配列にキャッシュ化（`querySelector` を排除、大グリッドで高速化）
- **P3**: タッチドラッグハンドラーを `createGrid()` → `setupEventListeners()` に移動（グリッドサイズ変更時の重複リスナー登録バグ修正）

### v1.2.0 (2026-05-29) [improve_auto]
- **P1**: ミッションUI更新漏れを修正（`updateMissionUI()` を `initGame()` と `showMissionClear()` で呼び出し）
- **P1**: ストーリー・チャレンジモードボタンに「近日公開予定」トーストを追加（無反応から有フィードバックへ）
- **P1**: `.card` クラス背景色を `#fff`→`#1f2937` に変更（ダークテーマ統一）
- **P2**: 「詳しく学ぶ」ボタン4つに `showLearnModal()` を実装（細胞・進化論・生態系・ライフゲームの解説モーダル）
- **P2**: `calcCellSize()` 追加でグリッドセルを画面幅に応じて自動調整（8〜16px、リサイズ対応）
- **P2**: `gameState.maxPopulation` 追加・サイドバーに最大個体数表示（黄色テキスト）
- **P3**: フッターコピーライト `© 2024` → `© 2026` 更新

### v1.1.0 (2026-05-29) [improve_auto]
- **P1**: OGP/Twitter画像URLのスラッシュ欠落バグを修正（`cellular-adventure-rpgogp.png` → `cellular-adventure-rpg/ogp.png`）
- **P1**: FAQ `dd` テキスト色を`#374151`→`#d1d5db`に修正（ダーク背景での可読性向上）
- **P1**: `<main>`に`id="main"`追加（スキップリンクの機能修正）
- **P2**: HowTo schemaをゲームの実際の操作手順に合わせて書き換え
- **P2**: ゲームグリッドコンテナに`overflow-x:auto`追加（モバイルはみ出し対策）
- **P3**: タッチドラッグでの複数セル一括描画に対応（モバイルUX改善）
- **P3**: localStorage history書き込みを停止時・リセット時のみに最適化（パフォーマンス改善）
- **P4**: usage.htmlをダークテーマ（`bg-gray-900`系）に統一

**最終更新**: 2026年6月8日  
**バージョン**: 2.1.0  
**作成者**: AppADayCreator 