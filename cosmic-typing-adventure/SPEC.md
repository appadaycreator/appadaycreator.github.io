# タイピング練習【無料】宇宙テーマで楽しく速度アップ！ - 技術仕様書

## 概要

**サービス名**: Cosmic Typing Adventure
**バージョン**: 1.6.5
**更新日**: 2026-06-11
**URL**: https://appadaycreator.com/cosmic-typing-adventure/

タイピング速度（WPM）を測定しながら宇宙探索ゲームで楽しく練習。プログラミング学習・在宅ワーク・事務職に必須のタイピング力を無料でスキルアップ。苦手キー克服機能付き。

## データ管理

- **ストレージ**: ブラウザ localStorage（外部API通信なし）
- **永続化**: ページ読み込み時に自動復元
- **クリア**: ブラウザのサイトデータ削除で初期化

## 技術スタック

- HTML5 / CSS3 / Vanilla JavaScript
- PWA対応（manifest.json / Service Worker）
- レスポンシブデザイン（モバイルファースト）

## 使い方

1. 時間をプリセットまたは手入力で設定する
2. 必要に応じてオプション設定を行う
3. スタートボタンをクリックして開始する
4. 残り時間を確認しながら作業・発表を進める
5. 一時停止・リセットボタンで時間を管理する

## 変更履歴

### v1.6.5 (2026-06-11) - PWA統合・グラフ表示完全化

#### P1: グラフ・ゲージで結果を完全可視化（M4実装完全化）
- **WPMスコアバーの実装**: 結果パネルにWPMの達成度を可視化（横棒グラフ）
  - 目標値（100 WPM）に対する達成率を色分け表示
  - グリーン（80%以上） / オレンジ（50-80%） / グレー（50%未満）
- **正確率ゲージの実装**: ドーナツチャートで正確率を視覚化
  - シアン（95%以上） / グリーン（90-95%） / オレンジ（80-90%） / レッド（80%未満）
- **自己ベスト更新バッジ**: 🏆マークと「自己ベスト更新！」表示
- **タイムアタック用グラフ**: 同様にスコアバーと正確率ゲージを実装

#### P2: PWA インストール促進機能の統合（M16完全化）
- **pwa-installer.js の app.html 統合**
  - `<script src="js/pwa-installer.js"></script>` をheadに追加
- **自動インストール促進ボタン**
  - PWAInstaller クラスが beforeinstallprompt イベントを検出
  - 画面右下に fixed ボタン（⬇ アプリをインストール）を自動表示
  - 10秒後に自動非表示、ユーザーが いつでも手動で表示可能
- **インストール状態の管理**
  - インストール後は localStorage フラグで記録
  - デスクトップ環境では非表示、モバイルのみ表示
  - standalone モード検出に対応
- **多言語対応**: 日本語・English のテキスト自動切替

### v1.6.3 (2026-06-05) - アクセシビリティ・スキーマ・SNS共有機能追加

#### P1: アクセシビリティ & スキーマ改善
- **フォントサイズボタンの aria-label 追加**
  - A-（小）：「文字サイズを小さくする」
  - A（中）：「文字サイズを標準にする」  
  - A+（大）：「文字サイズを大きくする」
  - スクリーンリーダー完全対応（WCAG 2.1 AA）

- **HowTo Structured Data 実装**
  - 3ステップガイド：「文字を入力」→「WPMと正確性を計測」→「スコアを伸ばして成長」
  - 画像URL・詳細説明付き
  - Google検索での「ハウツー」リッチスニペット対応

- **FAQPage Structured Data 実装**
  - 5つのQ&A（無料利用・WPM定義・デバイス対応・進行状況保存・学習モード）
  - FAQリッチリザルト（Google検索）対応

#### P2: SNS共有機能
- **SNS Share Buttons セクション追加**（Final CTA 直下）
  - X（Twitter）・Facebook・LINE・Email対応
  - 各プラットフォーム別の共有テキスト・ハッシュタグ設定
  - aria-label 付きボタン（アクセシビリティ対応）
  - HoverEffect + Responsive Design（CSS Grid）
  
