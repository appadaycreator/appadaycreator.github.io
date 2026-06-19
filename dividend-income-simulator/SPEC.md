# 配当収入シミュレーター【無料】簡単・無料計算 - 技術仕様書

## 概要

**サービス名**: Dividend Income Simulator
**バージョン**: 1.4.0
**更新日**: 2026-06-19
**URL**: https://appadaycreator.com/dividend-income-simulator/

保有株・投資信託の配当利回りから年間配当収入を計算。FIRE達成額との比較も。登録不要・完全無料でご利用いただけます。

## データ管理

- **ストレージ**: ブラウザ localStorage（外部API通信なし）
- **永続化**: ページ読み込み時に自動復元
- **クリア**: ブラウザのサイトデータ削除で初期化

## 更新履歴

- v1.4.0 (2026-06-19): M10 印刷機能（window.print()・印刷用CSS最適化）・CSVダウンロード（BOM付きUTF-8）を追加。V1 参考値ボックス背景色強化・V2 hint-textフォントサイズ改善・V3 税引き後利率警告を黄色ボックス表示に改善
- v1.3.0 (2026-06-19): M3 localStorage計算履歴（最大10件・入力値復元）、M4 Chart.jsドーナツグラフ（税引き前/後内訳）、M7 比較シミュレーションテーブル（複数シナリオ比較・最大収益ハイライト）を追加

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

## よくある質問（FAQ）

**Q: 配当収入シミュレーターは無料で使えますか？**

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

- [🔥 FIRE計算機](https://appadaycreator.github.io/fire-calculator/)
- [Nisa Ideco Simulator](https://appadaycreator.github.io/nisa-ideco-simulator/)
- [投資信託・ETF診断](https://appadaycreator.github.io/investment-fund-advisor/)

## テスト

| ファイル | フレームワーク | 概要 |
|---------|--------------|------|
| `tests/e2e/` | Playwright | 本番URL対象E2E（Jest対象外） |

## デプロイ

GitHub Pages（mainブランチ push → 自動デプロイ）

## ライセンス

MIT License
