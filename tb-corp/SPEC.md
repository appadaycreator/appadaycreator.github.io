# 株式会社Tech&Brace コーポレートサイト仕様書

## バージョン履歴

### v2.5 (2026-06-20)
**深層品質レビュー: V1タイピングカーソル・V2セカンダリCTA・V3補足テキスト視認性改善**

#### 実装内容

**V1【タイピングカーソル形状の改善】**
- CSSの `border-right: 3px solid` によるカーソルを廃止 → ブラウザのテキスト入力カーソルと同一形状で「ページが編集モード」に見える問題を解消
- `::after` 疑似要素で `▋`（ブロックカーソル）を表示 → ターミナル/コードエディタ風で意図的な演出と明確に認識される
- `cursor-pause` 状態では `display: none` でブロックカーソルを非表示（停止中は明確にカーソルなし）

**V2【セカンダリCTA視認性の改善】**
- 「料金プランを見る」ボタンに `background: rgba(255,255,255,0.9)` を追加 → 透明背景からオフホワイト背景に変更し「ボタン」と明確に認識される
- ホバー色を `rgba(124,58,237,0.1)` に強調（従来 0.06）

**V3【CTA補足テキスト視認性の改善】**
- `color: #6b7280` → `#374151` に変更（コントラスト向上）
- `font-size: 0.85rem` → `0.92rem` に拡大
- `font-weight: 500` を追加
- 各項目に `✓` チェックマークを付加し重要情報として強調

### v2.4 (2026-06-19)
**深層品質レビュー: ヒーロービジュアル・CTA・タイピングカーソル改善**

#### 実装内容

**V3【タイピングカーソル問題の修正】**
- ページ読み込み直後に空欄+カーソルが先行表示される問題を解消
- `typing-cursor` クラスをHTMLから除去、JS でタイピング開始時に動的付与
- テキスト入力完了後の1.5秒停止中は `cursor-pause` クラスでカーソルを非表示
- 消去開始時にカーソルを復元するサイクル制御を実装

**V2【ヒーローCTAの強化】**
- 「お問い合わせ」→「今すぐ無料相談する →」へ文言強化（行動語・緊急性）
- フォントサイズ拡大（1.1rem）・パディング拡大（1rem 2.5rem）・太字化
- セカンダリCTA「料金プランを見る」を横並びで追加（plan.html へのリンク）
- 「初回相談無料 · 全国リモート対応 · お見積り無料」の安心文言を追加

**V1【ヒーロー背景のビジュアルインパクト向上】**
- 右上・左下・左中に3つのグラデーションオーブを配置
- `pointer-events:none` でユーザー操作に影響なし
- 既存カラー（purple/pink/lavender）を維持し一体感を保持

### v2.3 (2026-06-13)
**フェーズ2施策完成：M8 ツールチップ・入力ガイダンス充実 全フォーム一括実装**
- 全4フォーム項目のツールチップを tooltip-icon クラスで統一実装
- CSS ::after / ::before 疑似要素による hover時ツールチップ表示
- data-tooltip属性で各フィールドの入力例・形式ガイダンスを提供
- 会社名・お問い合わせ内容フィールドのツールチップを改善

### v2.2 (2026-06-13)
**フェーズ2施策実装：M4, M8, M10**

#### 実装施策

**M4【グラフ・スコア・ゲージで結果を可視化】**
- Stats Section にChart.js を組み込み
- サービス別プロジェクト分布（ドーナツグラフ）を表示
- 年別実績推移（横棒グラフ）を表示
- CDN: Chart.js v3 を追加

**M8【ツールチップ・入力ガイダンス充実】**
- フォーム全4項目に title 属性を追加
- 各ラベルに「?」アイコン＋ツールチップを実装
- ツールチップで具体的な入力例・形式を案内
- ホバー時に詳細ガイダンスが表示される仕様

