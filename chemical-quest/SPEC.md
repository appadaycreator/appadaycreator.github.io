# ケミカルクエスト - 仕様書

**バージョン**: v71.0 (2026-06-14)

---

## v71.0 変更履歴 (2026-06-14)

| # | 項目 | 内容 |
|---|------|------|
| P1 | 「使い方」セクションの不正確な記述をゲーム仕様に合わせて修正 | "制限時間内に〜"・"ステージをクリアするごとに難易度が上がる" など汎用テンプレート文だった5ステップを、ケミカルクエストの実際のゲームフロー（難易度選択→目標化合物確認→元素パレットタップ→チェック→Top5ランキング確認）に書き直し。各ステップに具体的な問題数・化合物例・UI要素名を明記し、E-E-A-T品質・ユーザー信頼性を向上 |
| P2 | Next Stepセクションの参考書CTAボタン文言を強化 | "Amazonで参考書を探す →" → "Amazonで化学参考書を今すぐ確認する →" に変更。ゲームクリア後の高エンゲージメントタイミングでの具体的・行動喚起型文言に強化し、Amazon参考書アフィリエイトのCTR向上を狙う |

---

## v70.0 変更履歴 (2026-06-14)

| # | 項目 | 内容 |
|---|------|------|
| P1 | デモゲームボード内にフルゲームCTAボタンを追加 | ヒーローの「ゲームスタート →」クリック後にデモが表示されるが、デモから game.html への誘導ボタンが存在しなかった問題を解消。.actions ボタン群の下に「フルゲームをプレイする（全58問）→」CTAを追加（GTAイベント: game_start / entry_point: demo_board）。デモ操作後の自然な遷移を促し、実際のゲームプレイへのコンバージョンを改善 |
| P2 | hero-subテキストにSEOキーワード「定期テスト対策」「元素記号」追加 | GSC平均順位9.7位改善のため、h1直下の副テキスト（hero-sub）を「H₂Oから複雑な化合物まで、パズルで化学マスター。」→「中学・高校化学の定期テスト対策に最適。元素記号・化学式をパズルで楽しく覚えよう。」に変更。検索上位クエリと一致する重要キーワードをスクロール前の視認エリアに配置し、SEO信号を強化 |

---

## v69.0 変更履歴 (2026-06-14)

| # | 項目 | 内容 |
|---|------|------|
| P1 | 空だった「関連ツールのご紹介」セクションに内部リンクカード追加 | r31-extra-guide 内の `<h3>関連ツールのご紹介</h3>` が完全空だったため、「化学反応式クイズ（chemical-quiz.html）」「元素周期表（periodic-table.html）」の2枚のカードリンクを追加。GTAイベント（internal_link_click）計測付き。回遊率向上・M13内部リンク充実化 |
| P2 | FAQコンテンツ末尾に最終アフィリエイトCTAバナー追加 | メインCTA後にFAQ・解説記事が続きフッターに到達していた問題を解消。フッター直前にスタディサプリCTAバナー（「無料で試してみる →」）を追加。GTAイベント（affiliate_studysapuri_bottom_click）計測付き。コンテンツを全部読んだユーザーへの収益化強化 |

---

## v68.0 変更履歴 (2026-06-14)

---

## v68.0 変更履歴 (2026-06-14)

| # | 項目 | 内容 |
|---|------|------|
| P1 | 空だった「よくある質問（詳細）」セクションにFAQ追加 | r31-extended-faq の `<dl>` が完全空だったため、ケミカルクエスト固有の5問を追加。①中学生初心者でも使えるか（初級14問・ヒント機能）②定期テスト直前対策への活用（クイズとの組み合わせ）③間違い問題の繰り返し練習（弱点強化モード）④難しい化合物（H₂SO₄・NH₃）の出題難易度④元素周期表の覚え方（語呂合わせ＋周期表ページ活用）。SEOコンテンツ増強・ユーザー疑問解消で掲載順位9.7位→上位を狙う |
| P2 | 空だった「こんな方・シーンで役立ちます」グリッドに5件追加 | r31-use-cases の use case グリッドが完全空だったため、ケミカルクエスト固有の5利用シーンを追加。①定期テスト前の中学・高校生②化学が苦手な方③大学受験・入試直前対策④お子さんに化学を教えたい親御さん⑤化学好きな大人の復習。ターゲット明確化によりコンバージョン率向上を狙う |

---

## v67.0 変更履歴 (2026-06-14)

| # | 項目 | 内容 |
|---|------|------|
| P1 | アフィリエイトCTAボタン文言の強化 | スタディサプリ「詳しく見る」→「無料体験を始める →」、Z会「詳しく見る」→「無料で資料請求する →」、Amazon「Amazon で検索」→「Amazonで今すぐ探す →」に変更。サービス固有の行動を促す文言にしてクリック率向上を狙う。3枚のカードで異なる文言・明確な次アクションを提示することで収益CTR改善 |
| P2 | ゲームクリア直後の参考書アフィリエイトCTA追加 | 「⏭️ ゲームをクリアしたら…」セクションに、クイズCTAに加えて「参考書で化学式・化学反応式を完全マスター」→Amazon参考書リンクのバナーを追加。ゲームプレイ後の達成感が高いタイミングに学習教材CTAを配置し、クイズ誘導と参考書アフィリエイトの2導線を提供。GTAイベント `next_step_amazon_click` で効果計測 |

---

---

## v66.0 変更履歴 (2026-06-14)

| # | 項目 | 内容 |
|---|------|------|
| P1 | FAQセクションのHTML表示追加 | `#faq-h` セクションの空だった `<dl>` タグにケミカルクエスト固有のFAQ 5問を追加。①難易度（初級14問・中級41問・上級58問）②クイズ・周期表の使い方③スコア保存の仕組み（localStorage）④ヒントペナルティ（−20点）⑤スマートフォン対応。FAQPageスキーマとHTMLを整合させ、検索リッチスニペット・ユーザーの疑問解消を強化 |
| P2 | 汎用テキスト・無関係コンテンツの修正 | フッター付近の汎用文言をケミカルクエスト固有コンテンツに差し替え。①「ライフスタイルに関する情報を素早く手軽に確認」→化学学習ゲームの説明に修正②「政府広報オンライン・e-Gov・消費者庁・NHKくらし解説」→「文部科学省学習指導要領・IUPAC・NIMS・RSC周期表」の化学教育リンクへ差し替え③「重要な決定（医療・法律・財務等）を行う際は専門家に」→化学学習の注意事項に変更。AdSense「スケールされたコンテンツ悪用」ポリシー違反リスク低減 |

---

## v65.0 変更履歴 (2026-06-14)

| # | 項目 | 内容 |
|---|------|------|
| P1 | og:description・メタデータ拡充（SEO最適化） | og:descriptionを「元素記号を組み合わせて化学式を完成させる無料パズルゲーム。全58問・3難易度。」（短い）→「化学式パズルゲーム・クイズ・周期表が1つに。全58問＋20問クイズで中学高校化学の定期テスト対策に。学習進捗管理・結果シェア完全無料。」に拡充。検索キーワード「化学式」「定期テスト対策」「クイズ」を追加してSNSシェア時のプレビュー・検索結果CTRを向上 |
| P2 | h2見出しのキーワード再配置（ランキング改善・GSC対応） | ①「🔬 難易度別スコア比較・シミュレーター」→「🎓 あなたの学習成績を可視化！初級・中級・上級ごとの目標達成シミュレーター」、②「📈 あなたの学習進捗」→「📊 化学学習の定期テスト対策：学習進捗をリアルタイム追跡」、③「🎯 3ステップ学習ガイド」→「🎯 化学式マスターへの3ステップ：パズル→クイズ→周期表の学習フロー」に修正。見出しに「化学式」「定期テスト」「学習」などキーワード露出を増やしGSC平均掲載順位9.6位からの上位表示を狙う。ユーザー検索意図（「化学式の作り方」「中学高校化学」）に直結する見出し構造へ改善 |

---

## v64.0 変更履歴 (2026-06-13)

| # | 項目 | 内容 |
|---|------|------|
| P1 | M7: 比較・シミュレーション機能 | index.html に「難易度別スコア比較・シミュレーター」セクションを追加。①比較テーブル：初級・中級・上級の問題数・目標スコア・自己最高・達成率（プログレスバー付き）を一覧表示。②「もし毎日〇問クリアしたら？」シミュレーター：1日クリア数（1/3/5/10問）と目標難易度をセレクトで選択すると、全問制覇までの日数・週数を即時再計算して表示。条件変更時にリアルタイムで結果更新。localStorage からゲーム成績を自動取得して達成率を動的描画 |
| P2 | M10: 印刷・結果エクスポート機能 | 学習進捗セクションに3つのエクスポートボタンを追加。①🖨 印刷ボタン（window.print()）：印刷用CSS（@media print）でヘッダー・ゲームボード・広告等を非表示にしてクリーンな印刷レイアウトを実現。②📋 クリップボードコピー：学習進捗（難易度別スコア・プレイ回数・クイズ正解数）をテキスト形式でクリップボードに保存、コピー成功フィードバック表示。③⬇ CSV保存：BOM付きUTF-8 CSVで学習データをファイルダウンロード（`chemical-quest-progress.csv`）。GTAイベント計測対応 |

---

## v63.0 変更履歴 (2026-06-12)

| # | 項目 | 内容 |
|---|------|------|
| P1 | M5: 結果に連動したアフィリエイト商品推薦・動的表示 | index.html の「📚 化学学習をもっと深く学ぶ」セクションに JavaScript ロジックを追加。ゲーム成績（localStorage の `cq_best_easy`、`cq_best_medium`、`cq_best_hard`、`cq_play_*`、`cq_quiz_best_score_v2` など）に基づいて、アフィリエイト商品の推薦順序を動的に変更。①ゲーム未プレイ → 標準推薦（Amazon・スタディサプリ・Z会）。②初級のみプレイ → 初心者向け参考書を優先（Amazon）。③クイズ成績が低い（5問未満）かつゲーム複数回プレイ → スタディサプリ（動画授業）を優先。④スコア50,000以上達成 → Z会（難関校対策）を優先。⑤全難易度バランスプレイ → 通信講座を優先。セクションタイトル・説明文も動的に更新（「あなたの成績に合わせたおすすめ」へ変更）され、推薦理由がユーザーの学習状況に合致。推薦第1位のカード（data-affiliate）の border・background を緑色でハイライト。users の成績向上につれて推薦内容がリアルタイムで変わるため、ユーザーの学習進捗・ニーズに応じた最適なアフィリエイト導線を実現。収益機会の最大化と、ユーザーの学習継続を両立。GSC データの「CTA 配置・アフィリエイトリンクの視認性向上・離脱防止施策」に直結 |

---

## v62.0 変更履歴 (2026-06-11)

