# 株式会社Tech&Brace コーポレートサイト仕様書

## バージョン履歴

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
