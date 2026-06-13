# クレジットカード最適化診断【無料】無料Webツール - 技術仕様書

## 概要

**サービス名**: Credit Card Optimizer
**バージョン**: 1.3.0（自動改善フェーズ4適用）
**更新日**: 2026-06-10
**URL**: https://appadaycreator.com/credit-card-optimizer/

生活パターンからポイント還元率が最高になるクレジットカードの組み合わせを診断。登録不要・完全無料でご利用いただけます。

## データ管理

- **ストレージ**: ブラウザ localStorage（外部API通信なし）
- **永続化**: ページ読み込み時に自動復元
- **クリア**: ブラウザのサイトデータ削除で初期化

## 技術スタック

- HTML5 / CSS3 / Vanilla JavaScript
- PWA対応（manifest.json / Service Worker）
- レスポンシブデザイン（モバイルファースト）

## 使い方

1. ページを開き、入力フォームの項目を確認する
2. 必要な情報を入力または選択する
3. 実行ボタンをクリックして結果を取得する
4. 表示された結果・アドバイスを確認する
5. 必要に応じてコピー・SNSシェアで活用する

## 更新履歴

### v1.4.0 (2026-06-10) - 自動改善フェーズ5（M10: 印刷・エクスポート機能）

**P1 実装内容 (M10: 印刷・結果エクスポート機能)**:
- ✅ 結果セクションに3つの操作ボタンを追加：
  - 「🖨️ 印刷」: `window.print()` で診断結果をPDF/紙に印刷可能
  - 「📋 コピー」: `navigator.clipboard.writeText()` で診断結果テキストをクリップボードにコピー
  - 「📥 CSV」: 診断内容をCSV形式でダウンロード（日時・支出・カテゴリ・推奨カード・年間ポイント等を含む）
- ✅ ボタンUI改善：フレックスレイアウトで3ボタン横並び、モバイル対応（flex-wrap: wrap）
- ✅ 印刷機能：既存CSS `@media print` で不要要素を非表示化（広告・ボタン・ナビゲーション）
- ✅ コピー機能：診断日時・入力条件・推奨カード・複数カード戦略をテキスト形式でクリップボードに
- ✅ CSV出力：複数カード戦略も含めた完全な診断データを行形式で出力・ダウンロード

**技術的改善**:
- `printResult()`: `window.print()` で標準印刷ダイアログを起動
- `copyResultText()`: 診断内容を構造化テキスト形式で組立 → `navigator.clipboard.writeText()`
- `downloadCSV()`: CSV形式に変換 → `Blob` + `URL.createObjectURL()` → `<a download>` で自動ダウンロード
- ボタングループ：CSS `display: flex; gap: 8px; flex-wrap: wrap;` で レスポンシブ対応

**UI/UX改善（同時実装）**:
- 結果セクションのスタイル強化：
  - 年間ポイント還元額表示を `font-size: 42px` に拡大
  - `background: linear-gradient(135deg, #f0f4ff 0%, #fef3c7 100%)` で淡い背景を追加
  - `border-radius: 12px` + `padding: 20px` でより目立つ表示に

**実装ファイル**:
- `index.html`: 
  - 結果セクション内にボタングループ HTML 追加
  - `printResult()`, `copyResultText()`, `downloadCSV()` 関数を JavaScript に実装
  - `.result-value` スタイルを拡張（背景・パディング・フォントサイズ）

---

### v1.3.0 (2026-06-10) - 自動改善フェーズ4（M4: Chart.js グラフ化 / M8: ツールチップガイダンス）

**P1 実装内容 (M4: グラフ・スコア・ゲージで結果を可視化)**:
- ✅ Chart.js CDN (v4.4.0) を追加：`https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js`
- ✅ ドーナツチャート（doughnut chart）で年間ポイント還元額を可視化
  - 「1枚カード（単一還元）」vs「複数カード組み合わせ（追加ポイント）」の比較表示
  - チャート中央に年間合計還元額をテキスト表示
- ✅ レスポンシブ対応：PC / タブレット / スマートフォンで自動レイアウト調整
- ✅ Chart.jsプラグイン実装：中央にテキストを描画するカスタムプラグイン

**技術的改善**:
- `chartInstance` グローバル変数で既存チャートを管理
- `renderChart(annualSingle, annualCombo)` 関数で動的にチャートを生成・破棄
- Chart.jsデータセット：`data: [annualSingle, savings]` で 1枚 vs 複数枚の還元額差を可視化
- 複数回の診断時に古いチャートを自動破棄して新しいチャートを再描画