- **スタイル追加** (`styles.css`)
  - `.sns-share` コンテナ：背景パネル・上下ボーダー
  - `.share-buttons` grid layout：レスポンシブ flex wrap
  - `.share-btn` カラーバリエーション（Twit:cyan / FB:blue / LINE:green / Email:orange）

### v1.6.1 (2026-06-03) - アクセシビリティ改善

- **P1**: `index.html` のヘッダーボタングループに `aria-label` を追加
  - 言語切り替えボタン（日本語・English）: `aria-label="日本語で表示"`、`aria-label="Display in English"`
  - フォントサイズ変更ボタン（極小・小・標準・大・特大）: 各サイズに対応した `aria-label="テキストサイズを[サイズ]に変更"`
  - スクリーンリーダーユーザーのナビゲーション改善、WCAG 2.1 AA 準拠

### v1.6.0 (2026-05-30) - モバイルUX改善・機能強化

- **P1**: `app.html` の `#typingInput` / `#timeAttackInput` に `autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"` 追加（スマホでのオートコレクト・大文字化・スペルチェック妨害を防止）
- **P1**: `js/advanced-analytics.js` の `setupEventListeners()` からクリックリスナー登録を削除（app.html の buildAnalyticsHTML ハンドラとのダブルリスナー競合を解消）
- **P1**: `js/app.js` の `_showTimeAttackResults()` に `ta-bestScoreBanner` 表示ロジック追加（自己ベスト更新時に金色バナーが表示されるように修正）
- **P2**: `js/app.js` にリアルタイムWPMグラフ機能を実装（`_initLiveChart()`・`_updateLiveChart()`・`_wpmHistory`）。セッション開始時に `#wpmChartContainer` を表示、5文字入力ごとにグラフ更新、完了時に非表示
- **P2**: `app.html` に `visualViewport` API を使ったモバイル仮想キーボード出現時のスクロール制御を追加（入力欄フォーカス時に自動スクロールで画面外に隠れない改善）
- **P3**: `app.html` の `renderPhraseBankTab()` にEmptyState表示を追加、各フレーズ行に「▶ 練習」クイックボタンを追加、`quickPracticePhrase()` 関数を新規実装（1タップで即座に練習開始）
- **P3**: `data/practice-texts.json` に `japanese_basic`（12件）・`japanese_phrases`（15件）カテゴリを追加（計27件）。`app.html` に「🇯🇵 日本語練習」ミッションボタンと `startJapaneseMission()` 関数を追加
- **P4**: `app.html` の `shareToX()` / `shareToLine()` / `shareTimeAttackToX()` のシェアテキストをランク・ストリーク情報を含む魅力的なフォーマットに改善

### v1.5.0 (2026-05-30) - 統計バグ修正・ゲームUX改善

- **P1**: `js/advanced-analytics.js` の `showAnalytics()` に全 `.analytics-content` 非表示→対象のみ表示ロジックを追加（統計タブがクリックしても表示されないバグ修正）
- **P1**: `js/advanced-analytics.js` でアクティブタブのハイライト実装（選択中タブが視覚的に区別可能に）
- **P1**: `app.html` 統計タブボタンの未定義CSSクラス `hover:bg-cosmic-hover` / `border-cosmic-border` → `hover:bg-gray-700` / `border-gray-600` に修正
- **P2**: `app.html` の `#typingInterface` ヘッダーに `#currentMissionBadge` スパンを追加、ミッション選択時に `setMissionBadge()` で更新、ミッション選択画面に戻ると `clearMissionBadge()` で消去
- **P3**: `app.html` の `startWeakKeyPractice()` にテキストセット後 500ms で `startCustomMission()` を自動呼び出し追加（弱点キー練習ボタン1タップで即座に練習開始）
- **P4**: `app.html` タイムアタック結果パネルに `#ta-wpmDiff` バッジ追加、`js/app.js` の `_showTimeAttackResults()` で `cosmicTyping_bestTA_{time}` と比較して▲/▼差分を表示・自己ベストを自動更新
- **P4**: `css/mobile-optimization.css` にモバイル固定スタートボタンバー（`#mobileStickyStart`）追加、`app.html` に対応HTMLと MutationObserver ベース表示切替ロジックを実装