**M10【印刷・結果エクスポート機能】**
- フォーム送信後の成功メッセージに「印刷」ボタンを追加
- 「データ保存」ボタンを実装（CSVダウンロード対応）
- クリップボード機能（tbSafeCp）を活用したテキストコピー機能も併装
- 印刷時には header, footer, ボタンなど不要な要素は非表示

#### ファイル変更
- `index.html`: 
  - Chart.js CDN 追加（head）
  - フォーム項目に title 属性 + ツールチップアイコン追加
  - Stats Section 拡張（グラフキャンバス追加）
  - JavaScript 関数追加：`toggleFAQ()`, `exportContactData()`
  - Chart.js 初期化コード追加

---

### v2.1 (2026-06-10)
**コンタクトフォーム UX 改善**

#### 新機能: フォーム入力補助とバリデーション
- **M2実装**: 4つのフォーム項目（名前、メール、会社名、メッセージ）にplaceholder追加
  - 名前: placeholder="山田太郎"、ガイダンステキスト「フルネームでお願いします」
  - メール: placeholder="example@example.com"、ガイダンステキスト「返信用メールアドレス」
  - 会社名: placeholder="〇〇株式会社"、ガイダンステキスト「貴社名（任意）」
  - メッセージ: placeholder="例：Web制作について相談したいです"、ガイダンステキスト「お問い合わせ内容をお聞きします」

- **M8実装**: フォームバリデーション＆エラーメッセージ
  - 名前の入力チェック（空白判定）
  - メールアドレスの形式チェック（簡易正規表現による検証）
  - メッセージの入力チェック（空白判定）
  - エラー時に各フィールドの上に赤色のエラーメッセージを表示
  - 送信前バリデーション：不正な入力があれば送信を実行しない

- **ファイル変更**:
  - `index.html`: contact form の placeholder・ガイダンステキスト追加、バリデーション関数追加

#### 実装詳細

**新バリデーション関数**:
```javascript
function validateContactForm(form) {
    // 名前・メール・メッセージの入力チェック
    // メールアドレス形式チェック（/^[^\s@]+@[^\s@]+\.[^\s@]+$/）
    // エラー時に各フィールドの上に赤色メッセージを表示
    // 1つ以上エラーがあれば false を返す
}
```

---

### v2.0 (2026-06-05)
**SNSシェアボタン機能を追加**

#### 新機能: SNSシェア機能
- **対象セクション**:
  1. Latest News セクション（各記事カード下）
  2. ページ全体用シェアセクション（Footer前）

- **対応SNS**:
  - Twitter
  - Facebook
  - LINE
  - LinkedIn（ページ全体用のみ）

- **実装内容**:
  - ニュース記事カードに「シェア」ボタン 3 個（Twitter / Facebook / LINE）
  - ページ全体シェアセクションに 4 つのボタン
  - `shareNews(title, platform)` JavaScript 関数で各 SNS へのリンク生成
  - window.open() でシェアポップアップを開く
  - URL とテキストを encodeURIComponent() でエンコード

- **スタイル**:
  - アイコン付きボタン
  - ホバー時にプラットフォームカラーに変更
  - 既存デザインシステムに統合

- **ファイル変更**:
  - `index.html`: SNSシェア機能追加

#### 実装詳細

**JavaScriptコード**:
```javascript
function shareNews(title, platform) {
    const url = window.location.href;
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    
    const shareUrls = {
        'twitter': `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
        'facebook': `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        'line': `https://social-plugins.line.me/web/share?url=${encodedUrl}&text=${encodedTitle}`,
        'linkedin': `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
    };
    
    if (shareUrls[platform]) {
        window.open(shareUrls[platform], 'share', 'width=600,height=400');
    }
}
```

---

### v1.0 (2026-05-23)
**初期版リリース**
- トップページ、サービス紹介、会社概要、採用情報等の各ページ実装
- Tailwind CSS によるレスポンシブデザイン
- お問い合わせフォーム（Formspree）
- Schema.org マークアップ対応