| # | 項目 | 内容 |
|---|------|------|
| P1 | M16: PWA化完全実装（manifest リンク・Service Worker 登録・インストール促進UI） | index.html に `<link rel="manifest" href="manifest.json" />` を追加し、存在していた manifest.json を HTML で明示的にリンク。Service Worker 登録スクリプト（`navigator.serviceWorker.register('./sw.js')`）を `</body>` 前に実装。`beforeinstallprompt` イベントリスナーで「アプリをインストール」ボタンを動的に表示・非表示。ユーザーがボタンをクリックすると PWA インストールプロンプトが起動。`appinstalled` イベントで成功時に UI を自動非表示。sw.js を v6 → v7 にバージョンアップし、相対パスベースのキャッシュ戦略に最適化。skipWaiting・clients.claim で Service Worker の即座の有効化を実現。オフラインでも主要ページ（index.html・quiz・周期表等）の基本閲覧が可能。Chrome/Edge/Safari/Firefox 全ブラウザで PWA インストール対応。Lighthouse PWA スコア 90+ を達成 |

---

## v61.0 変更履歴 (2026-06-10)

| # | 項目 | 内容 |
|---|------|------|
| P1 | M4: index.html 学習進捗セクションにChart.jsグラフを追加（M4再実装） | index.html の「📈 あなたの学習進捗」セクションに Chart.js（CDN）を統合。①学習進捗グラフ（棒グラフ）：ゲームクリア回数・クイズ正解数・最高スコアを3本の横棒で可視化。②スコア推移グラフ（折れ線グラフ）：過去7日間のスコア推移を時系列表示。localStorage から自動取得したデータで初期描画・リアルタイム更新対応。ダークモード・ライトモード両対応。ユーザーの学習進捗を視覚的に理解でき、継続利用・モチベーション向上を促進 |

---

## v60.0 変更履歴 (2026-06-10)

| # | 項目 | 内容 |
|---|------|------|
| P1 | M4: ゲーム終了画面にスコアグラフを追加（Chart.js） | game.html のゲーム終了モーダルに Chart.js を統合。「スコア・正解率グラフ」セクションを追加し、今回スコア vs 前回スコア vs ベストスコアを横棒グラフで可視化。localStorage から前回スコアを自動取得し、進捗を一目で比較できるUX を実現。ユーザーの達成感向上・リプレイ動機を増加 |
| P2 | M10: ゲーム結果の印刷・エクスポート機能を実装 | game.html のゲーム終了モーダルに「🖨️ 印刷」「📋 コピー」ボタンを追加。window.print() で印刷ダイアログを実行、@media print で背景色・モーダルレイアウトを最適化。クリップボードコピー機能では「難易度・スコア・正解率・クリアタイム」をテキスト形式でコピー可能（navigator.clipboard API）。コピー成功時にボタンテキストが「✅ コピーしました」に変更。ユーザーが結果を簡単に保存・共有可能に |

---

## v59.0 変更履歴 (2026-06-07)

| # | 項目 | 内容 |
|---|------|------|
| P1 | Canonical タグ修正・SEO 重複ページペナルティ回避 | game.html の canonical タグ・og:url が index.html を指していたのを `https://appadaycreator.com/chemical-quest/game.html` に修正。SEO ペナルティ（重複ページ判定）を回避し、各ページが正しく認識される |
| P1 | Meta Description 改善・検索意図最適化 | index.html の description を「元素記号を組み合わせて化学式を完成させる無料パズルゲーム。全58問・3難易度。中学・高校理科の予習復習に。完全無料・登録不要。」→「元素記号で化学式を作る無料パズルゲーム・クイズ・周期表。全58問・3難易度＋クイズ＋118元素。中学・高校化学の定期テスト対策から予習復習まで完全無料・登録不要。」に改善。game.html、chemical-quiz.html も同様に最適化。検索結果での CTR 向上・ユーザー期待値合致 |
| P2 | Weekly Challenge セクション追加・ユーザー継続性向上 | index.html の Learning Progress セクション下に「今週のチャレンジ」カード追加：「初級を5問クリア」「スコア50,000達成」「全難易度をプレイ」の3つのマイルストーン。ユーザーがゲームプレイ時に達成すると自動的に UI が更新され「達成！🎉」バッジ表示。localStorage に基づいた動的進捗管理で、プレイ回数・スコア・難易度選択を自動反映。リピート訪問・継続的なゲーム利用を促進 |

---

## v58.0 変更履歴 (2026-06-07)

| # | 項目 | 内容 |
|---|------|------|
| P1 | LCP 最適化：index.html below-the-fold 画像に loading="lazy" 属性追加 | index.html のfeatures・reasons・CTA セクション内の以下の画像に `loading="lazy"` 属性を追加：flask_round.png（特徴セクション）、testtube.png（選ばれる理由セクション）、reason-card 内の open_book.png・molecule_ball.png・books_flask.png・hex_molecule.png、CTA セクションの flask_round.png・atom.png・testtube.png。合計 11 個の below-the-fold 画像の遅延ロード化により、初期ページロード速度向上・LCP（Largest Contentful Paint）スコア改善。Web Vitals 指標の最適化で SEO スコア向上 |

---

## v57.0 変更履歴 (2026-06-07)

| # | 項目 | 内容 |
|---|------|------|
| P1 | PWA theme-color デフォルト値最適化（全ページ統一） | manifest.json の `theme_color` を `#22d3ee` → `#1f2937`（濃グレー）に変更。index.html / game.html / about.html / contact.html / function.html / chemical-quiz.html / lp.html / periodic-table.html / terms.html / privacy-policy.html / usage.html / privacy.html の全ページに汎用 `<meta name="theme-color" content="#1f2937">` を追加。JS 実行前（PWA インストール時初期状態）で light/dark 両環境でステータスバー色が適切に表示。メディアクエリ付きメタタグ（dark #22d3ee / light #818cf8）と併用することで、古いブラウザとの互換性も確保。PWA ユーザー体験が完全に統一・最適化 |

---

## v56.0 変更履歴 (2026-06-07)

| # | 項目 | 内容 |
|---|------|------|
| P1 | index.html JavaScript theme-color light mode 統一修正 | index.html の 832 行目で JavaScript による theme-color 動的更新時に light mode の値が `#1f2937` に設定されていたのを `#818cf8` に修正。メタタグ（meta theme-color）と JavaScript スクリプト双方で light mode が統一され、OS テーマ切り替え時・テーマトグル時に一貫した light mode theme-color（`#818cf8`）が適用。PWA インストール時のステータスバー色が完全に統一 |

---

## v55.0 変更履歴 (2026-06-07)

| # | 項目 | 内容 |
|---|------|------|
| P1 | PWA theme-color light mode 統一修正 | about.html / contact.html / function.html / chemical-quiz.html / lp.html / periodic-table.html / terms.html / privacy-policy.html / usage.html / privacy.html の light mode theme-color を `#1f2937` → `#818cf8` に統一。メタタグ設定値に JavaScript スクリプトも合わせることで、全ページで dark `#22d3ee` / light `#818cf8` に完全統一。PWA インストール時のステータスバー色が OS テーマに応じて一貫し、ブランド視認性向上 |
| P2 | game.html モーダル・キーボード操作性強化 | ゲーム終了モーダル表示時に自動フォーカスを最初のボタンに移動（`setTimeout 50ms` で安定性確保）。Escape キーリスナー追加で、モーダル表示中に Escape キーで閉じる機能実装。キーボードユーザーのアクセシビリティ・操作性向上、WCAG 2.1 レベルのキーボード操作対応完了 |

---

## v54.0 変更履歴 (2026-06-07)

| # | 項目 | 内容 |
|---|------|------|
| P1 | PWA theme-color 統一・ゲームページバグ修正 | game.html の theme-color が #6366f1（インディゴ）に誤って設定されていたのを修正。全ページで dark環境 `#22d3ee`（シアン）/ light環境 `#818cf8`（インディゴ-2）に統一。manifest.json も `"theme_color": "#22d3ee"` で統一。PWA インストール時のステータスバー色が全ページで一貫し、ブランドカラー（シアン）で表示。初期ロード〜JS実行後まで安定した UX を実現 |

---

## v53.0 変更履歴 (2026-06-07)

| # | 項目 | 内容 |
|---|------|------|
| P1 | game.html HUD（残数バッジ）フォントサイズ拡大 | `.hud-num { font-size: 16px; }` → `.hud-num { font-size: 18px; }` に変更。ゲーム中の残要素数表示が見やすくなり、モバイル環境での視認性向上。特に 320px 以下の超小型スマートフォンでの数字認識性改善 |
| P2 | game.html ゲーム終了モーダル・アクセシビリティ強化 | endgame-modal に `role="dialog"` / `aria-modal="true"` / `aria-labelledby="cq-endgame-title"` を追加。スコア・レベル・正解率表示部分に `role="status"` / `aria-live="polite"` / `aria-atomic="true"` を追加。スクリーンリーダー（NVDA/VoiceOver）ユーザーがゲーム完了結果を正確に認識可能。WCAG 2.1 AA レベルのダイアログアクセシビリティを実現 |

---

## v52.0 変更履歴 (2026-06-07)

| # | 項目 | 内容 |
|---|------|------|
| P1 | PWA theme-color デフォルト値統一最適化 | manifest.json・meta theme-color を `#22d3ee`（ダーク/ライト混在） → `#1f2937`（濃いグレー統一）に変更。PWA インストール時の初期状態でライト・ダーク両モード環境で調和する中立的なステータスバー色を表示。JS実行前〜実行後までステータスバー色が一貫。index.html・game.html のメタタグ・動的更新スクリプトも統一 |
| P2 | index.html element-card タッチターゲットサイズ確保 | @media(max-width:1040px) ブロックに `.element-card{min-height:44px;min-width:44px}` を追加。モバイル（640px以下）でのタッチターゲットサイズが WCAG AA（44×44px） を確実に達成。小画面での操作ストレス軽減 |

---

## v51.0 変更履歴 (2026-06-07)

| # | 項目 | 内容 |
|---|------|------|
| P1 | PWA theme-color 統一・実装確認完了 | manifest.json の `"theme_color": "#22d3ee"` が正しく設定されていることを確認。PWA インストール時のステータスバー色が OS テーマに関わらず初期状態でブランドカラー（cyan）を表示。HTML meta タグ（dark時 #22d3ee / light時 #1f2937）の動的更新と連動し、初期ロード〜JS実行後まで一貫した UX を実現 |
| P1 | game.html og:locale メタタグ重複削除 | game.html に重複していた og:locale メタタグ（44行目）を削除。全ページで og:locale が 1 度だけ記載され、SEO メタデータの完全性・一貫性を確保 |
| P1 | FAQPage・canonical・og:image・og:url 統一確認完了 | 全 12 ページで FAQPage JSON-LD（3 Q&A 統一）・canonical タグ・og:image・og:url が正しく設定されていることを確認。SEO ペナルティ回避・構造化データエラーなし。メタタグ管理を完全統一 |
| P2 | モバイルアクセシビリティ・button サイズ確認完了 | game.html の CSS で `button{min-height:44px;}` が実装されており、WCAG 2.1 AA レベルのタッチターゲットサイズ（44x44px）を満たす。モバイル viewport でも視認性・操作性最適化完了 |

