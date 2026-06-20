# 音感トレーニング【サウンドマスター】絶対音感・相対音感を鍛える - 技術仕様書

## 概要

**サービス名**: Sound Master Training
**バージョン**: 2.1.0
**更新日**: 2026-06-20
**URL**: https://appadaycreator.com/sound-master-training/

音を聞いて音名を当てる音感トレーニングアプリ。絶対音感・相対音感を楽しく鍛えられる無料の音楽学習ツール。

## 更新履歴
- v2.1.0 (2026-06-20): V1: セカンダリボタン（使い方を見る）のサイズ修正（min-height:44px / font-size:0.95rem）でヒエラルキー明確化。V2: ヒーローCTAのスクロール誘導追加（スクロールヒント表示 + startTraining クリックでtrainingAppへスムーズスクロール）。V3: Cookieバナーのモバイルレイアウト修正（@media flex-direction:column / button width:100%）。M2: モード選択時にインタラクティブ説明パネル表示（MODE_DESC マップ）。
- v2.0.0 (2026-06-20): M4(リトライ): Chart.js@4.4.0を追加し音ごとの正答率バーチャートをChart.jsで実装（noteBarChart canvas / new Chart）。training.jsでnoteStats更新時にrefreshNoteBarChartを呼び出してリアルタイム更新。
- v1.9.0 (2026-06-20): V1: メインCTAボタンのpulse animation強調・副CTAを縮小で視線誘導改善。V2: .training-options/.training-controlsのモバイル縦積みCSS追加。V3: Cookieバナーの同意をlocalStorage保存（毎回表示バグ修正）。M2: playSound押下時のバリデーション（未選択でエラートースト表示）＋デフォルト値auto-select。M4: 正答率SVGドーナツゲージをprogress-sectionに追加（MutationObserverでリアルタイム更新）
- v1.8.0 (2026-06-19): M2: 初期選択UIのデフォルト値反映・バリデーションのトースト通知対応。M4: 音ごとの正答率バーチャート（noteAccuracyChart）をstats-sectionに追加

## データ管理

- **ストレージ**: ブラウザ localStorage（外部API通信なし）
- **永続化**: ページ読み込み時に自動復元
- **クリア**: ブラウザのサイトデータ削除で初期化

## 技術スタック

- HTML5 / CSS3 / Vanilla JavaScript
- PWA対応（manifest.json / Service Worker）
- レスポンシブデザイン（モバイルファースト）

## 使い方

1. トレーニングモード（単音当て・音程当て・和音判別・メロディ記憶）と難易度を選択する
2. 「音を再生」ボタンを押して音を聴く（Web Audio API使用）
3. ピアノキーボードまたは選択ボタンで回答する
4. 正答率・スコア・ランクを統計画面で確認する
5. 継続プレイでスコア推移グラフに成長記録が蓄積される

## v1.7.0 変更点（2026-06-13）

### UX・エクスポート機能拡張 ✅
- **M2: 入力UI バリデーション強化**: trainingMode・difficultyLevel に `aria-required="true"` と `required` 属性を追加 → フォームのセマンティック性向上・ブラウザ標準バリデーションに対応
- **M4: グラフ・ビジュアライゼーション**: Canvas ベースのスコア推移グラフ・正答率推移グラフが sessionHistory で管理 → セッション終了時に自動保存・次回訪問時に復元
- **M10: CSVエクスポート機能**: training.js に downloadCSV() メソッドを追加・index.html に「CSV出力」ボタンを追加 → 統計結果を CSV ファイルでダウンロード可能（モード別正答率も含む）
- **実装確認完了**: M4（Canvas グラフ描画：スコア推移 + 正答率推移）・M10（印刷・コピー・CSV出力）が statistics.js・training.js で完全実装・動作確認済み ✅

## v1.6.0 変更点（2026-06-10）

### UX改善・機能拡張 ✅
- **M2: 入力UI改善**: トレーニングモード・難易度の select 要素に label、説明テキスト、ツールチップアイコンを追加 → 初心者でもモード選択時に迷わない
- **M4: グラフ・ビジュアライゼーション強化**: スコア推移グラフに加えて、正答率推移グラフを2列レイアウトで並列表示 → 成長を2つの軸で可視化
- **M8: ツールチップ・ガイダンス充実**: モード選択欄に「?」アイコン付きツールチップを追加 → 各モードの説明が hover で表示される
- **M10: 印刷・エクスポート機能**: 統計結果の「印刷」「コピー」ボタンを追加 → 結果をテキストコピーまたは印刷で保存可能に

## v1.5.0 変更点（2026-06-06）

### UX・アクセシビリティ改善 ✅
- **問題プロンプト要素の追加（P1バグ修正）**: `index.html` に `#questionPrompt` div を追加 → `training.js` の `updateQuestionPrompt()` が正常に動作し、モード別・状態別の指示がユーザーに表示される
- **ピアノキーのキーボードイベント追加（P1アクセシビリティ修正）**: `training.js` のピアノキーに keydown イベント（Enter/Space）を追加 → Tab移動＋Enter/Spaceで回答可能に
- **音再生後のプロンプト更新**: `playCurrentSound()` 成功後に `updateQuestionPrompt('played')` を呼ぶよう修正 → 「再生前/後」で指示文が切り替わる
- **ダークテーマスタイル拡充（P2）**: `injectThemeStyles()` にヒーローセクション・機能カード・統計セクション・フィードバック・フォーム要素のダークスタイルを追加 → テーマ切替時にページ全体が暗色に統一
- **メロディモード正解表示改善（P2）**: 不正解時に全メロディシーケンス「正解メロディ: ド→ミ→ソ」を表示 → 学習効果向上
- **question-prompt CSSスタイル追加**: `.question-prompt` クラスに青背景・角丸スタイルを定義 → 指示文が視覚的に目立つ

