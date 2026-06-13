# 機能仕様

## v1.3 - 2026年6月13日

### 改善
- **M2【満足】コア機能のUX改善**: 記録フォーム・製品フォームに入力バリデーション属性（required、maxlength、aria-required）を追加。フォーム検証エラーメッセージの表示領域を実装。select要素にプレースホルダオプション「選択してください」を追加
- **M8【満足】ツールチップ・入力ガイダンス充実**: 全入力フォーム（記録・製品・分析期間・目標スライダー）に title 属性によるツールチップを追加。各フォーム要素に aria-label を追加しアクセシビリティを向上。小さい説明文（small）の内容を拡充し、ユーザーが迷わない詳細なガイダンスを提供

## v1.2 - 2026年6月5日

### 改善
- **PWA theme-color ダークモード対応（即座反映版）**: `js/theme-color-updater.js` を改善し、DOMContentLoaded を待たず即座に実行。prefers-color-scheme を検出し、ダーク時は `#6d28d9`、ライト時は `#8b5cf6` に動的に設定。OSのダークモード切り替え時もリアルタイムで反応。

## v1.1 - 2026年5月31日

### バグ修正
- **PWA theme-color統一**: lp.html / how-to-use.html / offline.html に `#8B5CF6` を追加
- **XSS脆弱性修正**: 製品リスト表示を innerHTML から DOM API (textContent) に変更
- **記録フォームの写真連動**: record-form 送信時に photo input を handlePhotoUpload に渡す
- **チェックボックス重複記録防止**: 朝晩チェックボックスが同日に重複レコードを作らないよう修正
- **モバイルナビの初期アクティブ状態**: initApp 内で navigateTo('dashboard') を呼ぶように修正

### 機能追加
- **分析画面の記録履歴リスト**: updateAnalysis に履歴描画ロジックを追加。削除ボタンも実装
- **肌状態入力のスライダー化**: input[type=range] + リアルタイム数値表示（例: "7 / 10"）

## データ管理

- 認証不要のローカルモード。データは localStorage に保存（skincare_records / skincare_products / skincare_photos）
- 端末・ブラウザをまたいだデータ引き継ぎ不可

## 認証（旧仕様・廃止済み）

- ~~Supabase を利用したメール/パスワード認証~~ → ローカルモードに移行

最終更新日: 2026年5月31日