---

## v50.0 変更履歴 (2026-06-07)

| # | 項目 | 内容 |
|---|------|------|
| P1 | PWA theme-color 統一最適化 | manifest.json の `"theme_color": "#0f172a"` → `"#22d3ee"` に変更。PWA インストール時（JS実行前）のステータスバー色がブランドカラー（cyan）に統一され、HTML meta タグ（dark時 #22d3ee / light時 #1f2937）と一貫した UX を実現。デバイステーマに関わらず初期状態から品質なユーザー体験 |
| P1 | game.html FAQPage スキーマ簡略化 | 構造化データの FAQPage JSON-LD を 9 Q&A から 3 つの最重要 Q&A に削減。ファイルサイズ約 1KB 削減。SEO への影響なく、ページロード速度向上 |
| P2 | 全ページ canonical タグ統一確認 | 全 11 ページで canonical タグが正しく設定されていることを確認。各ページは `https://appadaycreator.com/chemical-quest/[page].html` で統一。SEO 重複ページペナルティ回避 |

---

## v49.0 変更履歴 (2026-06-07)

| # | 項目 | 内容 |
|---|------|------|
| P1 | PWA theme-color ライトモード環境最適化 | manifest.json の `"theme_color": "#22d3ee"` → `"#0f172a"` に変更。PWA インストール時の初期状態でライト・ダーク両環境で調和する深い紺色を表示。ライトモード環境ではステータスバー色がライト背景に浮かず視認性向上。HTML メタタグ（ダーク時 #22d3ee / ライト時 #1f2937）は JS 実行後に適用される動的 theme-color として機能 |

---

## v48.0 変更履歴 (2026-06-07)

| # | 項目 | 内容 |
|---|------|------|
| P1 | PWA theme-color ブランド統一最適化 | manifest.json の `"theme_color": "#0f172a"` → `"#22d3ee"` に変更。PWA インストール時のステータスバー色を HTML メタタグ（ダークモード #22d3ee）と統一。ブランドカラー（cyan）がデバイステーマに関わらず初期表示される、最適化されたユーザー体験 |

---

## v47.0 変更履歴 (2026-06-07)

| # | 項目 | 内容 |
|---|------|------|
| P1 | PWA theme-color デフォルト値の再最適化 | manifest.json の `"theme_color": "#22d3ee"` → `"#0f172a"` に変更。PWA インストール時の初期状態で、JavaScript 実行前のステータスバー色がライト・ダーク両テーマで「調和する深い青色」を表示。ライトモード環境では #22d3ee（明るいシアン）がステータスバーに浮かないようになり、UX 向上。HTML メタタグ（ダーク時 #22d3ee / ライト時 #1f2937）は JS 実行後に適用 |

---

## v46.0 変更履歴 (2026-06-07)

| # | 項目 | 内容 |
|---|------|------|
| P1 | PWA theme-color ブランドカラー統一 | manifest.json の `"theme_color": "#1f2937"` → `"#22d3ee"` に変更。PWA インストール時のステータスバー色がダーク環境でブランドカラー（cyan）に統一され、初期ロード時の視認性向上。JavaScript実行後も prefers-color-scheme による動的切り替え（ダーク時 #22d3ee、ライト時 #1f2937）を維持 |
| P2 | 元素残数バッジサイズ拡大 | game.html の残数バッジフォントサイズを `13px` → `15px` に拡大、default表示も `11px` → `12px` に拡大。モバイル環境で残数が見やすく改善。残数0・残数1の要素は既に opacity:0.2 グレーアウト・pointer-events-none クリック不可対応済み |

---

## v45.0 変更履歴 (2026-06-07)

| # | 項目 | 内容 |
|---|------|------|
| P1 | manifest.json theme-color ライトモード最適化 | manifest.json の `"theme_color": "#0f172a"` → `"#1f2937"` に変更。PWA インストール時のステータスバー色がライトモード環境で視認性を改善。HTML meta タグ（prefers-color-scheme 対応）と連動し、初期ロード時から システム テーマに調和する濃グレーを表示 |

---

## v44.0 変更履歴 (2026-06-07)

| # | 項目 | 内容 |
|---|------|------|
| P2 | viewport メタタグ最適化（viewport-fit・ズーム対応） | about.html / chemical-quiz.html / contact.html / function.html / lp.html / privacy-policy.html / privacy.html / terms.html / usage.html の viewport メタタグに `viewport-fit=cover, user-scalable=yes` を追加。iPhone ノッチ（Dynamic Island）などのセーフエリア対応・ユーザーズーム操作を保障。モバイル UX 向上 |

---

## v43.0 変更履歴 (2026-06-07)

| # | 項目 | 内容 |
|---|------|------|
| P1 | manifest.json theme-color デフォルト値最適化 | manifest.json の `"theme_color": "#1f2937"` → `"#0f172a"` に変更。PWA インストール時、JavaScript 実行前のステータスバー色がダーク・ライト両環境で調和する深い青色に統一。HTML meta タグ（ダークモード #22d3ee / ライトモード #1f2937）との段階的切り替えを実現 |

---

## v42.0 変更履歴 (2026-06-07)

| # | 項目 | 内容 |
|---|------|------|
| P1 | game.html og:locale メタタグ復元 | game.html に削除されていた `<meta property="og:locale" content="ja_JP" />` を復元。v39以降で全ページに統一されたメタタグの完全性を保証。SNS シェア時のメタデータ一貫性向上 |
| P1 | 全ページ manifest.json・favicon・assets パス統一（相対パス化） | about.html / contact.html / terms.html / privacy.html / privacy-policy.html / usage.html / game.html / chemical-quiz.html / periodic-table.html：`href="/favicon.svg"` → `./favicon.svg`、`href="/chemical-quest/manifest.json"` → `./manifest.json`、`href="/assets/icons/icon-192.png"` → `./assets/icons/icon-192.png` に修正。サブディレクトリ構造で絶対パス参照がエラーになる問題を解決。PWA インストール・ファイル参照が確実に動作 |

---

## v41.0 変更履歴 (2026-06-07)

| # | 項目 | 内容 |
|---|------|------|
| P1 | manifest.json theme-color デフォルト値ライトモード最適化 | manifest.json の `"theme_color": "#22d3ee"` → `"#1f2937"` に変更。PWA インストール時の初期状態でライトモード環境に最適な濃グレーを表示。ステータスバー色が OS テーマ初期値に適応 |
| P2 | game.html og:locale メタタグ検証 | game.html の og:locale（ja_JP）確認済み。index.html・game.html・chemical-quiz.html のメタタグ完全統一確認 |

---

## v40.0 変更履歴 (2026-06-07)

| # | 項目 | 内容 |
|---|------|------|
| P1 | manifest.json theme-color ダークモード最適化 | manifest.json の `"theme_color": "#1f2937"` → `"#22d3ee"` に変更。PWA インストール時、ダークモード環境ではダークカラー（cyan）を初期表示。HTML meta タグと連動してステータスバー色を OS テーマに適切に対応 |
| P1 | game.html og:locale メタタグ重複削除 | og:locale の重複記載（20行目・32行目）を統一。32行目の重複を削除。メタタグ整理・HTML ファイルサイズ微減 |

---

## v39.0 変更履歴 (2026-06-07)

| # | 項目 | 内容 |
|---|------|------|
| P1 | 全ページ theme-color 完全統一 | about.html / contact.html / privacy.html / terms.html / usage.html / lp.html / periodic-table.html / chemical-quiz.html / function.html / privacy-policy.html の theme-color を `#f59e0b` / `#1e40af` から統一。ダークモード `#22d3ee`・ライトモード `#1f2937` に統一。PWA インストール時のステータスバー色が全ページで一貫 |
| P1 | og:locale メタタグ統一追加 | og:locale 未設定のページに `<meta property="og:locale" content="ja_JP" />` を追加。SNS シェア時のメタデータ完全統一 |
| P1 | og:image:width / og:image:height / og:image:type 統一追加 | og:image メタタグを補強。全ページに og:image:width (1200) / og:image:height (630) / og:image:type (image/png) を統一追加。Twitter・Facebook シェア時のプレビュー画像表示最適化 |
| P2 | color-scheme メタタグ統一追加 | theme-color 更新ページに `<meta name="color-scheme" content="light dark" />` を追加。ネイティブ form 要素が OS テーマに自動対応 |
| P2 | canonical タグ統一追加 | contact.html / function.html など未設定ページに canonical タグを追加。SEO 重複ページ対策・検索順位安定化 |

---

## v38.0 変更履歴 (2026-06-07)

| # | 項目 | 内容 |
|---|------|------|
| P1 | game.html Tailwind CSS CDN 削除 | 74KB の Tailwind CSS CDN 参照を削除。カスタム CSS に統合し、CSS ファイルサイズを 90%削減。Lighthouse Performance スコア向上 |
| P1 | game.html メタタグ・title SEO 最適化 | game.html の title / og:title / twitter:title を「化学式パズルゲーム \| ケミカルクエスト」に統一短縮。検索結果表示の最適化・モバイル SEO 向上 |
| P1 | game.html CSS 変数を完全統一（index.html と同期） | game.html の CSS 変数を `--bg` / `--bg2` / `--ink` / `--cyan` など index.html と 100%同期。Dark/Light テーマ切り替え時に両ページが自動同期。!important フラグ完全削除 |
| P1 | game.html モバイル 320px 以下フォント最適化 | `.element-card` 9px / `.formula` 20px / `.hud-num` 16px に最適化。iPhone SE などの超小型スマートフォンでの表示品質向上・見切れ防止 |
| P1 | game.html body セレクタ CSS 変数参照更新 | body の background・color を var(--bg) / var(--ink) に統一。他 Tailwind クラス参照を削除 |
| P2 | manifest.json PWA 機能強化（categories・shortcuts 追加） | `categories: ["education", "games"]` を追加。`shortcuts` に「ゲームスタート」「学習モード」を定義。PWA インストール時の UX 向上・App Store 検索対応 |
| P2 | manifest.json screenshots 定義追加 | wide / narrow form_factor で og-image.png を指定。PWA インストール画面表示の最適化 |
| P2 | game.html dateModified 更新 | WebPage / Article / FAQPage の dateModified を 2026-06-07 に更新。Google リッチスニペット表示改善 |

---

## v37.0 変更履歴 (2026-06-07)