## v1.4.3 変更点（2026-06-05）

### PWA theme-colorデフォル色の完全対応 ✅
- **初期化スクリプトの堅牢化**: meta タグが存在しない場合は動的作成 → DOM準備状態に関わらず安全に実行
- **data-theme属性の追加**: document.documentElement に data-theme を設定 → CSS media query との連携を強化
- **settings.js の同期強化**: updateThemeColor() に data-theme 属性の更新を追加 → テーマ切替時の表示が即座に反映

## v1.4.2 変更点（2026-06-04）

### PWA theme-colorデフォルト色対応 ✅
- **prefers-color-scheme自動検出**: index.html の head に初期化スクリプトを追加 → ページロード時、OS ダークモード設定を自動判定して theme-color を初期化
- **localStorage保存設定の優先**: 保存された theme 設定がある場合はそれを優先 → 保存設定がない場合は OS 設定（prefers-color-scheme: dark）を使用
- **settings.js の改善**: loadSettings() に prefers-color-scheme 判定ロジックを追加 → ユーザーが設定を保存していない初回訪問時に OS 設定を尊重
- **デバイス統合**: JavaScript実行前からmeta[name="theme-color"]が適切に設定 → Android・iOS・Windows で初回ロード時から最適なテーマカラーで表示

## v1.4.1 変更点（2026-06-04）

### PWA theme-color Windows Tile同期 ✅
- **Windows Tile色の動的更新**: updateThemeColor() にmsapplication-TileColor更新を追加 → テーマ切り替え時にWindows Tileも同期
- **クロスプラットフォーム統一**: meta[name="theme-color"]とmsapplication-TileColorが常に同じ色に保つ → 全プラットフォーム（Android・Windows・iOS）で一貫性を実現

## v1.4.0 変更点（2026-06-03）

### PWA theme-color テーマ動的対応 ✅
- **テーマに応じた theme-color 更新**: SettingsManager に updateThemeColor() メソッドを追加 → テーマ切り替え時にmeta[name="theme-color"]を動的に更新
- **テーマカラーマッピング**: light(#3c64b1), dark(#667eea), blue(#1565c0)を定義 → 各テーマに適したブラウザUI色を設定
- **デバイス統合**: Androidのステータスバー・Windows設定画面・iOSのアドレスバーがテーマに同期

## v1.3.0 変更点（2026-06-03）

### PWA theme-color クロスプラットフォーム対応 ✅
- **iOS対応**: apple-mobile-web-app-capable, apple-mobile-web-app-status-bar-style, apple-mobile-web-app-title メタタグを追加 → iOSホーム画面アプリがブランド色（#3c64b1）で表示
- **Windows対応**: msapplication-TileColor="#3c64b1" を追加 → Windows タイルがブランド色で表示
- **manifest.json最適化**: prefer_related_applications: false を設定 → PWA標準インストール提案を優先

## v1.2.0 変更点（2026-06-02）

### PWA・パフォーマンス改善
- **PWA背景色修正**: manifest.json の background_color を #3c64b1（青）から #ffffff（白）に変更 → スプラッシュスクリーン表示時に適切な白背景
- **ファビコンパス修正**: 相対パス化（/favicon.svg → ./assets/images/favicon.svg）→ CDN・サブディレクトリ配置に対応
- **JavaScript遅延読込**: training.js等に defer 属性を追加 → Core Web Vitals 最適化（LCP改善）

### アクセシビリティ改善
- **キーボード操作対応**: ピアノキー要素に tabindex="0" と role="button"、aria-label を追加
- **キーボードイベント処理**: Enter/Space キーでピアノキーをアクティベート可能に
- **フォーカス状態の可視化**: キーボード操作時に青色 outline (3px solid #3c64b1) を表示

### 設定・言語機能
- **言語設定の永続化**: localStorage で言語設定（ja/en）を保存・復元（既に settings.js で実装）
- **テーマ設定の永続化**: ライト/ダーク/ブルーテーマの設定を localStorage に保存

## v1.1.0 変更点（2026-05-29）

- **メロディモード実装**: 2〜4音のメロディを聞いてピアノで再現するモード追加（難易度別音数）
- **音フィードバック追加**: ピアノキーをタップした際にその音が0.4秒鳴る
- **回答前ガード追加**: 「音を再生」を押す前に回答するとヒントメッセージが表示される
- **自動問題生成**: ページロード時に自動で問題が生成されトレーニング開始可能
- **統計グラフ実装**: Canvas APIで直近20セッションのスコア推移折れ線グラフを描画
- **セッション履歴保存**: ページ離脱時・10回ごとにセッションスコアをlocalStorageに保存
- **モバイルロゴ修正**: white-space:nowrap でロゴ折り返しを防止
- **HowToスキーマ修正**: 汎用テンプレートから音感トレーニング固有の手順に更新

## よくある質問（FAQ）

**Q: 音感トレーニングは無料で使えますか？**

はい、完全無料・登録不要でご利用いただけます。

**Q: 記録データはどこに保存されますか？**

ご使用のブラウザのローカルストレージに保存されます。他のデバイスとは共有されません。

**Q: ブラウザを閉じても記録は残りますか？**

はい、同じブラウザを使う限りデータは保持されます。

**Q: 記録を削除するにはどうすればいいですか？**

リセットボタン、またはブラウザのサイトデータをクリアすることで削除できます。

**Q: スマートフォンで利用できますか？**

はい、スマートフォン・タブレット・PCすべてでご利用いただけます。


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