**P2 実装内容 (M8: ツールチップ・入力ガイダンス充実)**:
- ✅ 各入力項目に「❓」ヘルプアイコンを追加（4個）
  - 「月間カード支出」: 月間支出の定義説明
  - 「最も多い支出カテゴリ」: カテゴリ選択の意図説明
  - 「ライフスタイル」: ライフスタイル判定の影響説明
  - 「年会費」: 年会費の考慮方法説明
- ✅ CSS ホバー時ツールチップ表示：`.tooltip-icon:hover::after` で `data-tooltip` 属性を表示
- ✅ CSS 矢印ポインタ：`.tooltip-icon:hover::before` で三角矢印を表示
- ✅ レスポンシブ対応：モバイル環境では幅160px、フォント11pxで最適化
- ✅ Placeholder テキスト改善：「例: 80000」→「例: 月間80,000円（年96万円）」
- ✅ JavaScript: tabindex 設定でキーボードナビゲーション対応

**実装ファイル**:
- `index.html`: Chart.js スクリプト追加、チャートコンテナ追加、ツールチップアイコン・CSS追加

---

### v1.2.0 (2026-06-05) - 自動改善フェーズ3（複数カード戦略・シナリオ比較）

**P1 実装内容**:
- ✅ 複数カード組み合わせ情報の拡充：CARDS オブジェクトに `combo_strategies` フィールドを追加
  - 各カテゴリ・年会費別に複数カード組み合わせデータを構造化
  - 例：「楽天カード + PayPayカード で年4.5% 還元」といった具体的な組み合わせ提案
- ✅ 診断結果をより視覚的に（インフォグラフィック化）
  - 年間ポイント還元を「1枚カード」vs「複数カード組み合わせ」で比較表示
  - CSS 棒グラフ（`linear-gradient` + width:XX%）で可視化
  - 複数カード活用での増加額を「🎯 年間+XXX円増！」と強調表示

**技術的改善**:
- CARDS オブジェクト構造：`{ main: [...], combo: [{cards, rate, reason}] }`
- buildOutput() 関数を大幅拡張：graphHtml / mainCardsHtml / comboHtml を個別生成して連結
- 複数シナリオ計算：baseRate vs comboRate で annualSingle/annualCombo を別計算
- 棒グラフのwidth計算：`Math.min(100, annualSingle/annualCombo*100)%` で相対値を表示

**実装済みの前フェーズ機能**（v1.1.0 より）:
- 診断履歴機能（localStorage、最大10件）
- 入力値検証の改善（inline error message）
- モバイル UI 最適化（select カスタムドロップダウン、タッチサイズ）

---

### v1.1.0 (2026-06-03) - 自動改善フェーズ2

**P1 修正内容**:
- ✅ Twitter メタタグ (twitter:image, twitter:description) を <head> 内に移動（SNS 共有プレビュー対応）
- ✅ セマンティック HTML 構造の修正（末尾の不要なアフィリエイト広告を削除）

**P2 改善内容**:
- ✅ 入力値検証の改善：alert() → inline error message に変更（UX向上）
- ✅ 診断履歴機能を追加（localStorage 使用、最大10件保存）
- ✅ 過去の診断結果を復元可能に
- ✅ モバイル UI 最適化：select 要素のカスタマイズ、フォントサイズ調整

**技術的改善**:
- localStorage を使用した診断履歴管理
- renderHistory() / restoreResult() / clearHistory() 新規関数実装
- CSS: select 要素に custom dropdown indicator 追加
- レスポンシブ対応強化（モバイル min-height 44px タッチサイズ確保）

---

## よくある質問（FAQ）

**Q: クレジットカード最適化診断は無料で使えますか？**

はい、完全無料・登録不要でご利用いただけます。

**Q: 何回でも使えますか？**

はい、回数制限なく何度でもご利用いただけます。

**Q: 入力したデータはサーバーに送信されますか？**

いいえ。すべての処理はブラウザ内で完結し、入力内容はサーバーへ送信されません。

**Q: スマートフォンでも使えますか？**

はい、スマートフォン・タブレット・PCすべてに最適化されています。

**Q: 結果を保存・共有できますか？**

スクリーンショットでの保存またはSNSシェアボタンからご共有いただけます。


## 関連サービス

- [💳 ポイント・マイル最適化診断](https://appadaycreator.github.io/point-optimizer/)
- [Household Budget Analyzer](https://appadaycreator.github.io/household-budget-analyzer/)
- [🔥 FIRE計算機](https://appadaycreator.github.io/fire-calculator/)

## テスト

| ファイル | フレームワーク | 概要 |
|---------|--------------|------|
| `tests/e2e/` | Playwright | 本番URL対象E2E（Jest対象外） |

## デプロイ

GitHub Pages（mainブランチ push → 自動デプロイ）

## ライセンス

MIT License
