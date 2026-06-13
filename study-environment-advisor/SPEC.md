# 勉強・集中環境診断【無料】無料診断・アドバイス - 技術仕様書

## 概要

**サービス名**: Study Environment Advisor
**バージョン**: 1.3.0
**更新日**: 2026-06-11
**URL**: https://appadaycreator.com/study-environment-advisor/

学習スタイル・集中できる時間帯・環境の悩みから最適な勉強環境（場所・道具・時間帯）を診断。登録不要・完全無料でご利用いただけます。

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

## 変更履歴

### v1.4.0 (2026-06-14)
- **追加**: [M1] 診断/計算後の文脈CTAボタン設置 - 診断結果直後にタイプ別のおすすめ商品（A8.netアフィリエイトリンク）を自然な流れで配置
- **改善**: 結果表示セクションに「診断結果に基づくおすすめ商品」コンテーナを追加（`result-cta-products`）
- **追加**: showCtaProducts() 関数 - typeIndex に応じた4パターンの商品リンクを動的に表示
- **改善**: restoreHistory() に CTA 商品表示機能を統合 - 過去の診断結果を復元時も商品推奨を表示
- **改善**: CTA_PRODUCTS データ構造 - 各タイプに2つの推奨商品を配置（自宅静寂/カフェ/早朝/BGM環境）

### v1.3.0 (2026-06-11)
- **改善**: [M16] PWA化完成 - manifest.json を HTML に リンク（`<link rel="manifest">`）
- **追加**: Service Worker (sw.js) 実装 - キャッシング戦略（キャッシュ優先 + ネットワークフォールバック）
- **追加**: beforeinstallprompt イベント処理 - インストール促進UI対応
- **改善**: manifest.json に詳細メタデータを追加（日本語name、description、categories、screenshots、shortcuts）
- **追加**: Apple モバイル Web App メタタグ（apple-mobile-web-app-capable、status-bar-style、title）

### v1.2.2 (2026-06-04)
- **バグ修正**: PWA theme-color デフォルト色（フォールバック）を追加（メディアクエリ非対応ブラウザ対応）

### v1.2.1 (2026-06-03)
- **改善**: PWA theme-color にダークモード対応を追加（light: #6366F1、dark: #4F46E5）
- **改善**: HTML meta タグで `media="(prefers-color-scheme: light|dark)"` を指定

### v1.2.0 (2026-06-03)
- **バグ修正**: JavaScript 関数重複定義を削除（getResult/renderQ/answer/showResult）
- **改善**: PWA theme-color を #7c3aed → #6366F1 に統一（ブランドカラー一貫性）
- **改善**: Footer 背景色追加（可視性向上）
- **改善**: Meta `theme-color` タグ追加（ブラウザUI色指定）
- **改善**: OG Image をサービス専用デザインに変更（1200x630px、PNG）
- **改善**: `og:image` メタデータに幅・高さ属性追加
- **改善**: Input 要素フォントサイズを 15px → 16px に変更（iOS オートズーム防止）
- **改善**: Input・Select・Textarea に `touch-action: manipulation` 追加（タッチ遅延排除）
- **改善**: Organization structured data を追加（SEO強化）
- **リファクタリング**: 質問選択肢を `<button>` → `<fieldset>/<legend>/<input type="radio">` に変更（セマンティックHTML化・アクセシビリティ向上）
- **改善**: Footer opacity を 0.75 → 0.95 に上げて視認性向上

### v1.1.0 (2026-05-29)
- **バグ修正**: JS重複定義（const BTN / 全関数）による診断完全動作不能を修正
- **バグ修正**: ヘッダー・カード内の説明文が途切れていた問題を修正
- **機能追加**: 診断結果に環境整備チェックリスト（4項目）を追加
- **機能追加**: 今日からできるアクション（3ステップ）を追加
- **機能追加**: Q5（予算）回答に応じた予算別おすすめアドバイスを追加
- **機能追加**: 診断結果に動的SNSシェアボタン（X・LINE）を追加（結果タイプ名入り）
- **機能追加**: Amazonアフィリエイトリンク付きおすすめアイテムを追加（各タイプ2件）
- **機能追加**: 前の質問に戻るボタンを追加（Q2以降）
- **改善**: もう一度診断でページリロードせず状態リセットに変更

## よくある質問（FAQ）

**Q: 勉強・集中環境診断は無料で使えますか？**

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

- [学習スタイル診断](https://appadaycreator.com/study-method-advisor/)
- [勉強タイマー・集中記録アプリ](https://appadaycreator.com/study-timer-app/)
- [オンライン学習費用診断](https://appadaycreator.com/online-learning-advisor/)

## テスト

| ファイル | フレームワーク | 概要 |
|---------|--------------|------|
| `tests/e2e/` | Playwright | 本番URL対象E2E（Jest対象外） |

## デプロイ

GitHub Pages（mainブランチ push → 自動デプロイ）

## ライセンス

MIT License
