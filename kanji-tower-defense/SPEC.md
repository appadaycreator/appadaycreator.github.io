# 漢字タワーディフェンス【無料】漢字の読みで城を守る学習ゲーム - 技術仕様書

## 概要

**サービス名**: Kanji Tower Defense
**バージョン**: 1.8.7
**更新日**: 2026-06-08
**URL**: https://appadaycreator.com/kanji-tower-defense/

漢字の読み・書きでタワーを強化して敵を撃退するゲーム。楽しく漢字を学べる無料の教育タワーディフェンスゲーム。

## 変更履歴

### v1.8.8 (2026-06-10)
- feature: プレイ履歴テーブル表示（直近10プレイを「プレイ履歴・ベストスコア」パネルに追加、リピート利用促進）
- feature: 結果シェア機能の拡張（X/LINE/クリップボードコピーを個別対応、X→Twitter Intent URL、LINE→LINE Share URL）
- feature: OGタグ完全実装（og:title/description/url/image、twitter:card、SNSシェア時の見栄え向上）
- improve: updateHistoryDisplay()関数で履歴を日時順・スコア順でソート表示（ローカルストレージ自動復元）

### v1.8.7 (2026-06-08)
- feature: HowToスキーマ追加（「漢字タワーディフェンスの遊び方」で5ステップの構造化データ表示、SEO向上）
- feature: 初回プレイヤー向けオンボーディングモーダル追加（4ステップのウェルカムガイド、ユーザー継続向上）
- feature: ゲーム実績バッジシステム追加（ノーミス達成・コンボマスター・波状防衛・塔の達人・スピードラン の5種類、達成感向上）
- improve: SNS結果シェア後に3秒で自動リスタート（リピートプレイ促進）

### v1.8.6 (2026-06-06)
- improve: 敵スポーン頻度を wave に基づいて段階的に調整（wave 1-3: 2秒 → wave 4-5: 1.5秒 → wave 6-10: 1秒 → wave 11+: 0.75秒）
- improve: 敵数上限を wave に応じて段階的に増加（wave 1-5: 3体 → wave 6-10: 4体 → wave 11+: 5体）
- feature: ゲーム中に「💰 次のタワー: 50G」というアナウンスを Canvas 右下に表示（ゴールド状態を視覚化）
- feature: 敵が右側 30% エリアに侵入時に「⚠️ 敵が近い！」バナーを点滅表示
- improve: ゲームオーバー後の「もう一度プレイ」ボタンをクリック後、0.3 秒で自動的にゲームを再開（リプレイ流れを高速化）
- improve: モーダル内のボタンをフルウィドスに変更し、視認性を向上
- improve: ウェーブ間隔を 30 秒 → 20 秒に短縮（ゲームテンポを向上）
- improve: wave >= 10 での敵スピード上昇（+0.15x）を追加（中盤以降の難度調整）

### v1.8.5 (2026-06-05)
- fix: PWA theme-color デフォルトメタタグ追加（media属性なし）→ 旧ブラウザ・デバイスで theme-color 機能が確実に動作するように対応
- fix: JSON-LD dateModified を 2026-06-05 に更新（v1.8.5リリース日に合わせ）

### v1.8.4 (2026-06-04)
- fix: レベル選択ボタン（小学1年生～難読）に aria-label を追加（9ボタン: アクセシビリティ向上）
- fix: manifest.json に prefer_color_scheme フィールド追加（PWA theme-color デフォルト色対応）

### v1.8.3 (2026-06-04)

### v1.8.2 (2026-06-04)
- fix: ボタン aria-label 未設定を修正（7ボタン: リセット, 攻撃, スキップ, 再スタート, 速度切替×3 に aria-label 追加）
- improve: アクセシビリティ向上（スクリーンリーダー対応強化）

### v1.8.1 (2026-06-02)
- fix: PWA theme-color を背景色 #667eea に統一（ステータスバー・アドレスバー色がゲーム画面と調和）
- improve: Canvas レスポンシブ高さ計算を 3:4 アスペクト比で統一（小画面での見栄え向上）
- improve: 超小型画面（360px以下）向けメディアクエリ追加（パディング削減・レイアウト最適化）
- improve: Canvas パディング計算を動的に（画面幅に応じて 16px ～ 40px で調整）
- improve: 480px以下向けメディアクエリ追加（タイトル・ボタン・テキストサイズ最適化）

