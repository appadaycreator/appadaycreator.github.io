# 子供の習い事費用シミュレーター｜月謝・年間費用を簡単計算 - 技術仕様書

## 概要

**サービス名**: Kids Activity Cost Simulator
**バージョン**: 2.0.1
**更新日**: 2026-06-13
**URL**: https://appadaycreator.com/kids-activity-cost-simulator/

子供の習い事にかかる費用を年齢・習い事の種類別に無料シミュレーション。月謝・入会金・年間費用の相場を一覧比較。複数の習い事を組み合わせた合計費用も計算できます。

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

**Q: 子供の習い事費用シミュレーター｜月謝・年間費用を簡単計算は無料で使えますか？**

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

- [子ども習い事診断](https://appadaycreator.com/kids-activity-finder/)
- [Child Allowance Calculator](https://appadaycreator.com/child-allowance-calculator/)
- [Kindergarten Advisor](https://appadaycreator.com/kindergarten-advisor/)

## テスト

| ファイル | フレームワーク | 概要 |
|---------|--------------|------|
| `tests/e2e/` | Playwright | 本番URL対象E2E（Jest対象外） |

## デプロイ

GitHub Pages（mainブランチ push → 自動デプロイ）

## 変更履歴

### v2.1.3 (2026-06-14) [M2: コア機能のUX改善 - 数値入力フィールド実装]
- M2: 入力フォームのUX改善実装
  - STEP 1（年齢選択）にnumber入力フィールドを追加、スライダーとの2way同期実装
    - syncAgeInput() 関数を実装、年齢スライダーとnumber入力の双方向同期
    - 年齢入力フィールド（0〜18）横並び表示、スライダーと同時更新
  - STEP 2（月間予算設定）にnumber入力フィールドを追加、スライダーとの2way同期実装
    - syncBudgetInput() 関数を実装、予算スライダーとnumber入力の双方向同期
    - 予算入力フィールド（¥5,000〜¥100,000、5000円刻み）横並び表示
    - number入力値を自動的に5000円の倍数に調整（Math.round(val / 5000) * 5000）
  - STEP 4（継続年数設定）にnumber入力フィールドを追加、スライダーとの2way同期実装
    - syncYearsInput() 関数を実装、年数スライダーとnumber入力の双方向同期
    - 継続年数入力フィールド（1〜10年）横並び表示
  - CSS focus-visible スタイルで、入力フィールドフォーカス時に紫のボーダー＋影を表示
  - アクセシビリティ: 各入力フィールドにaria-label属性を追加、スクリーンリーダー対応

### v2.1.2 (2026-06-14) [M2: コア機能のUX改善 - 入力UI・バリデーション実装完結]
- M2: 入力フォームへのplaceholder/ラベル追加・バリデーション・エラーメッセージ実装完結
  - STEP 1（年齢選択）に「お子様の年齢*（必須）」ラベル追加、aria-required/aria-describedby 設定
  - STEP 2（月間予算設定）に「月間予算上限（¥5,000 〜 ¥100,000）」ラベル追加
  - STEP 4（継続年数設定）に「📅 通う予定年数*（必須）」ラベル追加、年数レンジ表示を追加
  - 家計比率入力フィールド（月収入力）の UX 改善
    - validateIncomeInput() 関数実装（100,000〜2,000,000円範囲のバリデーション）
    - income-input にaria-label/aria-describedby/aria-error属性追加
    - エラー表示用の <div id="income-error"> 追加、入力値に応じてリアルタイム表示
    - 入力フォーカス時に視覚的フィードバック（border-color + box-shadow）
    - ヒント表示「5〜10%が目安」を明記
  - validateAgeInput()/validateBudgetInput()/validateYearsInput() 関数実装
    - 各入力値のバリデーション実施、エラーメッセージを aria-alert で表示
    - スライダー変更時にリアルタイムバリデーション、display更新と同時実行
  - エラー表示用の <div id="age-error">, <div id="budget-error">, <div id="years-error"> を各セクションに追加
  - aria-live="polite" をヒント領域に設定し、スクリーンリーダー対応強化
  - 重複していた addEventListener を削除し、oninput ハンドラーに統一
  - 初期化時に validateAgeInput/validateBudgetInput/validateYearsInput を呼び出し、ページロード時にヒント表示
  - CSS で input[type="number"] の focus-visible 状態を実装（border/box-shadowで視覚的フィードバック）

### v2.1.1 (2026-06-13) [M2: コア機能のUX改善 - 入力UI・バリデーション実装]
- M2: 入力フォーム基本実装
  - 各スライダーのバリデーション関数実装
  - エラーメッセージと aria-alert 対応
  - フォーム要素に aria 属性追加

### v2.1.0 (2026-06-09) [improve_auto P2 実装]
- P2-7: 結果のPDF出力機能追加
  - 「📄 PDF」ボタンをボタングリッドに追加（html2pdf.js CDN使用）
  - PDF内容：計算条件・習い事一覧・費用合計・費用内訳を含む
  - ファイル名自動生成（kids-activity-YYYYMMDD.pdf）
- P2-9: メール送信・結果URL共有機能拡張
  - 「📧 メール」ボタン追加 → generateMailLink() で mailto:リンク生成
  - 「🔗 共有」ボタン追加 → copyShareUrl() で結果URLをコピー
  - URL パラメータ（?age=XX&selected=XXX&budget=XXX&years=X）で計算条件を復元
  - loadFromUrl() で URL パラメータから自動復元機能実装
- P2-10: 計算履歴機能（マイページ）実装
  - localStorage["kac_histories"] に最大10件の計算結果を保存
  - saveCalculation() で自動保存（コピー・PDF・URL共有時）
  - 履歴データに日時・年齢・選択習い事・費用合計を記録

### v2.0.0 (2026-06-09) [improve_auto P0・P1 実装]
- P0-1: 習い事・進学塾サービスへのアフィリエイト広告ブロック追加
  - サービスアフィリエイト（Z会・QQ English・TechAcademyジュニア）を新規追加
  - service-affiliate-card セクション実装、習い事カテゴリに基づいてサービスを動的表示
  - affiliates に z_kai, qq_english, tech_academy を追加
- P0-3: 習い事サービス企業への「提携・広告掲載」リンク
  - footer に「👨‍💼 事業者向け」セクション追加、事業者向けお問い合わせメールリンク配置
- P1-6: 構造化データ（Schema.org）の活用強化
  - FAQPage スキーマ拡張：11問 → 16問（オンライン/オフライン費用比較等を追加）
  - HowTo スキーマ拡張：5ステップ → 6ステップに詳細化（年齢選択→予算設定→習い事選択→年数設定→結果確認→シェア）

### v1.9.0 (2026-06-08)
- P0: 習い事診断推奨カード追加（diagnose-cta-card）
- P1: meta description 最適化（「かんたん計算 | 年齢別・相場一覧」）
- P1: 関連ツール拡張（幼稚園選択ガイド追加）
- P1: affiliate オブジェクトに diagnose（習い事診断）を追加

### v1.8.0 (2026-06-07)
- P1: トースト通知機能追加（コピー・削除・警告メッセージを自動表示）
- P1: 推奨習い事カードに薄紫背景を自動付与（年齢マッチ時）
- P1: 推奨バッジに適齢期を追加表示（例: ⭐推奨 (5-12歳)）
- P1: 削除ボタンの色を濃い赤色に変更（#dc2626）して強調
- P1: 合計ボックス内に費用計算式を追加表示（月謝×12月 + 初期費用の分解表示）
- P1: フィルター開閉時にトースト通知を表示して操作感を向上
- P1: フィルター結果0件時のメッセージを赤色で目立たせ、案内文を追加
- P2: アクセシビリティ向上（toast要素に role="polite" aria-atomic="true"）

### v1.7.0 (2026-05-30)
- P1: STEPフロー番号の整理（STEP 1.5 → STEP 2、STEP 2 → STEP 3、STEP 3 → STEP 4）
- P1: ヒーローバッジを「4STEPで計算」に更新
- P1: 月謝比較グラフ追加（SVG横棒グラフ、習い事選択時に自動表示）
- P2: 節約シミュレーター追加（年払い10%・兄弟割5%・公共施設20%のリアルタイム試算）
- P3: 習い事フィルター機能追加（月謝上限・初期費用1万円未満の絞り込み）
- P4: filterStateによるフィルター状態管理を初期化タイミングに適切に配置

### v1.1.0 (2026-05-28)
- P1: サービス専用 manifest.json 作成（theme_color: #667eea）
- P1: theme-color をヒーローグラデーションと統一（#667eea）
- P1: 重複ページローダー削除（#page-loader を除去、#page-loader-kac のみ残す）
- P2: window.onerror 三重定義を1箇所に整理
- P2: Tailwindクラス未定義セクション（利用者の声・関連サービス）をインラインstyleに変換
- P3: ux-behavior でactivity-btn・cat-tab がdisabledになるバグを修正
- P4: シミュレーション結果コピーボタン追加（複数選択時に表示）
- v1.5 (2026-05-28): PWA theme-color修正(#667eea→#6366f1)・重複localStorage削除・ARIA改善

## ライセンス

MIT License
- 2026-05-29: PWA theme-color ブランドカラー統一 (#6366F1→#7c3aed) [improve_auto 横展開]
- 2026-05-29: v1.2.0 P1-P4 改善実装 [improve_auto]
  - P1: UI全体のブランドカラー完全統一(#6366f1→#7c3aed) index.html + サブページ全4ファイル
  - P2: Schema.org dateModified 最新日付に更新(2026-05-23→2026-05-29)
  - P3: アフィリエイトpixel画像のalt属性を適切に設定
  - P4: contact/privacy-policy/terms/usage.html のCSS内#6366f1を#7c3aedに統一
- 2026-05-29: v1.3.0 P1-P4 UX・機能大幅改善 [improve_auto]
  - P1: 年齢連動の推奨バッジ（activities に ageMin/ageMax 追加、renderGrid で ⭐推奨 / グレーアウト表示）
  - P1: 月間予算スライダー追加（¥5,000〜¥100,000、合計月謝との比較を緑/黄/赤でリアルタイム表示）
  - P2: 継続年数スライダー追加（1〜10年）と X年間総費用 計算表示
  - P2: 費用内訳バー追加（月謝/入会金/教材費の割合を3色の横棒グラフで視覚化）
  - P3: 選択状態・年齢・年数・予算を localStorage に保存・ページリロード後も復元
  - P3: 全クリアボタン追加（選択あり時のみ表示）、1件選択時も合計ボックス+コピー・印刷ボタン表示
- 2026-05-29: v1.5.0 P1-P4 機能拡充・UX改善 [improve_auto]
  - P1: 習い事データ18→22種類に拡充（リトミック・バレエ・剣道・幼児体操クラブ追加）
  - P1: カテゴリタブに「⭐ おすすめ」フィルター追加（年齢スライダー連動で年齢適合習い事のみ表示）
  - P1: 習い事グリッドに予算超過インジケーター追加（月謝minが予算超えたらcost-hintが赤・💸表示）
  - P2: 月間予算カードをSTEP2の前（STEP1.5）に移動（年齢→予算→習い事→結果の自然なフロー）
  - P2: 予算カードに「先に予算を設定すると…」の説明文を追加
  - P3: result-cardに「✕ 外す」削除ボタン追加（結果エリアから直接習い事を取り消し可能）
  - P3: total-box下に月収入力フィールド追加（家計比率を緑/黄/赤でリアルタイム表示）
  - P4: footer内の「計算・判定の仕組み」・免責事項カードをfooter外に移動（footer構造整理）
  - P4: AdSense枠数を5→2に削減（過剰広告によるUX悪化を改善）
- 2026-06-13: v2.0.1 M2 フェーズ2実装（フォーム入力UX改善）[improve_phase2_only]
  - M2: 年齢・予算・継続年数スライダーに「cursor: pointer」追加（タッチ操作の視認性向上）
  - M2: 各スライダーに説明テキスト追加（「スライダーを動かして…」）
  - M2: スライダーラベルを3段階表示に変更（0/中央/最大値で分かりやすく）
  - M2: 年齢・予算・継続年数表示要素に aria-live="polite" aria-atomic="true" 追加（スクリーンリーダー対応）
  - M2: フィルターパネルを fieldset/legend で構造化（フォームアクセシビリティ向上）
  - M2: フィルターラベルに aria-label 属性追加（各オプションの意図明確化）
  - M2: CSS で input[type="range"] のカスタムスタイル実装（スライダーサムの視認性向上）
  - M2: input[type="checkbox/radio"] に accent-color: #7c3aed 適用（統一的な色表現）
  - M2: ラベルホバー時の背景色変更実装（選択状態の視覚的フィードバック）
- 2026-05-30: v1.6.0 P1-P4 UX・機能改善 [improve_auto]
  - P1: 初期カテゴリを「おすすめ（年齢連動）」に変更（年齢に合った習い事を即表示）
  - P1: SNSシェアボタンのTailwindクラスバグ修正（display:flex インラインスタイルに変換）
  - P2: 結果エリア内にLINE/Xシェアボタン追加（動的シェアテキスト生成）
  - P2: 「✕外す」ボタンのタッチターゲット修正（28px→44px、モバイルUX改善）
  - P3: 各習い事カードに目安平均費用を追加表示（min/maxの中間値を括弧書きで）
  - P3: アフィリエイトpixel画像のaria-hiddenとalt修正（スクリーンリーダー対応）
  - P4: 関連ツールカード重複（phase9-related-links）削除、既存カードに児童手当計算追加
  - P4: 不要コード削除（ダミーフォーム・空の空関数 calcValue_kid/formatResult_kid）
- 2026-05-29: v1.4.0 P1-P4 UX改善・バグ修正 [improve_auto]
  - P1: カテゴリタブをモバイル横スクロール対応（flex-wrap:nowrap + overflow-x:auto）
  - P1: スキップリンク #main のリンク先ID追加（アクセシビリティ修正）
  - P1: ux-enhanced CSS の #result-area への意図しない左ボーダー除外
  - P1: ヒーローバッジを flex-wrap:wrap コンテナでモバイル折り返し対応
  - P2: copyResults() の年間費用計算を教材費・発表会費(extraMin/extraMax)含む正確な値に修正
  - P2: 年齢ミスマッチの習い事選択時に info トースト警告を表示
  - P3: 月間予算スライダーの step を 1000→5000 円に変更（操作性改善）
  - P3: 重複シェアボタンセクション削除（利用者の声カード内に統一）
  - P4: result-card ホバーエフェクト追加（PC: shadow + translateY）
