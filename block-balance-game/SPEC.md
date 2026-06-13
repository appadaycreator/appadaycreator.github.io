# ブロックバランス - 仕様書

## バージョン情報

### v1.19（2026-06-13）- /improve_phase2_only フェーズ2（M4 グラフ・スコア・ゲージ可視化）
**改善内容**:
- **M4**: Chart.js を使用したゲーム履歴グラフの可視化
  - **Chart.js CDN 追加**: `https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js`
    - 外部 API なし、ブラウザ内完全処理
  - **スコア推移グラフ**: 折れ線グラフで複数ゲームのスコア推移を可視化
    - 青線：スコア（左Y軸）
    - 緑線：高さ（右Y軸）
    - 直近 20 ゲームのデータを表示（表示性能最適化）
  - **統計情報パネル**: グラフ下部に3つの指標を表示
    - 「最高スコア」（最大値）
    - 「平均スコア」（算術平均）
    - 「総プレイ数」（ゲーム履歴件数）
  - **グラフコンテナ**: historyModal 内に `chartContainer` div を追加
    - 履歴がある場合のみ表示（`display: none` → `display: block`）
    - 動的にグラフ描画・更新（renderScoreChart() 関数）
  - **インタラクション**: スクロール・レスポンシブ対応、マウスホバーで詳細値表示
  - **メモリ管理**: scoreChartInstance で既存グラフを破棄後、新規作成（メモリリーク防止）

### v1.18（2026-06-10）- /improve_auto フェーズ2（M2 入力UX改善）
**改善内容**:
- **P1**: 入力フォーム要素へのPlaceholder属性追加
  - **contactName input**: `placeholder="例）田中太郎"`
    - ユーザーに入力例を提示
    - フォーム入力時の迷い軽減
  - **contactEmail input**: `placeholder="例）user@example.com"`
    - メールアドレス形式の入力例を提示
  - **contactMessage textarea**: `placeholder="ご質問・ご意見をお聞かせください"`
    - テキストエリアの入力例を明示
  - **bb_val number input**: `placeholder="0"`
    - 数値入力の初期値例を表示

### v1.17（2026-06-10）- /improve_auto フェーズ2（M4 ビジュアライゼーション・UX強化）
**改善内容**:
- **P1**: バランスメーター詳細情報の可視化
  - **バランスメーター拡張**: 数値表示に加えて「傾き度」を追加
    - 重心計算から左右傾き度（左●%／右●%／中央）を数値化
    - `balanceDetail` 要素で「傾き：中央0% | 安定度：95%」と表示
    - ゲーム中リアルタイム更新で安定状態を直感的に把握

- **P2**: ゲーム終了後のスコア達成度メーター
  - **achievementMeter 追加**: ゲームオーバーモーダルにスコア達成度を表示
    - 現スコア/ベストスコア×100%で達成度計算
    - プログレスバーで視覚的に表示
  - **達成度テキスト**: 
    - ベストスコア以上：「🎉 ベストスコア達成！」
    - ベストスコア未満：「あと ▲ 点でベスト更新！」で目標を明示
  - **表示条件**: finalBest > 0 かつ currentScore > 0 の場合のみ表示

### v1.16（2026-06-07）- /improve_auto フェーズ2（PWA theme-color デフォルト色最適化）
**改善内容**:
- **P1**: PWA theme-color デフォルト値を中立色に統一
  - **index.html meta タグ**: `<meta name="theme-color" content="#2563EB">` → `<meta name="theme-color" content="#6b7280">`
    - JS 実行前のデフォルト値を中立色に設定
    - ダークモード環境での早期表示時にもステータスバー色が背景色と調和
  - **manifest.json theme_color**: `"#2563EB"` → `"#6b7280"`
    - PWA インストール時のスプラッシュスクリーン背景色と統一
    - background-color (`#6b7280`) と一貫性を確保

- **P2**: Service Worker キャッシュバージョン更新
  - `block-balance-v1.14` → `block-balance-v1.15` にアップグレード
  - theme-color 変更時の古いキャッシュを自動削除
  - デプロイ時にブラウザキャッシュが自動更新

### v1.15（2026-06-06）- /improve_auto フェーズ2（UX・PWA 最適化）
**改善内容**:
- **P1-1**: manifest.json background-color ダークモード対応
  - 静的色 `#f3f4f6` → 中立色 `#6b7280` に変更
  - ライト・ダークモード両対応のスプラッシュスクリーン背景色を実現

- **P1-2**: viewport meta タグの user-scalable 明確化
  - `user-scalable=no` 追加でゲームドラッグ操作の誤ズーム防止
  - `viewport-fit=cover` 追加で iOS ノッチ対応

- **P2-1**: ゲームキャンバス背景色のダークモード対応
  - ライト：`linear-gradient(180deg, #eff6ff 0%, #dbeafe 60%, #bfdbfe 100%)`
  - ダーク：`linear-gradient(180deg, #1f2937 0%, #111827 100%)`
  - `@media (prefers-color-scheme: dark)` で CSS 側で完全対応

- **P2-2**: Service Worker キャッシュバージョン更新
  - `block-balance-v1.9` → `block-balance-v1.14` にアップグレード
  - デプロイ時の古いキャッシュ自動削除