### v1.4.0 (2026-05-30) - UX改善・バグ修正・コンテンツ拡充

- **P1**: `app.html` の `<main>` に `pb-20` 追加 → アフィリエイトバナーで開始ボタンが隠れる問題を修正
- **P1**: `app.html` の `#textDisplay` に初期ガイダンステキスト追加（ミッション選択前の空UI改善）
- **P1**: `js/features.js` の `AchievementUnlocker.checkAndUnlock()` でコードモード完了フラグ(`cosmicTyping_codeDone`)を自動保存するよう修正（「コードパイロット」実績バグ修正）
- **P1**: `app.html` のミッションプレビューtoolipに `:active` 疑似クラス追加 → モバイルタッチで表示対応。モバイル時はツールチップを上部に表示
- **P2**: `app.html` の `#timeAttackTextDisplay` border を `border-2 border-cosmic-cyan` に統一（通常モードとの視覚的一貫性）
- **P2**: `app.html` の `downloadScoreCard()` 改善 → canvas高さ240→280px、ランクバッジ(S/A/B/C/D)・XP・パイロット名をスコアカード画像に追加
- **P3**: `js/features.js` の `DiscoveryManager.addDiscovery()` で `date` フィールド（ISO date）を保存するよう変更
- **P3**: `app.html` の週別統計グラフのラベルを日付(M/D HH:mm)形式に改善（後方互換あり）
- **P3**: `data/practice-texts.json` にコードスニペット12件追加（TypeScript/React/CSS/Node.js/SQL等）→ code_snippets: 20→32件、total: 220→232件
- **P4**: `app.html` の実績モーダル・レベルアップモーダルに `role="alertdialog"` + `aria-live="assertive"` 追加（スクリーンリーダー対応）

### v1.3.0 (2026-05-29) - バグ修正・品質改善
- **P1**: app.html のスコアカード canvas に誤記「39 TypingMaster Pro」→「Cosmic Typing Adventure」修正
- **P1**: app.html の弱点キー練習ナビゲーション `showSection('missions')` → `showSection('game')` 修正（セクション名未定義エラー解消）
- **P1**: app.html の `achievementModalIcon` に `id` 属性追加（実績解放モーダルでアイコンが表示されない不具合修正）
- **P2**: app.html のタイムアタックランキングボタンで `window._lastTimeLimit` が undefined の場合 localStorage フォールバック追加
- **P2**: app.html のカスタムテキスト練習開始 setTimeout 200ms → 400ms、`typingEngine.currentText` への直接セット追加（selectPlanet 競合解消）
- **P3**: app.html の BGM 初期化に `window.CosmicBgm &&` ガード追加（初期化前呼び出し防止）
- **P3**: app.html フレーズバンク `renderPhraseBankTab` に `_escHtml` エスケープ処理追加（XSS対策）
- **P4**: app.html 統計タブの「パフォーマンス推移」プレースホルダーに「🎓 基礎訓練を始める」ボタン追加
- **P4**: css/mobile-optimization.css モバイルでのタイピング画面最適化（`textDisplay` max-height・WPMグラフ非表示）

### v1.2.0 (2026-05-29) - UX改善・バグ修正
- **P1**: app.html の重複 `id="typingProgressBar"` 解消（常時表示バーが機能しないバグ修正）
- **P1**: app.html の `liveAccuracy` + 「正確率」ラベルを `text-center div` でラップしレイアウト崩れ修正
- **P2**: app.html に一時停止オーバーレイ追加（textDisplay 上に「⏸ 一時停止中」表示、Esc/開始ボタンで再開）
- **P2**: features.js にタイムアタック残り時間の視覚警告追加（10秒以下でオレンジ、5秒以下で赤+点滅）
- **P3**: features.js デイリーチャレンジ GOALS に初心者向け3ゴール追加（20WPM達成・正確率80%・コンボ10x）
- **P3**: app.html の `timeAttackInput` スタイルを `typingInput` と統一（border-2 + border-cosmic-cyan）
- **P4**: features.js にランクバッジカラー追加（S=金、A=緑、B=青、C=黄、D=灰）

