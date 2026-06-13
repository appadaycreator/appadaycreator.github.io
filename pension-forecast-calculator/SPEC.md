# 年金受取額予測計算ツール【無料】簡単・無料計算 - 技術仕様書

## 概要

**サービス名**: Pension Forecast Calculator
**バージョン**: 1.3.0
**更新日**: 2026-06-13
**URL**: https://appadaycreator.com/pension-forecast-calculator/

年齢・加入期間・平均給与から将来の年金受取額を予測。老後計画の参考に。登録不要・完全無料でご利用いただけます。

## 実装履歴

- v1.5.0 (2026-06-13): M2 加入年数クロスバリデーション追加（年齢連動上限チェック）・ヒントテキスト動的更新・FAQ2件追加（加入期間10年未満・会社員→自営業転向）・JSON-LD FAQスキーマを2→5問に拡充
- v1.4.0 (2026-06-13): M2 スライダー現在値バッジ追加・再計算催促通知・月収目安動的表示
- v1.3.0 (2026-06-13): M2 UX強化追加（受給開始年齢バリデーション・aria整合性改善・加入期間スライダー最大値動的更新）
- v1.2.0 (2026-06-13): M2 入力UX強化（aria-required/aria-invalid/aria-describedby追加・ボタンdisable CSS・FAQ3件追加）
- v1.1.0 (2026-06-12): M10 印刷・結果エクスポート機能追加（window.print・クリップボードコピー・CSVダウンロード）

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

## よくある質問（FAQ）

**Q: 年金受取額予測計算ツールは無料で使えますか？**

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

- [老後資金シミュレーター](https://appadaycreator.github.io/retirement-fund-simulator/)
- [Lifeplan Simulator](https://appadaycreator.github.io/lifeplan-simulator/)
- [Nisa Ideco Simulator](https://appadaycreator.github.io/nisa-ideco-simulator/)

## テスト

| ファイル | フレームワーク | 概要 |
|---------|--------------|------|
| `tests/e2e/` | Playwright | 本番URL対象E2E（Jest対象外） |

## デプロイ

GitHub Pages（mainブランチ push → 自動デプロイ）

## ライセンス

MIT License