### v1.14（2026-06-05）- /improve_auto フェーズ2（PWA ダークモード完全対応）
**改善内容**:
- **P1**: PWA theme-color・background-color 完全ダークモード対応
  - **color-scheme メタタグ追加**: `<meta name="color-scheme" content="light dark">`
    - ブラウザに対してライト/ダークモード両対応を明示
    - フォーム要素の自動スタイル統一
  - **theme-color ダークモード対応**: JavaScript で動的更新
    - ライトモード時：`#2563EB`（青）
    - ダークモード時：`#1f2937`（濃いグレー）
  - **background-color メタタグ動的作成・更新**: JavaScript で metaタグ自動生成
    - ライトモード時：`#f3f4f6`（薄いグレー）
    - ダークモード時：`#111827`（濃い灰色）
  - `window.matchMedia('(prefers-color-scheme: dark)')` で OS テーマ設定をリアルタイム検知
  - ユーザーが OS 設定を変更すると自動でテーマカラーが更新される
  - Android ステータスバー、iOS セーフエリア色が OS テーマと調和
  - PWA インストール時、splash screen と システムアイコン色が最適化される

### v1.13（2026-06-04）- PWA theme-color ダークモード対応初版
**改善内容**:
- 基本的な theme-color ダークモード対応実装

### v1.12（2026-06-04）- /improve_auto フェーズ2（残りP1実装）
**改善内容**:
- **P1-1**: 追加ボタン aria-label 実装（2件）
  - モバイル選択ブロック解除ボタン: "ブロック選択を解除"
  - シェアモーダルボタン（2件）: "シェアモーダルを閉じる", "Twitterでシェア"
  - スクリーンリーダー対応度さらに向上
  - 合計 12件の aria-label 設定完了

- **P1-2**: PWA theme-color 確認・維持
  - index.html: `#2563EB` ✓
  - manifest.json: `#2563EB` ✓
  - 一貫性維持

### v1.11（2026-06-04）- /improve_auto フェーズ2（P1・P2実装）
**改善内容**:
- **P1-1**: ボタン aria-label 追加（ゲームオーバーモーダル 3件）
  - 「もう一度」: "ゲームをもう一度プレイ"
  - 「📸」: "スコアカードを画像として保存"
  - 「シェア」: "ゲーム結果をシェア"
  - スクリーンリーダー対応度向上
  - 合計 10件の aria-label 設定完了

- **P1-2**: PWA theme-color 統一確認
  - index.html: `#2563EB` ✓
  - manifest.json: `#2563EB` ✓
  - 一貫性確認・維持

### v1.10（2026-06-04）- /improve_auto アクセシビリティ強化
**改善内容**:
- **P1-1**: ボタン aria-label 追加（7件）
  - `mobileShareResult`: "ゲーム結果をシェア"
  - モバイル `downloadCard`: "スコアカードを画像として保存"
  - `contactForm` submit: "お問い合わせ内容を送信"
  - `closeHistory`: "ゲーム履歴モーダルを閉じる"
  - `sortByDate`: "日時順で履歴を並べ替え"
  - `sortByScore`: "スコア順で履歴を並べ替え"
  - `clearHistory`: "すべてのゲーム履歴を削除"
  - スクリーンリーダー対応度向上

- **P1-2**: PWA theme-color 統一確認
  - index.html: `#2563EB` ✓
  - manifest.json: `#2563EB` ✓
  - 一貫性確認・維持

### v1.9（2026-06-02）- /improve_auto P1・P2実装
**改善内容**:
- **P1-1**: PWA theme-color設定修正
  - 非標準の `media` 属性を削除
  - `<meta name="theme-color" content="#2563EB">` に統一
  - ブラウザアドレスバー色の安定化

- **P1-2**: manifest.json icon サイズ修正
  - 実装されていない 512x512 アイコンを削除
  - 192x192 アイコンに統一
  - `purpose` を "any maskable" に統一

- **P2-1**: Service Worker キャッシュバージョン更新
  - CACHE_NAME: v1.8 → v1.9
  - デプロイ時のキャッシュ自動更新を実現

- **P2-2**: Tailwind CSS 遅延読み込み実装
  - `media="print" onload="this.media='all'"` パターンで非ブロッキング読み込み
  - LCP（Largest Contentful Paint）改善
  - フォールバック用 `<noscript>` タグ追加

### v1.8以前
- ゲーム基本機能実装
- Schema.org マークアップ実装
- 多言語対応（日本語・英語）

## 次の改善候補（P3・P4）

### P3: Accessibility 改善
- テキストコントラスト比向上
- キーボードフォーカスインジケーター追加
- ARIA ラベル不足分追加

### P3: manifest.json scope 修正
- 相対パスに統一、環境依存性排除

### P4: Core Web Vitals 最適化
- PageSpeed Insights 90+ 目標
- CSS インライン化検討
- JavaScript 分割・遅延読み込み

### P4: サイトマップ作成
- `sitemap.xml` 実装
- SEO強化

## ゲーム仕様

### 機能
- ブロックドラッグ＆ドロップ配置
- リアルタイム物理演算
- スコアシステム
- ゲーム履歴保存
- 難易度選択（かんたん/ふつう/むずかしい）
- ゲームモード（通常/タイムアタック）
- キーボードショートカット対応
- コンボシステム
- 効果音トグル
- PWA対応（オフラインプレイ可能）

### ブロック種類（6種類）
1. 正方形 (48×48px, 赤)
2. 横長 (64×32px, 青)
3. 縦長 (32×64px, 緑)
4. 平べったい (48×24px, 黄色)
5. 小 (40×40px, 紫)
6. 大 (56×56px, ピンク)

### スコア計算
```
スコア = (高さ × 10 × 難易度倍率) + バランスボーナス + コンボボーナス
難易度倍率: かんたん=1.0, ふつう=1.5, むずかしい=2.0
```

## ページ構成
- ゲーム画面
- 使い方
- 利用規約
- プライバシーポリシー
- お問い合わせ

## 技術スタック
- HTML5 + CSS（Tailwind）
- Vanilla JavaScript（フレームワーク不使用）
- Service Worker（PWA対応）
- Web Audio API（効果音）
- LocalStorage（スコア保存）