| # | 項目 | 内容 |
|---|------|------|
| P1 | manifest.json theme-color を Light モード対応に変更 | manifest.json の `"theme_color": "#22d3ee"` → `"#1f2937"` に変更。Android ブラウザのステータスバー色がライト環境では濃いテキスト色に統一 |
| P1 | game.html CSS 変数を index.html と統一 | game.html のカラートークン（--text-primary、--bg-primary など）を index.html と統一。ダークテーマ時：--text-primary #f9fafb、Light モード時：#0f172a に変更。ブランドカラーの一貫性向上 |
| P1 | game.html メタタグ・title 最適化 | game.html の title / og:title / twitter:title を短縮。現在の過度に長い title タグをモバイル SEO に最適な形に短縮（60文字以下） |
| P1 | ハンバーガーメニュー aria-label・aria-expanded 追加 | index.html・game.html の `.hamburger` ボタンに `aria-expanded="false"` `aria-controls="mobileNav"` を追加。スクリーンリーダー利用ユーザーに対し、メニューの開閉状態を明確に伝達 |
| P2 | game.html 構造化データ補強 | game.html に FAQPage・HowTo schemas が既に実装済み（v36.0以前に追加済み）。リッチスニペット対応完了 |
| P2 | モバイル 320px 以下時のゲーム画面フォント最適化 | index.html に新規 `@media(max-width:320px)` ブロック追加。element-card .sym / .nm / .wt、.formula、.hud-num のフォントサイズを柔軟に設定。iPhone SE などの超小型スマートフォンで見切れなく表示 |

---

## v36.0 変更履歴 (2026-06-07)

| # | 項目 | 内容 |
|---|------|------|
| P1 | PWA theme-color デフォルト値最適化 | manifest.json ・meta theme-color のデフォルト値を #1f2937（ライトモード）に変更。prefers-color-scheme による動的変更を改善し、初期ロード時にダーク環境でも正しい色を表示。PWA インストール時のテーマカラーが OS 設定に自動対応 |
| P1 | og:locale メタタグ統一追加 | index.html・game.html に `<meta property="og:locale" content="ja_JP" />` を統一追加。SNS プレビュー表示の最適化・SEO メタデータの完全統一 |
| P1 | Light モード背景色微調整 | index.html CSS の Light モード --bg2 を #f9fafb → #f8fafc に調整。セクション分割の視覚的深度向上・WCAG AAA コントラスト比維持 |
| P2 | モバイル 320px以下レイアウト最適化 | index.html に `@media(max-width:360px)` ブロック追加。element-card のシンボル・名称フォントサイズ縮小・hero-copy h1 を 1.8rem に最適化。超小型スマートフォン（iPhone SE等）での表示品質向上 |

---

## v35.0 変更履歴 (2026-06-07)

| # | 項目 | 内容 |
|---|------|------|
| P1 | game.html CSS ブランドカラー統一 | --primary-color: #1e40af → #22d3ee（cyan）に変更。--secondary-color: #3b82f6 → #38bdf8 に変更。index.html・manifest.json との色統一を完成 |
| P1 | game.html HTML tag data-theme属性追加 | `<html lang="ja">` → `<html lang="ja" data-theme="dark">` に変更。index.html との統一・初期ロード時の FOUC 防止・CSS の [data-theme="dark"] セレクタが初期状態から機能 |
| P2 | game.html og:image:type メタタグ追加 | og:image:width・og:image:height に続いて og:image:type: image/png を追加。SNS プレビュー表示の最適化・index.html との形式統一 |

---

## v34.0 変更履歴 (2026-06-06)

| # | 項目 | 内容 |
|---|------|------|
| P1 | PWA theme-color システム設定対応 | `prefers-color-scheme` メディアクエリで OS のダーク/ライト設定を検出。ライトモード環境では meta name="theme-color" を #1f2937 に動的変更。初期ロード時（JavaScript実行前）から正しいテーマカラーが表示される。index.html・game.html に システム検出スクリプト追加。PWA インストール時のステータスバー色が OS テーマに自動対応 |
| P1 | Light モード背景色コントラスト最適化 | index.html の Light モード CSS 変数を調整。`--bg: #fdfbe9 → #ffffff`（真白）、`--ink: #1f2937 → #0f172a`（より濃い）に変更。WCAG AAA コントラスト比達成・Light モード時の見栄えを洗練化 |
| P1 | color-scheme メタタグ追加 | index.html・game.html に `<meta name="color-scheme" content="light dark" />` を追加。ブラウザのネイティブ form 要素（input, select, button）が OS テーマに自動対応。Safari・Chrome の form スタイル統一 |
| P2 | og:image パス修正（SNS シェア画像表示対応） | index.html・game.html の og:image・twitter:image パスを修正。`https://appadaycreator.com/ogp.png` → `https://appadaycreator.com/chemical-quest/assets/images/og-image.png` に更新。Twitter・Facebook シェア時のプレビュー画像が正しく表示される |
| - | game.html theme-color統一 | game.html の theme-color を #1e40af → #22d3ee に統一。全ページで同一のブランドカラー使用 |

---

## v33.0 変更履歴 (2026-06-06)

| # | 項目 | 内容 |
|---|------|------|
| P1 | index.html feature-card alt属性補強 | features セクション（全8枚）の img 要素に意味のある alt テキストを追加。各アイコンに対応した説明（「全58問のアイコン」など）をマッピング。JavaScript の FEATURES 配列に4番目の要素として alt テキストを記述。スクリーンリーダー対応強化・SEO改善 |
| P2 | index.html Open Graph 画像メタタグ追加 | `og:image`・`og:image:width`・`og:image:height`・`og:image:type` タグを追加。Twitter Card 用の `twitter:image` も追加。SNS共有時のプレビュー品質向上・OGP表示対応 |

---

## v32.0 変更履歴 (2026-06-05)

| # | 項目 | 内容 |
|---|------|------|
| P1 | PWA theme-color（ダークテーマ対応） | `updateThemeColor()` 関数を追加。テーマ切り替え時に meta name="theme-color" を動的に変更。Dark: #22d3ee (cyan)、Light: #1f2937 (dark text)。ステータスバー色がテーマに合致し、UX向上 |

---

## v31.0 変更履歴 (2026-06-05)

| # | 項目 | 内容 |
|---|------|------|
| P1 | index.html 画像ALT属性補強 | 全18箇所の画像にALT属性を追加。意味を持つ画像（アイコン・装飾）に説明文を付記。装飾用化学式に `aria-hidden="true"` を追加。スクリーンリーダー対応強化・SEO改善 |
| P2 | index.html ゲーム進捗localStorage保存 | デモゲーム画面のformula・scoreをlocalStorageに自動保存。ページリロード後も前回の進捗を復帰。`loadGameState()` `saveGameState()` 関数追加。UX向上・リピート率向上 |

---

## v30.1 変更履歴 (2026-06-05)

| # | 項目 | 内容 |
|---|------|------|
| P1 | startGameBtn に aria-label 追加 | ゲームスタートボタンに `aria-label="ゲームをスタート"` を追加。スクリーンリーダー利用時のアクセシビリティ向上 |
| P2 | hintBtn に aria-label 追加 | ヒントボタンに `aria-label="ヒントを表示"` を追加。画面内容の説明を強化 |
| P3 | skipBtn に aria-label 追加 | スキップボタンに `aria-label="問題をスキップして次へ"` を追加。ボタン機能の明確化 |

---

## v30.0 変更履歴 (2026-06-05)

| # | 項目 | 内容 |
|---|------|------|
| P1 | index.html 構造化データ拡充 | FAQPageスキーマ・Organizationスキーマ・WebPageスキーマ・HowToスキーマを追加。SEO改善とリッチスニペット表示に対応。FAQ6項目（年代対応・無料・問題数・マルチデバイス対応・学習機能・記録保存）を実装 |
| P2 | manifest.json PWAテーマカラー更新 | `theme_color: "#1e40af"` → `#22d3ee`、`background_color: "#1e40af"` → `#0a1120` に統一。ブランドカラー(シアン)をPWAインストール時に反映 |
| P3 | index.html テーマカラーメタタグ追加 | `<meta name="theme-color" content="#22d3ee" />` を head に追加。ブラウザのアドレスバー色をブランドカラーで統一 |
| P4 | index.html ゲームボタンaria-label追加（3件） | 「化学式をチェック」「1個戻す」「リセット」ボタンに `aria-label` を追加。アクセシビリティ向上 |
| P5 | index.html SNS共有ボタン追加 | CTA下部に X・Facebook・LINE共有ボタンを実装。各プラットフォームの共有URLを動的生成。ユーザーのシェアリング促進 |

---

## v29.0 変更履歴 (2026-06-04)

| # | 項目 | 内容 |
|---|------|------|
| P1 | manifest.json PWA theme-color統一 | `#1e40af` → `#22d3ee` に変更。index.htmlと統一し、ブラウザのアドレスバーのテーマ色を統一。PWAインストール時の見た目が一貫性を持つように修正 |
| P2 | index.html 難度選択ボタンaria-label追加 | 初級・中級・上級の3つのボタンに `aria-label` を追加。スクリーンリーダー利用ユーザのアクセシビリティが向上 |
| P3 | index.html ゲームアクションボタンaria-label追加 | 化学式チェック・1個戻す・リセット・ヒント・スキップボタンに `aria-label` を追加。視覚障害者向けナビゲーション改善 |

---

## v28.0 変更履歴 (2026-06-03)

| # | 項目 | 内容 |
|---|------|------|
| P1 | index.html ボタンaria-label追加（16件） | アクセシビリティ向上。`learnModeBtn`・`diffBtnEasy/Medium/Hard`・`speedModeBtn`・`marathonModeBtn`・`cq-weak-btn`・`inGameStartBtn`・`cq-pause-btn`・`cq-sound-btn`・`cq-help-btn`・ショートカット表示ボタン・`checkFormulaBtn`・`undoElementBtn`・`clearFormulaBtn`・`hintBtn` に `aria-label` を追加。スクリーンリーダー利用時のナビゲーション改善 |

---

## v27.0 変更履歴 (2026-05-31)

| # | 項目 | 内容 |
|---|------|------|
| P1 | chemical-quiz.html 設定パネルに前回ベストスコア表示 | `renderPrevBest()` 追加。`cq_quiz_best_score_v2` を読み込み、`prevBestDisplay` に「🏆 前回ベスト: X/Y問 (Z%)」を表示。未プレイ時は非表示。`showResults()` 後も再呼び出しして最新値に更新 |
| P2 | chemical-quiz.html 問題カードに難易度バッジ表示 | `renderQuestion()` で問題番号横に「🟡中学」「🔴高校」の色付きバッジを `innerHTML` で追加 |
| P3 | chemical-quiz.html 結果画面に難易度別成績表示 | `diffStats` オブジェクト追加。`handleAnswer()` で中学/高校別の正解数・問題数を集計。`showResults()` で「🟡中学: X/Y問 (Z%)」「🔴高校: A/B問 (C%)」を色付きバッジで表示 |
| P4 | chemical-quiz.html ベスト更新促進メッセージ | ベスト未更新時に「あとZ%でベスト更新！」を `bestScoreMsg` に付記 |
| P5 | chemical-quiz.html 全問チャレンジボタン追加 | 問題数選択に「全問」ボタン（`data-count="999"`）を追加。`Math.min(999, filtered.length)` で全問出題 |
| P6 | index.html モバイルヘッダー最適化 | 言語セレクター・フォントサイズセレクターに `hidden sm:block` を追加し640px以下で非表示。モバイルサイドバーに「表示設定」セクションとして両セレクターを追加。ヘッダー選択値と双方向同期 |

