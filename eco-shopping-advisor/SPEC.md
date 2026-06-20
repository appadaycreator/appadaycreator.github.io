# エコ・サステナブル買い物診断【無料】無料診断・アドバイス - 技術仕様書

## 概要

**サービス名**: Eco Shopping Advisor
**バージョン**: 1.3.0
**更新日**: 2026-06-20
**URL**: https://appadaycreator.com/eco-shopping-advisor/

購入を検討している商品のエコ度・サステナビリティスコアを診断。代替品も提案。登録不要・完全無料でご利用いただけます。

## データ管理

- **ストレージ**: ブラウザ localStorage（外部API通信なし）
- **永続化**: ページ読み込み時に自動復元
- **クリア**: ブラウザのサイトデータ削除で初期化

## 技術スタック

- HTML5 / CSS3 / Vanilla JavaScript
- PWA対応（manifest.json / Service Worker）
- レスポンシブデザイン（モバイルファースト）

## 使い方

1. ページを開き、診断の説明を確認する
2. スタートボタンをクリックして診断を開始する
3. 表示される質問に順番に回答する（約1〜2分）
4. すべて回答すると診断結果が自動表示される
5. 結果のアドバイスを確認してSNSでシェアする

## よくある質問（FAQ）

**Q: エコ・サステナブル買い物診断は無料で使えますか？**

はい、完全無料でご利用いただけます。登録・ログイン・アプリのインストールも不要です。

**Q: 何回でも診断できますか？**

はい、何度でもご利用いただけます。条件を変えて繰り返し診断してみてください。

**Q: スマートフォンでも使えますか？**

はい、スマートフォン・タブレット・PCすべてのデバイスに対応しています。

**Q: 診断結果は保存されますか？**

結果はブラウザには保存されません。スクリーンショットやSNSシェアでご記録ください。

**Q: 入力したデータはサーバーに送信されますか？**

いいえ。すべての処理はブラウザ内で完結し、個人情報・入力データのサーバー送信は行いません。


## 関連サービス

- [Green Diary App](https://appadaycreator.github.io/green-diary-app/)
- [カーボンフットプリント計算ツール](https://appadaycreator.github.io/carbon-footprint-calculator/)
- [Household Budget Analyzer](https://appadaycreator.github.io/household-budget-analyzer/)

## テスト

| ファイル | フレームワーク | 概要 |
|---------|--------------|------|
| `tests/e2e/` | Playwright | 本番URL対象E2E（Jest対象外） |

## デプロイ

GitHub Pages（mainブランチ push → 自動デプロイ）

## ライセンス

MIT License

## 更新履歴

### v1.3.0 (2026-06-20)
- **V1: CTA ボタンの視認性向上**: .cta-pill に amber glow box-shadow・border opacity 強化・scale(1.05)・font-weight:900 で埋もれ改善
- **V2: 狭い画面対応強化**: 900px以下での sidecard margin・card margin 調整・520px以下で scan-row を flex-direction:column・scan-btn を width:100%・quiz-opt/btn padding 最適化
- **V3: ページ下部の視覚的境界明確化**: sponsor section に green gradient 背景・border-top 3px 化・bottom border 追加・link styling 強化（hover effect・shadow・title 属性）
- **M8: ツールチップ＆入力ガイダンス充実**: 商品名入力欄に info icon（ℹ️）追加・quiz-start 説明文を amber box で強調・goal-score に badge・title・aria-label 追加・各ボタン（スキャン・設定・結果処理）に title・aria-label・font-weight 強化付与

### v1.2.0 (2026-06-13)
- **M4: グラフ・スコア・ゲージで結果を可視化**: Canvasを用いたスコアゲージ描画・色付け表示・達成度プログレスバー
- **M6: 目標設定・達成度トラッキング**: 目標値のlocalStorage保存・前回との比較表示・達成率計算
- **M10: 印刷・結果エクスポート機能**: CSVダウンロード・印刷ボタン・結果コピー機能を統合
- **M14: FAQPage スキーマ拡張**: 構造化データ（FAQPage）を5問に拡張。診断結果保存・アドバイス内容・定期診断の推奨など、ユーザー関心事項をカバー

### v1.1.0 (2026-06-05)
- **質問数の統一**: 診断画面の進捗表示を「質問 6/6」に修正（実際の質問数と整合）
- **結果共有機能**: 診断結果に「結果をコピー」ボタンを追加。スコア情報をクリップボードにコピー可能に
- **UX改善**: 結果表示画面のボタンをグリッド表示で整理
