# エンジニア転職ロードマップ｜未経験からIT転職する最短ルートを無料診断 - 技術仕様書

## 概要

**サービス名**: Engineer Career Roadmap
**バージョン**: 1.6.0
**更新日**: 2026-06-20
**URL**: https://appadaycreator.com/engineer-career-roadmap/

現職・ITスキル・転職目標期間を入力するだけで、未経験からエンジニア転職への最短ロードマップを無料生成。職種別の学習スケジュール・年収シミュレーション・転職エージェント比較も対応。

## データ管理

- **ストレージ**: ブラウザ localStorage（外部API通信なし）
- **永続化**: ページ読み込み時に自動復元
- **クリア**: ブラウザのサイトデータ削除で初期化

## 技術スタック

- HTML5 / CSS3 / Vanilla JavaScript
- Canvas 2D API（年収推移棒グラフ・外部ライブラリ不要）
- PWA対応（manifest.json / Service Worker）
- レスポンシブデザイン（モバイルファースト）

## 改善履歴

- v1.7.0 (2026-06-21): 【M2完全実装】入力UI・バリデーション改善（select/input フォント拡大1rem・パディング14px 16px・min-height:48px・touch-action添付）、ボタン拡大（.btn-primary padding:16px 14px・min-height:56px・box-shadow強化・margin-top:22px）、V1フォーム送信ボタンUX改善・V2モバイルドロップダウン最適化（フォント拡大・パディング増加）、V3 Amazonセクション診断前配置（販売機会向上）、V4コンテンツ間隔調整（.card margin-bottom:20px）、V5モバイル視覚強調（.tab :first-child でプライマリ化・期間選択ボタン min-height:72px flex化・診断ボタン目立つ背景色）、モバイルメディアクエリ強化（@media 640px以上でタブ調整、480px以下で最適化）
- v1.6.0 (2026-06-20): M2 ラベルfor属性追加（全入力フィールドとlabelを関連付け・アクセシビリティ改善）、aria-describedby IDミスマッチ修正、年収タブ空状態UX追加（職種未選択時の誘導メッセージ）、GSC対応meta description強化・WebApplicationスキーマにfeatureList/keywords追加
- v1.4.0 (2026-06-20): M2 フォームUX強化（blur/changeイベントでリアルタイムバリデーション追加）、V1 セレクト/インプット枠線コントラスト改善（2px #94a3b8）、V2 モバイル用スティッキーCTAボタン追加、V3 パネル上余白拡大でナビとフォームの視覚的分離を改善
- v1.3.0 (2026-06-19): M4 Chart.js互換ミニ実装（new Chart() API・外部CDN不要）で年収棒グラフ再実装、M10 印刷(window.print)/クリップボードコピー/CSVダウンロード機能追加
- v1.2.0 (2026-06-19): M2 フォームUX改善（tooltip/help-text/aria属性）、M4 Canvas棒グラフ年収可視化、M8 ツールチップ充実、V1-V3 視覚的問題修正

## 使い方

1. ページを開き、入力フォームの項目を確認する
2. 必要な情報を入力または選択する
3. 実行ボタンをクリックして結果を取得する
4. 表示された結果・アドバイスを確認する
5. 必要に応じてコピー・SNSシェアで活用する

## よくある質問（FAQ）

**Q: エンジニア転職ロードマップ｜未経験からIT転職する最短ルートを無料診断は無料で使えますか？**

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

- [転職適性診断](https://appadaycreator.com/job-change-advisor/)
- [年収交渉アドバイス](https://appadaycreator.com/salary-negotiation-advisor/)
- [睡眠の質チェッカー](https://appadaycreator.com/sleep-quality-checker/)

## 変更履歴

### v1.1.0（2026-05-29）
- GTMスクリプト重複を削除（ページ読み込み高速化・アナリティクス精度向上）
- スキップリンク `#main` の参照先 `id="main"` を追加（WCAG 2.4.1 準拠）
- PWA manifest.json の `background_color` を `#1e3a5f` に変更（白いフラッシュ防止）
- Amazonアフィリエイトボタン重複を削除
- 「準備中」エージェントボタンをAmazon書籍リンクに変更
- 診断結果生成後にX・LINEシェアボタンを追加
- 関連サービスをキャリア・転職関連サービスに統一

## テスト

| ファイル | フレームワーク | 概要 |
|---------|--------------|------|
| `tests/e2e/` | Playwright | 本番URL対象E2E（Jest対象外） |

## デプロイ

GitHub Pages（mainブランチ push → 自動デプロイ）

## ライセンス

MIT License