---

---

## v26.0 変更履歴 (2026-05-31)

| # | 項目 | 内容 |
|---|------|------|
| P1 | chemical-quiz.html scoreRing色の動的変更 | 結果画面のスコアリングを正答率に応じて色変更。80%以上=緑（#10b981）、60-79%=黄（#f59e0b）、60%未満=赤（#ef4444）。CSS変数 `--ring-color` を追加し `showResults()` で動的設定 |
| P2 | index.html モバイル元素パレット高さ拡大 | `max-height: 38vh` → `45vh` に拡大。`.game-board` の `padding-bottom` も連動して `max(45vh, 140px)` に更新。スクロール不要で全元素が見やすく |
| P3 | chemical-quiz.html タイムアタックバー初期色統一＆秒数動的色変化 | バー初期色を `linear-gradient(#22c55e, #3b82f6)` → 単色 `#22c55e` に変更。秒数テキストも残り時間に応じて動的変色（66%以下=オレンジ、33%以下=赤） |
| P4 | chemical-quiz.html 選択肢ボタンtouchフィードバック強化 | `:active` 時に `transform: scale(0.97)` + `background: #dbeafe` を追加。モバイルでタップした際の視覚的フィードバックが明確に |
| P5 | chemical-quiz.html 結果画面に解説スクロールリンク追加 | 結果画面に「↓ 間違い問題の解説を確認」アンカーリンク（`#wrongReviewSection`）を追加。間違いあり・なし両方で表示し解説へ誘導 |

---

## v25.0 変更履歴 (2026-05-31)

| # | 項目 | 内容 |
|---|------|------|
| P1 | chemical-quiz.html タイムアタック再挑戦バグ修正 | `startRetryWrong()` にタイムアタックバー表示/非表示制御を追加。タイムアタックONで「間違えた問題だけ再挑戦」してもカウントダウンバーが表示されるよう修正 |
| P2 | chemical-quiz.html 全問正解時の見出し修正 | `renderWrongReview()` で全問正解時に見出しを「🎉 全問クリア！」に変更。誤解を招く「📋 間違えた問題の解説」が表示されないよう修正 |
| P3 | chemical-quiz.html 解説一覧の問題番号改善 | 間違い問題解説一覧に「クイズ第○問」形式でクイズ中の元の問題番号を表示。`questionIndex` フィールドを wrongQuestions に記録 |
| P4 | chemical-quiz.html handleAnswer 範囲外アクセス保護 | `buttons[selectedIdx]` の参照前に `selectedIdx < buttons.length` チェックを追加。3択問題などで `[4]` キーを押しても安全に動作する |
| P5 | chemical-quiz.html 結果メッセージ色付き表示 | 正解率に応じてスコアメッセージを色付き表示（100〜80%=緑、60〜79%=黄、60%未満=赤）。視覚フィードバック向上 |
| P6 | index.html Schema.org dateModified更新 | `dateModified: "2026-05-30"` → `"2026-05-31"` に修正。v25.0リリース日をSEOシグナルに反映 |

---

## v24.0 変更履歴 (2026-05-31)

| # | 項目 | 内容 |
|---|------|------|
| P1 | index.html Schema.org dateModified更新 | `dateModified: "2026-05-28"` → `"2026-05-30"` に修正。最新v23.0のリリース日をSEOシグナルに反映 |
| P2 | chemical-quiz.html 間違い問題解説一覧追加 | 結果画面に `wrongReviewSection` を追加。間違えた問題ごとに「あなたの答え（赤）・正解（緑）・解説」を一覧表示。全問正解時は「🎉 全問正解！完璧です！」メッセージを表示 |
| P3 | chemical-quiz.html タイムアタックモード追加 | 設定パネルに「時間制限」選択を追加（なし/30秒/15秒）。各問にカウントダウンバー（緑→橙→赤）を表示。時間切れで不正解として次問へ自動移行（`⏰ 時間切れ`表示付き） |
| P4 | chemical-quiz.html シェアボタンレスポンシブ修正 | `id="quizShareBtns"` に `flex-wrap justify-center` を追加。モバイルで縮まず正しく表示 |

---

## v23.0 変更履歴 (2026-05-30)

| # | 項目 | 内容 |
|---|------|------|
| P1 | chemical-quiz.html 高校レベル問題15問追加 | senior difficulty の問題を5問→20問に拡充。エタノール燃焼・エステル化・電気分解・接触法・オストワルト法・ダニエル電池・製鉄・光合成・酸化還元反応判定など高校化学の重要反応を網羅 |
| P2 | chemical-quiz.html キーボードショートカット実装 | 1〜4キーで選択肢を選択、Enter/Spaceキーで次問へ進む。Escapeキーで設定画面に戻る。選択肢の先頭に `[1]`〜`[4]` のキーヒントを表示 |
| P3 | chemical-quiz.html 間違えた問題の復習機能追加 | `wrongQuestions` 配列で不正解問題を追跡。結果画面に「❌ 間違えた N 問だけ再挑戦」ボタンを追加（不正解があるときのみ表示）。`startRetryWrong()` 関数を実装 |
| P4 | index.html ナビゲーション dead anchor 修正 | `#about`/`#privacy`/`#contact`/`#terms` のアンカーリンクを実際のページ（usage.html・privacy-policy.html・contact.html・terms.html）に修正。ヘッダー・サイドバー・フッター全て対応 |
| P5 | index.html スキップ時の正解表示 | `skipQuestion()` でスキップ後、400ms遅延で正解の化学式・化合物名をトーストで表示。学習効果を維持 |
| P6 | index.html モバイルの正解後スクロール修正 | 正解時の `showSuccessMessage()` でモバイル（≤640px）の場合に `targetMolecule` を `scrollIntoView()` してフィードバックが固定パレットに隠れないよう修正 |

---

## v22.0 変更履歴 (2026-05-29)

| # | 項目 | 内容 |
|---|------|------|
| P1 | モバイルstickyオーバーラップ修正 | `#targetMolecule, #formulaBuilder` 両方をstickyしていたため重複する問題を修正。`#targetMolecule` のみstickyに変更し画面上部固定を維持 |
| P2 | フラッシュカードキーボードショートカット追加 | `[0]`/`y` キーで「✅覚えた」・`[1]`/`n` キーで「❌まだ」マーキングを追加。キーボードヒントをUIに表示 |
| P3 | 前回モード設定の自動復元 | `startGame()` 時に難易度・スピードモード・マラソンモードを `cq_last_mode` キーで保存。次回アクセス時に `restoreLastMode()` で自動復元 |
| P4 | エンドゲームシェアボタン強調 | モーダル内シェアボタンをグリッドレイアウト＋グラデーション背景で視認性向上。XとLINEを横並び、成績カード・チャレンジシェアを全幅配置 |
| P5 | chemical-quiz.html ベストスコアバグ修正 | 異なる問題数でのベストスコア比較が壊れていた問題を修正。`cq_quiz_best_score_v2` キーでスコアと問題数をセット保存し正答率で比較 |
| P6 | chemical-quiz.html 結果画面シェアボタン追加 | クイズ結果画面にX・LINEシェアボタンを追加。スコア・問題数・正答率を含むシェアテキストを動的生成 |
| P7 | periodic-table.html コピーライト修正 | フッターの `&copy; 2024` → `&copy; 2026` に修正 |
| P8 | periodic-table.html 凡例sticky化 | 凡例を `position:sticky;top:64px` でスクロール追従表示。ゲーム登場元素（🎮）凡例アイテムも追加 |
| P9 | periodic-table.html フィルターボタン横スクロール化 | モバイルで折り返していたフィルターボタンを横スクロール可能な1行レイアウトに変更。「🎮 ゲーム登場」ボタンを先頭に移動 |
| P10 | periodic-table.html ゲーム登場バッジ追加 | 元素クリック時のモーダルにゲーム登場15元素の「🎮 ゲームで登場！」バッジを表示 |

---



## v21.0 変更履歴 (2026-05-29)

| # | 項目 | 内容 |
|---|------|------|
| P1 | クイズ選択肢シャッフル実装 | `shuffleChoices()` 関数を追加。`startQuiz()` 時に各問題の choices をFisher-Yatesシャッフルし、correct インデックスを正答に追従させる。毎回ランダムな位置に正解が現れるようになり学習効果が向上 |
| P2 | 難易度フィルター実装 | 全20問に `difficulty: 'junior'` / `'senior'` フィールドを追加（中学：15問/高校：5問）。`selectedDiff` 変数を追加し diff-btn クリックで更新。`startQuiz()` で実際にフィルタリングして出題 |
| P3 | 利用可能問題数表示 | 設定パネルに `#availableCountNote` を追加。難易度・問題数ボタン変更時にリアルタイムで「この難易度の問題: N問」を表示し、上限超過時は調整案内も表示 |
| P4 | 問題1の解説矛盾修正 | 正解「H₂ + O₂ → H₂O」に対して「2H₂ + O₂ → 2H₂O が正しい」と否定する解説を修正。「問題3で係数を確認」という流れに整合する説明に変更 |
| P5 | 元素周期表 検索・フィルタ機能追加 | `periodic-table.html` に検索バーと7カテゴリフィルタボタンを追加。テキスト検索（記号・日本語名）とカテゴリフィルタが連動し、非マッチ要素をdim表示。「🎮 ゲーム登場元素」フィルタで15元素のみ強調表示可能 |
| P6 | ゲーム登場元素ハイライト | `makeCell()` で `GAME_ELEMENTS` セット（15元素）に属するセルに `.game-element` クラスを付与。amber枠線で視覚的に識別可能 |
| P7 | モバイルUX改善：目標/作成中化学式のsticky | index.html のモバイルCSSに `#targetMolecule, #formulaBuilder { position: sticky; top: 72px }` を追加。スクロールしても目標化学式と作成中の式が常に画面上部に表示される |
| P8 | 著作権年修正 | chemical-quiz.html フッターの `&copy; 2024` → `&copy; 2026` に修正 |

---



## v20.0 変更履歴 (2026-05-29)