### v1.8.0 (2026-05-31)
- fix: `window.toggleMute` がwindowエクスポートから欠落していたバグ修正（ミュートボタン完全機能不全を解消）
- fix: JSON-LDのdateModifiedをv1.7.0更新日（2026-05-31）に更新
- feat: ウェーブ進行プログレスバー追加（次のウェーブまでの残り秒数・バーで可視化）
- feat: タワーアップグレード機能追加（既存タワーをクリック/タップでLv1→Lv2(75G)→Lv3(150G)強化、攻撃力・射程UP）
- improve: words.js grade1/grade2 の meaning を英語→日本語に変更（FAQの「日本語の意味が常時表示」と整合）

### v1.7.0 (2026-05-31)
- fix: 一時停止ボタンのテキストが状態変化しないバグ修正（⏸️ 一時停止 ↔ ▶️ 再開 の動的更新）
- fix: 城HPがマイナス表示になる問題を修正（Math.max(0, castleHP) でクランプ）
- fix: モバイルキャンバスのタッチ未対応を修正（touchstart/touchmove/touchend イベント追加でタワー設置とホバープレビューに対応）
- fix: keypress（廃止予定）→ keydown に変更 + event.isComposing チェックでIME変換確定時の誤攻撃を防止
- improve: ゲームプレイ中の難易度変更をガード（リセット後に変更するよう案内）
- improve: 次の敵プレビューの視認性向上（濃い背景色・白テキスト・太字に変更）

### v1.6.0 (2026-05-30)
- fix: PWA theme-colorにmedia属性なしフォールバック追加（旧ブラウザ対応）
- fix: Service Workerキャッシュバージョンをv1.4.0→v1.6.0に更新・icon.svgをキャッシュ対象に追加
- fix: skipKanji()後にkanjiInfo（意味表示）が更新されないバグ修正
- fix: pulse @keyframes未定義で新記録バッジが静止していた問題を修正
- fix: Q&A「英語の意味」→「日本語の意味」に誤情報を修正
- feat: ウェルカム画面にベストスコア表示（リピートユーザーのモチベーション向上）
- feat: タワー設置ホバープレビュー（ゴールド不足時は赤・十分な場合は黄色のゴースト表示）
- feat: ミュートボタン追加（🔊/🔇 切替・localStorage保存）

### v1.5.0 (2026-05-30)
- feat: Service Worker実装によるPWAオフライン対応（sw.js作成・キャッシュ戦略追加）
- feat: manifest.json にSVGアイコン（any maskable）・categories・shortcutsフィールド追加
- improve: theme-color にダークモード対応（media属性で light/dark 使い分け）
- improve: Canvasに `role="img"` `aria-label` 追加（アクセシビリティ向上）
- improve: ゲームオーバーモーダルに `role="dialog"` `aria-modal` `aria-labelledby` 追加
- improve: ゲーム統計パネルに `aria-live="polite"` 追加（スクリーンリーダー対応）
- improve: 難易度ボタンに `aria-pressed` 追加・setLevel時に動的更新
- fix: JSON-LDのdateModifiedを2026-05-30に更新
- improve: shareResult の共有テキストに難易度・ハッシュタグ `#漢字タワーディフェンス` 追加

### v1.4.0 (2026-05-30)
- fix: ux-behaviorスクリプトがゲームボタンを一時的に無効化するバグ修正（`:not([onclick])`追加）
- fix: PWA manifest.json の background_color を #ffffff → #667eea（実際のゲーム背景色に統一）
- feat: Web Audio API による効果音追加（正解・不正解・タワー設置・ウェーブ開始）
- feat: ゲーム開始前のキャンバスにウェルカム画面（操作ガイド・パルスアニメーション）追加
- improve: ゲームプレイ中に漢字の意味（meaning）をkanjiInfoエリアに常時表示
- improve: スコア・ゴールドの表示にカンマ区切り（toLocaleString）を適用
- fix: 汎用「使い方」セクションをゲーム固有の操作説明に修正

