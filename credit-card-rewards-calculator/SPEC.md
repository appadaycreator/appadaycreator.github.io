# クレカ還元率・ポイント計算【無料】簡単・無料計算 - 技術仕様書

## 概要

**サービス名**: Credit Card Rewards Calculator
**バージョン**: 1.3.0
**更新日**: 2026-06-10
**URL**: https://appadaycreator.com/credit-card-rewards-calculator/

月間支出・カード別還元率から年間獲得ポイント・キャッシュバック額を比較計算。登録不要・完全無料でご利用いただけます。

## データ管理

- **ストレージ**: ブラウザ localStorage（外部API通信なし）
- **永続化**: ページ読み込み時に自動復元
- **クリア**: ブラウザのサイトデータ削除で初期化

## 技術スタック

- HTML5 / CSS3 / Vanilla JavaScript
- PWA対応（manifest.json / Service Worker）
- レスポンシブデザイン（モバイルファースト）

## 計算モード

### シンプルモード
月間クレカ支出額と還元率を入力して、年間獲得ポイントと8カード比較を表示する。

### カテゴリ別モード
食費・交通費・ネット通販・コンビニ・外食・その他の6カテゴリ別支出を入力。
カードごとのカテゴリ別ボーナス還元率（三井住友NLのコンビニ5%等）を考慮した正確な年間ポイントを比較する。

## 比較対象カード（v1.1.0）

| カード | 基本還元率 | コンビニ | ネット通販 | 交通費 |
|--------|-----------|---------|-----------|--------|
| 楽天カード | 1.0% | 1.0% | 3.0% | 1.0% |
| PayPayカード | 1.0% | 2.0% | 1.5% | 1.0% |
| 三井住友カード NL | 0.5% | 5.0% | 0.5% | 0.5% |
| dカード | 1.0% | 1.0% | 1.0% | 1.0% |
| Orico THE POINT | 2.0% | 2.0% | 2.5% | 2.0% |
| Amazon Mastercard | 1.5% | 1.5% | 2.0% | 1.5% |
| JALカード | 1.0% | 1.0% | 1.0% | 2.0% |
| ANAカード | 1.0% | 1.0% | 1.0% | 2.0% |

## 使い方

1. シンプル/カテゴリ別モードを選択する
2. 月間支出額（または各カテゴリ別支出）を入力する
3. 「ポイントを計算する」ボタンをクリックする
4. 棒グラフ付きカード比較で最適カードを確認する
5. 条件を変えて複数パターンを比較する

## 追加機能（v1.3.0）

- **M6: 目標設定・達成度トラッキング機能**
  - 年間目標ポイント数をオプション設定可能
  - 計算結果とリアルタイムで達成度（%）を自動計算・表示
  - プログレスバーで視覚化（目標達成時は「✅ 目標達成！」表示）
  - 目標値を localStorage に永続保存（次回開いた時に自動復元）
  - 前回計算結果との比較表示（増減ポイント・グラフアイコン付き）
  - 計算結果ページに「🎯 目標達成度」「📊 前回との比較」セクション追加

## 追加機能（v1.2.3）

- PWA メタタグ完全統一（全ページ）
  - `color-scheme`: light モード明示（全ページ）
  - `theme-color`: #6366F1（すべてのHTML・ブラウザUI）
  - `apple-mobile-web-app-capable`: yes（全ページ）
  - `apple-mobile-web-app-status-bar-style`: black-translucent（iOS ステータスバー）
  - `apple-mobile-web-app-status-bar`: #6366F1（iOS ステータスバー背景）
  - `msapplication-TileColor`: #6366F1（Windows タイル背景）
  - manifest.json の `theme_color`: #6366F1
  - 修正対象: index.html, contact.html, privacy-policy.html, terms.html, usage.html
  - contact.html の theme-color を #7c3aed から #6366F1 に統一

## 追加機能（v1.2.2）

- PWA theme-color デフォルト色の完全統一（全ページ）
  - `color-scheme`: light モード明示（index.html）
  - `theme-color`: #6366F1（すべてのHTML・ブラウザUI）
  - `apple-mobile-web-app-status-bar-style`: black-translucent（iOS ステータスバー）
  - `apple-mobile-web-app-status-bar`: #6366F1（iOS ステータスバー背景）
  - `msapplication-TileColor`: #6366F1（Windows タイル背景）
  - manifest.json の `theme_color`: #6366F1
  - 修正対象: index.html, contact.html, privacy-policy.html, terms.html, usage.html

## 追加機能（v1.2.1）

- PWA カラーテーマ統一（Apple・Windows対応）
  - `apple-mobile-web-app-capable`: iOS ホーム画面追加対応
  - `apple-mobile-web-app-status-bar-style`: iOS ステータスバースタイル統一（black-translucent）
  - `msapplication-TileColor`: Windows タイル背景色統一（#6366F1）

## 追加機能（v1.2.0）

- カテゴリ別モード内訳表示（カード別×カテゴリ別還元率の詳細を1位カードに表示）
- キーボード操作改善（tabindex設定で順序明示、Enter後フォーカス管理）
- 前回入力復元バナー（復元時に表示、新規開始ボタン付き）
- ポイント表記精度向上（「≈¥XXX相当」から「XXXpt」に変更）
- モバイルレイアウト最適化（結果表示の字下げ調整）

## 追加機能（v1.1.0）

- カテゴリ別モード（6カテゴリ × 8カードのマトリクス計算）
- CSS棒グラフによる視覚的比較
- 年間ポイント表示
- お得提案メッセージ（カード変更で得られる追加ポイント）
- localstorage による前回入力値の自動復元
- 計算後のスムーズスクロール
- モバイル最適化（inputmode属性）
- PWA対応（theme-color統一、short_name修正）

## よくある質問（FAQ）

**Q: クレカ還元率・ポイント計算は無料で使えますか？**

はい、完全無料・登録不要でご利用いただけます。

**Q: 計算結果は正確ですか？**

参考値としてご活用ください。重要な判断の際は専門家・公式機関にご確認ください。

**Q: 何回でも計算できますか？**

はい、回数制限なく何度でもご利用いただけます。条件を変えて比較にお使いください。

**Q: 入力したデータはどこかに保存されますか？**

いいえ。すべての計算はブラウザ内で処理され、データのサーバー送信は行いません。

**Q: スマートフォンで利用できますか？**

はい、PC・スマートフォン・タブレットすべてに対応しています。


## 関連サービス

- [💳 ポイント・マイル最適化診断](https://appadaycreator.com/point-optimizer/)
- [Household Budget Analyzer](https://appadaycreator.com/household-budget-analyzer/)
- [💳 クレジットカード最適診断](https://appadaycreator.com/credit-card-finder/)

## テスト

| ファイル | フレームワーク | 概要 |
|---------|--------------|------|
| `tests/e2e/` | Playwright | 本番URL対象E2E（Jest対象外） |

## デプロイ

GitHub Pages（mainブランチ push → 自動デプロイ）

## ライセンス

MIT License