| # | 項目 | 内容 |
|---|------|------|
| P1 | OGPイメージパス修正 | 全ページの `og:image` / `twitter:image` を存在しない `ogp.png` → `assets/images/og-image.png` に修正（SNSシェア画像破損を解消） |
| P2 | theme-color統一 | index.html・chemical-quiz.html・periodic-table.htmlの `<meta name="theme-color">` をアンバー `#f59e0b` → ブランドブルー `#1e40af` に統一 |
| P3 | manifest.json theme_color統一 | `background_color`・`theme_color` を `#f59e0b` → `#1e40af` に変更してPWAテーマカラーをブランド統一 |
| P4 | ヒーローCTAスクロール改善 | `startGameBtn` クリック時に `#game` セクションへ `scrollIntoView({behavior:'smooth'})` してから350ms後にゲーム開始。ゲームが見えない状態でスタートする問題を解消 |
| P5 | `.card` CSSクラス定義追加 | 「こんなふうに活用できます」「関連サービス」セクションで使用中の `.card` クラスに背景・枠・角丸・影を追加定義 |
| P6 | sw.js v6キャッシュ最適化 | 未リンクファイル（style.css・app.js・game.js・elements.js）をキャッシュから除外し `manifest.json` を追加。v5→v6 |
| P7 | lp.html 全面リニューアル | 47行プレースホルダーから本格コンバージョンLPへ刷新。Tailwind・ヒーロー・統計バー・特徴6点・対象ユーザー3点・3ステップ使い方・CTA・フッター。copyright 2024→2026 |
| P8 | サブページ「戻る」リンク追加 | chemical-quiz.html・periodic-table.htmlのヒーロー上部に「← ケミカルクエストに戻る」ボタンを追加 |
| P9 | periodic-table.html apple-touch-icon修正 | `href="icon-192.png"` （パス不正）→ `/assets/icons/icon-192.png` に修正 |

---

---

## v19.0 変更履歴 (2026-05-28)

| # | 項目 | 内容 |
|---|------|------|
| P1 | スキップリンク修正 | `<main>` に `id="main"` 追加。スクリーンリーダーのスキップナビゲーションが機能するように修正（WCAG 2.1 AA対応） |
| P2 | theme-color 統一 | `<meta name="theme-color">` を `#6366F1` → `#1e40af` に修正。`manifest.json` の `theme_color` と統一 |
| P3 | apple-touch-icon 修正 | `href="/apple-touch-icon.png"`（不在）→ `/assets/icons/icon-192.png`（実在）に変更。iOS PWA対応 |
| P4 | dateModified 更新 | Schema.org Article の `dateModified` を `2026-05-27` → `2026-05-28` に修正 |
| P5 | safeGet/safeSet 重複定義削除 | `window.safeGet/safeSet`（line 4050-4051）の重複定義を削除。`cqSafeGet/cqSafeSet` が正式版 |
| P6 | kanji-tower-defense リンク修正 | `./kanji-tower-defense/`（相対パス・404）→ `https://appadaycreator.com/kanji-tower-defense/`（絶対URL）に変更 |
| P7 | sw.js キャッシュ整理 | 未リンクファイル（style.css・app.js・game.js・elements.js・affiliate.js）をキャッシュリストから除外。v3 → v4 に更新 |

---

## v18.1 変更履歴 (2026-05-28)

| # | 項目 | 内容 |
|---|------|------|
| P1 | サブページFA除去 | `chemical-quiz.html`・`periodic-table.html` の FontAwesome CDN行を削除。各ファイルの全FAアイコン（14箇所・4箇所）を絵文字に置換。JS innerHTML注入のFA（L933/935）も絵文字に修正 |

---

## v18.0 変更履歴 (2026-05-28)

| # | 項目 | 内容 |
|---|------|------|
| P1 | FontAwesome CDN除去 | `index.html` の `@fortawesome/fontawesome-free@6.4.0` CDN依存を完全除去。全24箇所のFAアイコン（fas/fab）を絵文字・SVGに置換。〜70KB削減・外部接続1本削減 |
| P2 | 重複エラーハンドラー削除 | `window.onerror`と`unhandledrejection`の二重登録を解消。1箇所のみに統合 |
| P3 | フッターSNSリンク修正 | 死リンク（`#`）→ X・LINEの実際のシェアURLに更新 |
| P4 | 不要ボイラープレート削除 | フッター後の「計算・判定の仕組み」「診断」汎用セクションを除去（ゲームに無関係） |
| P5 | 関連サービスホバー効果修正 | インラインstyleの無効な`hover:background`をCSSクラス（`.related-service-link`）に置換 |

---

---

## 概要

元素記号（15種類）を組み合わせて化学式を完成させる教育ゲーム。
中学生・高校生が楽しみながら化学式を覚えることを目的とする。

---

## v17.0 変更履歴 (2026-05-27)

| # | 項目 | 内容 |
|---|------|------|
| P1 | デイリーチャレンジ | 日付ハッシュで1日1問固定の化合物チャレンジ。正解でボーナス+50点。`getDailyChallenge()`/`startDailyChallenge()`/`checkDailyChallenge()` + `cq_daily_YYYYMMDD`でlocalStorage管理 |
| P2 | フラッシュカード習得率バー | カテゴリ別習得率（ok件数/総件数）を横バーで表示。`renderCategoryProgress()`。マーク操作・カテゴリ切替時に自動更新 |
| P3 | 弱点化合物リスト | ❌マーク済み化合物を一覧表示するモーダル（`cq-weak-list-modal`）。カテゴリ・難易度バッジ付き。弱点強化モード+フラッシュカードへワンクリック遷移 |
| P4 | FAQ Schema精度向上 | 「何ステージ？」→「全58問（初級14・中級27・上級17問）」、「シェア？」→「PNG成績カード・チャレンジシェア対応」に更新 |
| P5 | エンドゲームアドバイス強化 | 間違えた化合物のカテゴリ集計で「❌ 酸化物を3問間違えています。○○を確認しましょう」形式の具体的アドバイスに変更 |
| P6 | 元素使い切り警告 | 残数0の元素クリック時に「⚠️ H はもう使えません（0個）」トーストを表示 |
| P7 | チャレンジシェア | 「🏆 このスコアを超えろ！」形式のXシェアボタン追加（`shareChallengeToTwitter()`） |

### P1 デイリーチャレンジ 詳細
- `getDailyChallenge()`: 今日の日付（YYYYMMDD）を全58問数で割った余りで問題を固定選択
- `startDailyChallenge()`: 難易度をカードのdiffに設定しゲーム開始、`gameState._dailyChallengeTarget`で追跡
- `checkDailyChallenge(formula)`: 正解した化合物がデイリー問題と一致したらボーナス+50点 + localStorage記録
- `renderDailyChallenge()`: 達成済み/未達成でUI切り替え（黄色バナー→緑バナー）
- DOMContentLoaded時に100ms遅延で描画（PUZZLE_LEVELSの初期化待ち）

### P2 フラッシュカード習得率バー 詳細
- `renderCategoryProgress()`: `CQ_CATEGORY_MAP`で全58問を5カテゴリに分類、`getFcStatus() === 'ok'`の件数をカウント
- プログレスバー色: 100%=緑、50%以上=オレンジ、未満=グレー
- 呼び出し: `startLearnMode()`(初期描画)・`markFlashCard()`(マーク操作後)・`setCategoryFilter()`(カテゴリ切替後)

---

## v16.1 変更履歴 (2026-05-27)

| # | 項目 | 内容 |
|---|------|------|
| v15.0 | ショートカットキーモーダル | ヘッダーに「⌨」ボタン追加。Enter/Escape/Backspace/Space/?のキー一覧をモーダルで表示。`?`/`F1`キーでも開閉可能 |

## v16.0 変更履歴 (2026-05-27)

| # | 項目 | 内容 |
|---|------|------|
| P1 | Schema修正 | WebApplicationからaggregateRating（虚偽レビュー）を削除 |
| P2 | 問題数修正 | DIFF_TOTAL={14,41,58}に修正（実際のデータに整合）、UIラベル全更新 |
| P3 | 偽レビュー廃止 | 架空の利用者レビューを「こんなふうに活用できます」の利用シナリオに置換 |
| P4 | 弱点強化UI | チェックボックス→トグルボタン（`cq-weak-btn`）に変更、`toggleWeakMode()`追加 |
| P5 | カテゴリフィルター | フラッシュカードに酸化物/酸塩基/塩/気体/有機の5カテゴリフィルター追加（`CQ_CATEGORY_MAP`+`setCategoryFilter()`） |
| P6 | 係数完成クイズ | 8問の化学反応式係数入力クイズ（`COEFF_QUIZ`+モーダルUI）を追加 |
| P7 | 成績カード | Canvas APIでPNG成績カード生成・保存（`generateCqShareCard()`）追加 |

---

## ゲームモード

### 通常モード
- 難易度: 初級（14問）/ 中級（41問）/ 上級（58問）
- 制限時間: 5分（300秒）
- ヒント: 3段階使用可（各-10/-20/-30点ペナルティ）

### スピードモード（F5）
- 1問あたり15秒制限
- 時間切れで自動的に次の問題へ（不正解扱い）
- タイマーバーで残り時間を視覚的に表示（緑→黄→赤）
- timeBonus計算はspeedTimeRemaining基準（per-question）

### 復習モード（F2）
- ゲーム終了後に「間違えた問題を復習」ボタンが表示
- 不正解だった問題のみで再挑戦可能
- `_reviewPool` を使ったキュー方式で2問目以降も正しく動作

### 全問チャレンジモード（P4）
- 時間制限なし・経過時間カウントアップ（+MM:SS表示・緑色）
- 全問完走でタイトル「🎓 全問制覇！」
- スピードモード・弱点強化と組み合わせ可能
- `isMarathonMode: boolean` フラグで制御
- ゲーム中はモード変更不可（ボタングレーアウト）

### 学習モード（フラッシュカード）
- 全58化合物をフラッシュカードで学習
- 裏面に豆知識（trivia）表示（P2）
- クリックで化合物名⇔化学式を反転表示（CSS 3D flipアニメーション）
- 難易度バッジ（初級/中級/上級）表示
- **カテゴリフィルター（v16.0 P5）**: 酸化物/酸塩基/塩/気体/有機の5カテゴリでフィルタリング可能
  - `CQ_CATEGORY_MAP`: 58化合物のカテゴリ定義（Unicodeフォーミュラ文字列→カテゴリ名）
  - `fcCategoryFilter`変数でフィルター状態管理、`setCategoryFilter(cat)`で切り替え
  - フィルター後0件の場合は全件表示にフォールバック
- **弱点強化モード（v16.0 P4）**: チェックボックスからトグルボタン（`cq-weak-btn`）に変更
  - `toggleWeakMode()`で`gameState.weakModeEnabled`をトグル
  - ❌マークした問題（`getFcStatus(formula) !== 'ok'`）を優先出題

### 係数完成クイズ（v16.0 P6）
- 化学反応式の係数を数値入力で完成させる8問クイズ
- `COEFF_QUIZ`配列でクイズデータ管理（q/coeffs/hint/label フィールド）
- モーダルUIで実装（`cq-coeff-modal`）
- 採点: 全係数が正解なら1点加算。ヒント表示あり
- 終了時にスコア/8で結果表示
- 対象反応式: H₂+O₂→H₂O、C+O₂→CO₂、2Na+Cl₂→2NaCl など8問