### v1.3.0 (2026-05-29)
- fix: SNSシェアリンクのテキスト「元素記号で城を守る」→「漢字で城を守る」に修正
- fix: 弾がターゲットの初期位置にのみ向かうバグ修正（リアルタイム追跡に変更）
- fix: 敵速度の上限設定（wave無制限増加 → max 3.5倍）
- feat: スキップ機能追加（20G消費で別の漢字に変更・間違いノートに追加）
- feat: 次の敵プレビュー表示追加（2体目の敵がいる場合に漢字を予告）
- improve: 漢字入力フィールドに`inputmode="hiragana"`等IME最適化属性を追加
- improve: kanjiInfoの英語mixing表示を日本語のみに変更
- improve: ヒント表示にmeaningを追加
- fix: ゲームオーバーモーダルにmax-height・overflow-y:autoを追加（大量ミス時の画面溢れ防止）
- fix: WebPageスキーマのdateModifiedを2026-05-29に更新
- fix: 学年別漢字一覧（3年・4年）の重複データを正しい漢字に修正
- refactor: HTMLのダミー関数（calcValuektd0等）を削除

### v1.2.0 (2026-05-29)
- feat: コンボシステム追加（3連続正解でボーナスポイント・ゴールド）
- feat: ゲーム速度調整ボタン追加（×1 / ×1.5 / ×2）
- feat: 間違いノート機能追加（ゲームオーバー時に不正解漢字を一覧表示）
- feat: ウェーブクリアボーナス（ウェーブ進行時に城HP+10回復）
- fix: `updateEnemies()` の `forEach`内`splice`バグをSet方式に修正（インデックスずれ解消）
- fix: `updateBullets()` の `forEach`内`splice`バグを同様に修正
- fix: `updateParticles()` をfilter方式に変更
- improve: ヒントを「文字数＋最初の文字」表示に改善（実用的なヒントへ）
- improve: キャンバス左下にタワー設置ガイド常時表示
- improve: 速度設定をlocalStorageに保存・復元
- improve: usage.htmlの誤った「苦手漢字リスト」記述を実際の仕様に修正

### v1.1.0 (2026-05-29)
- fix: `updatePathForSize` 累積スケールバグ修正（originalPathを保存しリサイズ時に元座標から再計算）
- fix: `showMessage` タイマー重複による早期消去バグ修正（clearTimeout追加）
- fix: タイトル・OG・Twitter・manifest・SPEC の「元素記号」誤ったキーワードを修正
- fix: `manifest.json` の `short_name` が切れていた問題を修正
- fix: `<head>` 内の壊れたfaviconタグ残骸を削除
- fix: スキップリンクのターゲット `id="main"` を game-container に追加
- fix: FAQ/Q&A の未実装機能（復習モード・用例・成り立ち）の虚偽記述を修正
- fix: HowToスキーマをゲームの実際の手順に修正
- fix: FAQPageスキーマのテンプレートQAをゲーム固有の内容に修正
- style: `.game-title` の無効な `text-shadow` を削除（`-webkit-text-fill-color:transparent` と競合）
- style: `message-display.info` CSSスタイル追加（青色表示）
- refactor: 空の `.settings-panel` divを削除

## データ管理

- **ストレージ**: ブラウザ localStorage（外部API通信なし）
- **永続化**: ページ読み込み時に自動復元
- **クリア**: ブラウザのサイトデータ削除で初期化

## 技術スタック

- HTML5 / CSS3 / Vanilla JavaScript
- PWA対応（manifest.json / Service Worker）
- レスポンシブデザイン（モバイルファースト）

## 使い方

1. 難易度（小学1年生〜難読）を選択する
2. 「ゲーム開始」ボタンを押してゲームをスタートする
3. 画面に表示される漢字の読みをひらがなで入力して「攻撃」またはEnterキーを押す
4. ゴールドを貯めてキャンバスをクリックしタワーを設置して防衛を強化する
5. ゲーム終了後に結果をSNSシェアして漢字力をアピールする

## よくある質問（FAQ）

**Q: 漢字タワーディフェンスは無料で使えますか？**

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
