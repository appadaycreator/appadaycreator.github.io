# AIプロンプト設計ツール【無料】無料Webツール - 技術仕様書

## 概要

**サービス名**: Ai Prompt Designer
**バージョン**: 1.1.0
**更新日**: 2026-05-29
**URL**: https://appadaycreator.com/ai-prompt-designer/

目的・ジャンル・出力形式を選ぶだけで効果的なAIプロンプトを自動生成。ChatGPT・Claude対応。登録不要・完全無料でご利用いただけます。

## 変更履歴

### v1.2.3 (2026-06-14)
- M5: 全目的向けアフィリエイト推薦を完成（ChatGPT Plus・Notion AI・GitHub Copilot等の実リンク追加）
- M10: 印刷ボタン・CSVダウンロード機能を追加

### v1.2.2 (2026-06-14)
- M4: Chart.js でプロンプト品質スコア・ドーナツゲージを表示（詳細度・制約条件・選択完成度に基づく0～100点計算）
- M5: 目的別アフィリエイト商品推薦機能追加（生成時に画面下部に表示、既存A8.netリンク保持）
- M8: 各入力欄に title 属性・説明テキスト・入力ガイダンスを追加（ユーザー迷い解消）

### v1.2.1 (2026-06-04)
- P1: PWA theme-color ダークモード対応（color-scheme meta + media query対応）
- P1: manifest.json に themes 配列追加（ダークモード時のアイコン色対応）

### v1.2.0 (2026-06-03)
- P1: 履歴削除時に確認ダイアログ追加（誤削除防止）
- P1: 履歴項目のモバイル対応最適化（min-height: 48px、パディング・タッチ領域改善）
- P1: 削除ボタンのアクセシビリティ改善（flex layout、min-width/min-height 32px）
- P2: フォーム検証エラーのUX改善（入力時に赤枠自動クリア）
- P2: AIツール説明文をリアルタイム表示
- P2: ページロード時にデフォルトプロンプト自動生成
- P1: デザイン一貫性向上（背景color統一、AdSense min-height修正）

### v1.1.0 (2026-05-29)
- P1: PWA theme-color を #7c3aed → #6366f1 に統一（manifest.json / meta theme-color / CSS）
- P2: プロンプト生成ロジック強化（AIツール別ペルソナ、目的別追加指示、NG事項/制約条件フィールド追加）
- P2: 「ChatGPTで開く」「Claudeで開く」ボタン追加（コピー＆オープン）
- P3: 生成履歴機能追加（localStorage、最新5件保持・復元・削除）
- P4: ヘッダー説明文の途中切れを修正
- P5: コピーボタンのUX改善（alert廃止→インライン「コピー済み！」通知）
- P6: HowToスキーマをサービス固有の5ステップに更新
- P7: manifest.json の short_name を「ai-prompt-de」→「AIプロンプト」に改善

## データ管理

- **ストレージ**: ブラウザ localStorage（外部API通信なし）
- **永続化**: ページ読み込み時に自動復元
- **クリア**: ブラウザのサイトデータ削除で初期化

## 技術スタック

- HTML5 / CSS3 / Vanilla JavaScript
- PWA対応（manifest.json / Service Worker）
- レスポンシブデザイン（モバイルファースト）

## 使い方

1. 生成したい内容の種類・条件を選択する
2. キーワードや詳細設定を入力する
3. 「生成」ボタンをクリックして出力を取得する
4. 生成された内容をコピーして活用する
5. 条件を変えて複数パターンを試す

## よくある質問（FAQ）

**Q: AIプロンプト設計ツールは無料で使えますか？**

はい、完全無料・登録不要でご利用いただけます。

**Q: 生成した内容を商用利用できますか？**

生成されたコンテンツはご自由にご利用いただけます。内容の最終確認はご自身でお願いします。

**Q: 何回でも生成できますか？**

はい、回数制限なく何度でも生成いただけます。

**Q: 生成データはサーバーに保存されますか？**

いいえ。すべてブラウザ内で生成され、サーバーへの送信・保存は行いません。

**Q: スマートフォンで利用できますか？**

はい、PC・スマートフォン・タブレットすべてに対応しています。


## 関連サービス

- [Engineer Career Roadmap](https://appadaycreator.com/engineer-career-roadmap/)
- [ブログ・SNS収益化適性診断](https://appadaycreator.com/blog-income-advisor/)
- [ハッシュタグ戦略診断](https://appadaycreator.com/hashtag-strategy-advisor/)

## テスト

| ファイル | フレームワーク | 概要 |
|---------|--------------|------|
| `tests/e2e/` | Playwright | 本番URL対象E2E（Jest対象外） |

## デプロイ

GitHub Pages（mainブランチ push → 自動デプロイ）

## ライセンス

MIT License