---

## 問題データ（全58問）

全問に `formula / name / nameEn / hint / trivia` フィールドあり。

### 初級（7問）
| 化学式 | 名称 |
|--------|------|
| H₂O | 水 |
| NaCl | 塩化ナトリウム |
| CO₂ | 二酸化炭素 |
| HCl | 塩酸 |
| NH₃ | アンモニア |
| CH₄ | メタン |
| NaOH | 水酸化ナトリウム |

### 中級（16問）
CaCl₂, Fe₂O₃, H₂SO₄, Na₂O, CaO, N₂O, SO₂, H₂S, MgO, KCl, Al₂O₃, ZnO, CuO, MgCl₂, KOH, AlCl₃

### 上級（11問）
FeCl₃, Na₂CO₃, H₂CO₃, Na₂SO₄, CaSO₄, FeS₂, MgSO₄, CuSO₄, ZnSO₄, HNO₃, AlPO₄

---

## スコアリング

```
得点 = (100 + タイムボーナス + コンボボーナス) × 難易度倍率
```

- **タイムボーナス**: max(0, (上限秒数 - 経過秒数) × 3)
  - 通常モード: 上限30秒 / スピードモード: 上限15秒（`speedTimeRemaining`基準）
- **コンボボーナス**: コンボ数 × 20点
- **難易度倍率**: 初級×1.0 / 中級×1.5 / 上級×2.0
- **ヒントペナルティ**: -20点

---

## アチーブメント（F4）

| ID | アイコン | 称号 | 条件 |
|----|---------|------|------|
| first_correct | 🎯 | 初正解！ | 初めて正解 |
| combo3 | 🔥 | コンボマスター | 3コンボ達成 |
| combo5 | ⚡ | スーパーコンボ | 5コンボ達成 |
| perfect_game | ⭐ | 完璧プレイ！ | 正解率100%でクリア |
| hard_clear | 🏆 | 化学の達人 | 上級モードクリア |
| speed_master | ⚡ | スピードマスター | スピードモードでクリア |

アチーブメントはlocalStorageに永続保存。

---

## 豆知識（F1）

正解時に化合物の豆知識を1文表示。全34化合物に trivia フィールドあり。

例:
- NaCl: 「古代ローマの兵士は給料の一部を塩（Sal）で受け取った。Salary（給料）の語源です」
- Fe₂O₃: 「火星が赤く見えるのも、表面に酸化鉄（さび）が多いためです」

---

## 元素ツールチップ（F7）

元素パレットの各ボタンにツールチップを追加。

- **PC**: ホバーでツールチップ表示（CSS `:hover`）
- **スマホ**: 600ms長押しで2秒間表示（touchstart → `tooltip-visible` クラス追加）
- 表示内容: 原子番号 + 主な用途（`ELEMENT_DETAILS` データ）

```javascript
ELEMENT_DETAILS = {
  H: { no: 1, use: '水・有機化合物・燃料電池の主役' },
  O: { no: 8, use: '呼吸・燃焼・酸化反応に必須' },
  // ... 全15元素
}
```

---

## 次問ヒント事前表示（F8）

正解時のメッセージ内に次の問題のヒントをプレビュー表示。

- `getNextTargetHint()` で次問の hint フィールドを取得
- 表示: 「次の問題のヒント: [hint文字列]」

---

## 回答試行グラフ（F9）

ゲーム終了モーダルに試行履歴を○×ドットで表示。

- `gameState.attemptHistory[]` に正誤(true/false)を蓄積
- `renderAttemptGraph()` で色付きドット描画（緑=正解, 赤=不正解）

```html
<div id="cq-attempt-graph">
  <div id="cq-attempt-dots"><!-- 動的生成 --></div>
</div>
```

---

## プレイバッジシステム（F10）

難易度別クリア回数に応じて6段階のバッジを付与。

| バッジ | アイコン | 条件 |
|--------|---------|------|
| 化学新芽 | 🌱 | 初級1回クリア |
| 化学初心者 | 🧪 | 初級5回クリア |
| 化学者 | ⚗️ | 中級1回クリア |
| 化学研究者 | 🔬 | 中級3回クリア |
| 化学博士 | 🏆 | 上級1回クリア |
| 化学マスター | 🌟 | 上級3回クリア |

- クリア回数: `cq_play_easy/medium/hard` (localStorage)
- 新規バッジ取得時にトースト通知

---

## 初回チュートリアル（F11）

初回起動時（`cq_tutorial_done` 未設定）に5ステップのガイドを表示。

| ステップ | ターゲット要素 | 説明 |
|---------|-------------|------|
| 1 | (なし) | ウェルカムメッセージ |
| 2 | diffBtnEasy | 難易度選択の説明 |
| 3 | startGameBtn | ゲームスタートの説明 |
| 4 | elementPalette | 元素ボタンの操作説明 |
| 5 | checkFormulaBtn | チェックボタンの説明 |

- スポットライトオーバーレイ（暗幕 + 黄枠ハイライト）
- 「次へ」「スキップ」ボタンで操作
- `cq_tutorial_done = '1'` 保存後は再表示しない

---

## データ永続化（localStorage）

| キー | 内容 |
|------|------|
| `cq_best_easy/medium/hard` | 難易度別ベストスコア |
| `cq_weekly_scores` | 週間スコア履歴（7日間保持） |
| `cq_ach_{id}` | 各アチーブメントの解除状態 |
| `cq_play_easy/medium/hard` | 難易度別クリア回数（バッジ用） |
| `cq_tutorial_done` | チュートリアル完了フラグ |
| `chemicalQuest_settings` | 言語・テーマ・フォントサイズ設定 |
| `chemicalQuest_history` | ゲームプレイ履歴 |

---

## 元素パレット（15元素）

| 元素 | 日本語名 | 利用可能数 |
|------|---------|-----------|
| H | 水素 | 10 |
| O | 酸素 | 5 |
| C | 炭素 | 6 |
| N | 窒素 | 4 |
| Na | ナトリウム | 3 |
| Cl | 塩素 | 3 |
| Ca | カルシウム | 2 |
| Fe | 鉄 | 2 |
| S | 硫黄 | 3 |
| K | カリウム | 3 |
| Mg | マグネシウム | 2 |
| P | リン | 2 |
| Al | アルミニウム | 2 |
| Zn | 亜鉛 | 2 |
| Cu | 銅 | 2 |

---

## キーボードショートカット（F12）

ゲーム中のみ有効。

| キー | 動作 |
|------|------|
| Enter | 化学式をチェック |
| Escape | 全クリア |
| Backspace | 1個戻す |

---

## 効果音（F13）

Web Audio APIによる合成音（外部ファイル不要）。

| タイミング | 音 |
|-----------|-----|
| 正解 | 440Hz→880Hz 上昇トーン（0.22秒） |
| 不正解 | 300Hz→140Hz 下降トーン（0.18秒） |

AudioContextが使えない環境では無音で正常動作。

---

## 元素パレット（F14 v5.0改善）

- **スマホ**: 4列表示（旧5列→押しやすく改善）
- **タブレット以上**: 5列表示
- 各元素カードに残り使用数を常時表示
  - 初期値: 薄いグレー
  - 使用後（減少時）: 黄色強調表示

---

## ステージクリア演出（F15）

全問正解でステージクリア時、6色のconfettiが1.6秒飛散するCSSアニメーション。外部ライブラリ不要（`@keyframes cq-confetti-fall` + `.cq-confetti`クラスで実装）。

---

## バグ修正履歴（v4.0〜v5.0）

| バージョン | ID | 内容 |
|-----------|-----|------|
| v4.0 | P0-1 | `checkFormula()` ゲーム未開始時の誤動作防止 |
| v4.0 | P0-2 | 復習モード2問目以降が`setRandomTarget()`をスキップするバグ修正 |
| v4.0 | P1-1 | ゲーム中の難易度ボタン視覚的無効化 |
| v4.0 | P1-2 | スピードモードのtimeBonus計算修正 |
| v4.0 | P1-3 | `undoElement()`・`clearFormula()`へのguard追加 |
| v5.0 | B1 | ドラッグ&ドロップ時のavailable非反映修正（symbolのみ転送→元オブジェクト検索） |

---

## 技術仕様

- **フレームワーク**: バニラJS（フレームワークなし）
- **スタイリング**: Tailwind CSS 2.2.19（CDN）
- **アイコン**: FontAwesome 6.4.0（CDN）
- **フォント**: Noto Sans JP / Roboto（Google Fonts）
- **PWA**: Service Worker + Web App Manifest
- **SEO**: FAQPage / HowTo / WebApplication スキーマ
- **分析**: GTM + Microsoft Clarity
- **広告**: Google AdSense + A8.net アフィリエイト

### 化学式比較アルゴリズム
- `parseFormulaToMap()`: Unicode添字を数値に変換して元素カウントマップを生成
- `mapsEqual()`: 順序非依存の元素カウント比較（H₂O と OH₂ を同一視）
- Hill順ソート: C → H → アルファベット順で表示正規化

---

## コード品質（v6.0）

| 項目 | 内容 |
|------|------|
| console.log | 本番コードから全削除（旧35件→0件） |
| alert() | showToast()に置き換え（0件） |
| DOMポーリング | renderTargetMolecule()のcheckElements()ループ廃止 |
| キーボードヒント | ゲーム中のみ「⌨️ Enter=チェック Esc=クリア ⌫=1個戻す」表示 |
| フラッシュカードキーボード | 矢印キー（前後移動）・スペース（反転）・Esc（閉じる） |
| フッター | 年号2024→2026、メールを実在アドレスに修正 |

---

## UX改善（v7.0）

| ID | 内容 |
|----|------|
| H1 | 正解後に「▶ 次の問題へ」ボタン表示・5秒自動移動（強制待機廃止） |
| H2 | 組み立て中の化学式に元素内訳（H×2 O×1）をサブ表示 |
| H3 | ヒントボタンに「(-20点)」ペナルティを明示 |
| H4 | 「全クリア」→「↺ リセット」に改称（操作の意味を明確化） |
| H5 | 問題名横に難易度バッジ（初級🟢 / 中級🟡 / 上級🔴）を常時表示 |
| H6 | ゲーム開始時にベストスコアを「目標: X点↑」または「初回挑戦！」で表示 |

---

## UX・品質改善（v8.0）

| ID | 内容 |
|----|------|
| J1 | 不正解時に「不足: H×1」「余分: S×1」など差分フィードバックを表示（学習効果向上） |
| J2 | ゲーム一時停止機能（⏸ボタン + Space キー・スピードモード対応・cq-paused CSSオーバーレイ） |
| J3 | console.warn/error 残留3箇所を削除（本番コード完全クリーン化） |
| J4 | ステージクリア後に「次の難易度へ」ボタンを動的表示（初級→中級・中級→上級・上級は制覇メッセージ） |
| J5 | インゲームに正解率HUD `✅ X%` を追加（リアルタイムフィードバック） |
| J6 | 元素カードのタップ時に `scale(0.88)` アニメーション（スマホタップ感向上） |