### v1.1.5 (2026-05-29) - アクセシビリティ・パフォーマンス改善
- **P1**: app.html の currentWPM/currentAccuracy/currentCombo/liveWPM/liveAccuracy/timeAttackWPM/timeAttackAccuracy/timeAttackCombo に aria-live="polite" aria-atomic="true" 追加（スクリーンリーダー対応）
- **P2**: index.html の console.log (初期化・言語切替・フォントサイズ・SW登録・ページ時間計測・パフォーマンス計測) を削除
- **P3**: css/app.css progress-fill の transition を width→transform(scaleX) に変更しレイアウトリフロー排除
- **P3**: css/mobile-optimization.css の progress-fill transition も同様に更新
- **P3**: js/ux-utils.js の progress bar 更新ロジックを style.width→style.transform(scaleX) に変更

### v1.1.2 (2026-05-28) - 全ページFont Awesome完全廃止・PWA統一
- **P1**: how-to-use.html の Font Awesome CDN削除 + 91アイコンを絵文字に置換
- **P1**: contact.html / privacy.html / terms.html の Font Awesome CDN削除・絵文字統一
- **P2**: how-to-use.html に theme-color/manifest/apple-touch-icon 追加・favicon/og:url修正
- **P2**: text-manager.html に theme-color/manifest/apple-touch-icon/OGPタグ追加
- **P2**: app.html に manifest/apple-touch-icon 追加
- **P3**: how-to-use.html の console.log 削除

### v1.1.1 (2026-05-28) - アクセシビリティ・PWA品質改善
- **P1**: index.html の未ロード Font Awesome アイコン（ソーシャルシェアボタン・フッター）を絵文字に置換
- **P1**: text-manager.html の Font Awesome CDN リンクを削除し、絵文字に統一
- **P2**: manifest.json の theme_color を index.html と統一（#6366F1）
- **P2**: sw.js の不要な console.log を削除してログ出力を抑制
- **P3**: index.html の role 属性重複（role="group" + role="main"）を role="region" に修正

### v1.1.0 (2026-05-28) - コード品質改善
- **P1**: Font Awesome CDN依存を廃止し、絵文字アイコンに統一（index.html / app.html）
- **P1**: console.log をloggerインスタンス経由に統一（14ファイル・131箇所）
- **P2**: ライトモード対応CSS追加（data-theme="light" / prefers-color-scheme）
- **P2**: テーマ切り替えボタンを設定パネルに追加
- **P2**: エラーメッセージの日本語化・ユーザーフレンドリー化拡充
- **P3**: Service Workerキャッシュバージョンを日付ベースに更新（v20260528）
- **P4**: LINEシェアボタンを結果パネルに追加

## よくある質問（FAQ）

**Q: タイピング練習は無料で使えますか？**

はい、完全無料・登録不要でご利用いただけます。

**Q: スマートフォンで使えますか？**

はい、スマートフォン・タブレット・PCすべてでご利用いただけます。

**Q: 途中で一時停止できますか？**

はい、一時停止ボタンで止めて、再開することができます。

**Q: カスタムの時間を設定できますか？**

はい、プリセット以外に任意の時間を直接入力して設定できます。

**Q: 時間終了時に通知はありますか？**

画面上でアラート表示します。ブラウザの設定によって音声が出る場合があります。


## 関連サービス

- [睡眠の質チェッカー](https://appadaycreator.com/sleep-quality-checker/)
- [BMI・体重管理](https://appadaycreator.com/bmi-body-tracker/)
- [家計簿診断](https://appadaycreator.com/household-budget-analyzer/)

## テスト

| ファイル | フレームワーク | 概要 |
|---------|--------------|------|
| `tests/e2e/` | Playwright | 本番URL対象E2E（Jest対象外） |

## デプロイ

GitHub Pages（mainブランチ push → 自動デプロイ）

## ライセンス

MIT License

## 変更履歴

- v1.1.4 (2026-05-29): Font Awesome完全廃止(絵文字置換)・ブランドカラー統一(app.html #7c3aed)・core-debugger console.log debugMode化・OGP自己ホスト化・モーダルARIA追加
- v1.1.3 (2026-05-29): app.html OGP追加・aria-label拡充・app.js console.log削除