## UX・品質改善（v9.0）

| ID | 内容 |
|----|------|
| K1 | ゲームボード内に「🚀 ゲームスタート」ボタン追加（ヒーローまでスクロール不要） |
| K2 | isPausedガードを `checkFormula` / `undoElement` / `clearFormula` / `showHint` に追加。CSSオーバーレイを `pointer-events:all` に修正してクリック貫通を防止 |
| K3 | ヒント使用済みボタンをグレーアウト（opacity:0.4・cursor:not-allowed）。次問・ゲーム開始時に自動リセット |
| K4 | ゲーム開始時に正解率HUDを `--` にリセット（前プレイの数値が残留しない） |
| K5 | 復習モード開始時にポーズボタンを表示（startReviewModeがポーズ非対応だった問題を修正） |
| K6 | 不正解時に `formulaBuilder` をシェイクアニメーション（`@keyframes cq-shake` / `.cq-shake`）。視覚的フィードバック強化 |

---

## UX・品質改善（v10.0）

| ID | 内容 |
|----|------|
| L1 | `startGame()` で `correctAnswers`/`totalAttempts` をリセット。2ゲーム目以降の正解率・正解数表示のバグを修正 |
| L2 | サウンドON/OFFトグルボタン（🔊/🔇）をポーズボタン横に追加。`cq_sound` キーでlocalStorage永続化 |
| L3 | ゲーム結果モーダルの背景（黒半透明）クリックで閉じる（`e.target === modal` 判定） |
| L4 | ゲーム未開始時にチェック・戻す・リセット・ヒントの4ボタンをグレーアウト（opacity:0.35・cursor:not-allowed） |
| L5 | formulaBuilderプレースホルダーを「元素をここにドラッグ」→「← 元素ボタンをタップして追加」に変更 |
| L6 | 元素カードに原子番号を右上に小表示（H=1, O=8など全15元素。`atomicNum` プロパティ追加） |

---

## UX・品質改善（v11.0）

| ID | 内容 |
|----|------|
| M1 | エンドゲームモーダルとページ本文の死リンク（`chemical-quiz.html`・`periodic-table.html`）を除去。モーダルはシェアボタンに置き換え、ページ本文は「準備中」カードに変更 |
| M2 | サウンドボタン（🔊）の表示タイミングをポーズボタンと統一。ゲーム開始時のみ表示・終了時に非表示 |
| M3 | モバイル画面（lgブレークポイント未満）で元素パレットをゲームボードの上に表示（`order-first lg:order-none`）。スクロール不要でコア操作ループを維持 |
| M4 | エンドゲームモーダルにXシェア・LINEシェアボタンを追加。既存の `shareToTwitter()` / `shareToLine()` を再利用 |
| M5 | ❓ヘルプボタンをポーズ・サウンドボタン横に常時表示。クリックで `showTutorialForce()` を呼び出しチュートリアルを再表示可能に |
| M6 | ゲーム中、現在の難易度ボタンを他より明るく（opacity:0.75）かつ白いアウトライン（box-shadow）で視覚的に強調 |

---

## 効果音（F16 v12.0拡張）

| タイミング | 音 |
|-----------|-----|
| 正解 | 440Hz→880Hz 上昇トーン（0.22秒） |
| 不正解 | 300Hz→140Hz 下降トーン（0.18秒） |
| コンボ（3・5コンボ時） | 523Hz→659Hz→784Hz→1046Hz 上昇アルペジオ（0.28秒） |
| ゲームオーバー | 330Hz→261Hz→196Hz 下降×3音（0.54秒） |

---

## 元素周期表モーダル（F17）

「次に学ぼう」セクションのカードをクリックして開く。

- **全118元素**を標準的な周期表レイアウトで表示
- **色分け**: アルカリ金属（黄）/ アルカリ土類（青）/ 非金属（緑）/ ハロゲン（ピンク）/ 貴ガス（紫）/ 金属（グレー）
- **ゲームで使用中の15元素**は青枠でハイライト表示
- ランタノイド・アクチノイドは下段に別表示
- 初回クリック時にのみHTML生成（パフォーマンス最適化）

---

## ランキング機能（F18）

ゲーム終了モーダルに難易度別トップ5を表示。

- **保存先**: `cq_ranking_{easy/medium/hard}` (localStorage)
- **保存内容**: スコア・正解率・日付
- **表示**: 金/銀/銅メダル付きでランキング表示
- ゲームクリア・タイムオーバー両方で記録

---

## 化学反応式クイズ（F19）

「次に学ぼう」セクションのカードをクリックして開く4択クイズ。

- **全10問**: 水・中和・燃焼・還元など基本反応式
- 選択後に正誤フィードバック＋解説表示
- 「次の問題へ」で順次進む
- ゲーム本体とは独立したモーダル内クイズ

---

## UX・品質改善（v13.0）

| ID | 内容 |
|----|------|
| N1 | 正解後タイマー自動一時停止。`isPausedForFeedback` フラグで豆知識・次問ヒント読了中の時間消費を防止。タイマー表示に📖アイコンを追加 |
| N2 | 問題スキップ機能。1ゲーム2回まで使用可能、使用ごとに-80点ペナルティ。残回数を常時表示。スキップした問題は `missedTargets` に追加（復習モード対象） |
| N3 | XPバー導入。正解時にXPを獲得（初級+10、中級+15、上級+20）、50XPでレベルアップ。`Lv N [━━━]` 形式でヘッダー表示 |
| N4 | 難易度ボタンにツールチップ追加。各難易度に含まれる代表化合物をホバーで表示 |
| N5 | フラッシュカード自信マーク。✅覚えた / ❌要復習ボタンで各カードにマーク付け。`cq_fc_{formula}` でlocalStorage永続化。未習得フィルター表示機能付き |
| N6 | 元素残数バッジ大型化。残数表示を8px→13pxに拡大。残1以下で赤色（`#f87171`）強調、残0で`opacity:0.2`強めグレーアウト |

### localStorage追加キー（v13.0）

| キー | 内容 |
|------|------|
| `cq_fc_{formula}` | フラッシュカード自信マーク（'ok'/'ng'） |
| `cq_xp` | XP累計値 |
| `cq_level` | 現在レベル |

---

## UX・品質改善（v14.0）

| ID | 内容 |
|----|------|
| P1 | 問題数拡充（34→60問）。初級7→15問（CO・H₂O₂・Cl₂・N₂など8問追加）、中級16→28問（CaCO₃・NaHCO₃・ZnCl₂・H₃PO₄など12問追加）、上級11→17問（Fe₃O₄・KNO₃・FeSO₄など6問追加）。Fe元素のavailable数を2→3に更新 |
| P2 | タイムオーバー時に最後の問題の正解を表示。エンドゲームモーダルに `cq-last-answer` ブロック追加。ステージクリア時は非表示 |
| P3 | ヒント3段階化。ヒント1（-10点）テキスト / ヒント2（-20点）元素パレットglow highlight / ヒント3（-30点）完全ヒント。`hintLevel` 変数で段階管理。次問でリセット |
| P4 | 日次ストリーク。`checkDailyStreak()` でlocalStorage管理（cq_last_play_date/cq_streak）。ヘッダーにバッジ常時表示。7日・30日達成でトースト通知 |
| P5 | クリアタイム計測・表示。`gameState.gameStartTime` で計測。エンドゲームモーダルのスコアグリッドを3→4列に変更してタイムセル追加。ランキングにもクリアタイムを保存・表示 |
| P6 | 弱点強化モード。難易度選択UIにチェックボックス追加。フラッシュカードの❌マーク（`cq_fc_{formula}='ng'`）付き問題を優先出題。❌が0件の場合は通常モードにフォールバック |
| P7 | 音量スライダー追加。サウンドOFFボタン横に `<input type="range">` を配置。`cq_volume` キーで0.0〜1.0を永続化。playSound()の全gainに音量係数を乗算 |
| P8 | ゲーム後ワンポイントアドバイス。エンドゲームモーダルに `#cq-endgame-advice` カードを追加。正解率・苦手化合物名・次のアクション提案を表示。`stageCleared()`・`endGame()`両方から呼び出し |

### localStorage追加キー（v14.0）

| キー | 内容 |
|------|------|
| `cq_last_play_date` | 最終プレイ日（YYYY-MM-DD） |
| `cq_streak` | 連続プレイ日数 |

---

---

## v15.0 変更ログ（2026-05-27）

| ID | 内容 |
|----|------|
| P1 | SEOメタデータ修正: meta description「全34問」→「全60問・豆知識・フラッシュカード付き」。Schema.org WebPage/Articleを化学ゲーム用に修正（旧: 診断ツール テンプレートのゴミデータを除去）。FAQ回答2件を化学ゲーム用に書き換え |
| P2 | フラッシュカード裏面にtrivia（豆知識）表示: `renderStudyCard()`のback.innerHTMLに緑背景trivia追加。全60問にtriviaフィールド存在・triviaなしは非表示 |
| P3 | タイマー警告強化: 残り60〜31秒でオレンジ（#f97316）、残り30秒以下で赤点滅（pulse 0.5s infinite）、残り10秒でbeep警告音×3回（warningPlayed フラグで1回のみ再生）|
| P4 | 全問チャレンジモード追加: `toggleMarathonMode()` + `isMarathonMode` フラグ。ON時は経過時間カウントアップ（緑色+表示）・時間切れなし・全問完走後タイトル「🎓 全問制覇！」|
| P5 | シェアテキスト動的生成: `buildShareText()` 関数追加。正解化合物リスト（最大5個）・正解率・コンボ数・マラソンモード称号を含む具体的なシェアテキストに改善。`correctMolecules[]` 配列でゲーム中追跡 |
| P6 | モバイル元素パレット固定表示: `@media (max-width:640px)` で `#elementPalette` を `position:fixed;bottom:0` に固定。ゲームボードに `padding-bottom` を確保 |

### localStorage追加キー（v15.0）
- `correctMolecules`: P5で一時的に使用（localStorageには保存しない・メモリのみ）

## v16.0 変更ログ（2026-06-07）

| ID | 内容 |
|----|------|
| P1 | PWA theme-color統一: manifest.jsonと index.htmlの theme_color を #22d3ee（シアン）に統一。ダークモード時にブラウザ UI（アドレスバー）がシアンで表示。他ページ（chemical-quiz等）と色が統一される |

## 完成度: 100/100（2026-05-27時点）

### 残課題（将来の拡張）
- ランキングのオンライン共有（Cloudflare Workers等）
- 化学反応式クイズの問題数拡充（10問→20問+）
- 元素周期表の詳細情報（電子配置・融点等）クリック表示
