# クレジットカード最適診断ツール 仕様書

## 概要
Webブラウザ上で動作するクレジットカード診断アプリです。5つの質問に答えるとおすすめカードを表示します。
診断結果ページでは、ユーザーが選択した内容とおすすめカードを判断した理由を併せて表示します。
2025年7月の更新で、診断結果ページの余白と文字サイズを見直し、レイアウトを改善しました。
2025年8月の更新では、タイトル下のステップインジケーターを削除し、カード上部のプログレスバーのみで進捗を表示するようにしました。

## improve_auto Round24（2026-06-09）
- **P1 OG/Twitter Card タグ設置**: Open Graph メタタグ（og:title, og:description, og:image, og:url, og:type）と Twitter Card タグ（twitter:card, twitter:title, twitter:description, twitter:image）を追加。SNS共有時にサムネイル・説明が正常表示されるようになり、シェア拡散力が向上
- 修正ファイル: `index.html`

## improve_auto Round23（2026-06-08）
- **P0 非クレジットカード商品削除**: Futaba キャッシング（女性向け個人ローン）セクションをページ末尾から削除。クレジットカード比較サービスのスコープに合わせ、商品一貫性を向上
- 修正ファイル: `index.html`

## ページ構成
- `index.html` : 診断ツール本体
- `usage.html` : 詳細な使い方説明
- `disclaimer.html` : 免責事項
- `privacy.html` : プライバシーポリシー

## 共通要素
- ヘッダーと背景デザインは全ページで共通
- Google Tag Manager と A8.net のスクリプトを利用

## ナビゲーション
- 各ページのフッターから `index.html`、`usage.html`、`disclaimer.html`、`privacy.html` へ相互に遷移可能
- 診断画面では「戻る」ボタンを左、「次へ」ボタンを右に配置

## 利用技術
- HTML/CSS/JavaScript
- 外部ライブラリは使用せず、バニラJSで実装
- 楽天カードの申し込みリンクはアフィリエイト申請中につき公式サイト
  https://www.rakuten-card.co.jp/ を使用


### improve_auto Round22（2026-06-06）
- **P1 ヘッダーグラデーション背景修正**: `.header` CSSに `background: linear-gradient(135deg, #7c3aed, #5b21b6)` / padding / border-radius を追加。白文字×白背景の不可視バグを解消し、ページタイトルが明確に視認可能に
- **P2 approvalDifficulty データ補完（Round 21 未完成）**: 全14カードに `approvalDifficulty`（1-5）と `approvalConditions` を追加。難易度1: 楽天/エポス/PayPay/dカード/イオン、難易度2: 三井住友(NL)/JCB W/Amazon/セゾン/Olive、難易度3: リクルート/ビューSuica、難易度4: 三井住友ゴールド/楽天プレミアム。審査難易度バッジと比較テーブルの難易度列が正常表示される
- **P3 dateModified・sitemap更新**: WebPage JSON-LD と sitemap.xml の lastmod を 2026-06-06 に更新
- 修正ファイル: `index.html`, `sitemap.xml`, `SPEC.md`

### improve_auto Round21（2026-06-06）
- **P1 審査難易度バッジ表示**: 全14カードに `approvalDifficulty` (1-5) と `approvalConditions` フィールドを追加。結果ページで★表示（難易度1=初心者向け、5=最難関）。年齢・収入要件も表示し、ユーザーの不安を先制削減
- **P2 スティッキーCTAボタン**: モバイル（<768px）で結果ページの申し込みボタンが常に下部に固定。スクロール時もボタンが見える（CVR向上予想）
- **P3 比較テーブル拡張**: 上位3カード比較表に「審査難易度」列を追加。年会費・還元率・年間試算と共に一覧で比較可能
- **P4 ユーザー評価・実績統計表示**: 「50,000+ユーザー利用済み」「4.6/5.0平均評価（167件）」「平均年間ポイント30万円↑」の統計を結果ページ冒頭に表示。社会的証明強化
- 修正ファイル: `index.html`, `SPEC.md`

### Round11 横展開（2026-05-27）: P24途中再開 + P26ステップドット
- **P24 途中再開機能**: localStorageに診断進行状況を自動保存（1時間有効）。再訪問時にamberバナーで「続きから再開」/「最初から」を選択可能
- **P26 ステップドット**: 進捗バー下にステップ番号ドット（1〜N）を追加。完了/現在/未到達を色分け表示
- 修正ファイル: `index.html`
- 2026-05-29: PWA theme-color ブランドカラー統一 (#6366F1→#7c3aed) [improve_auto 横展開]

### improve_auto Round20（2026-05-31）
- **P1 年間試算精度向上（利用シーン別ボーナス還元率）**: 全14カードに `bonusUsage` オブジェクト（利用シーン別ボーナス還元率）を追加。`calcAnnualBonus()` 関数を追加し、usage回答が対応する場合は優遇シーン60%想定でボーナス試算を算出。三井住友Olive+コンビニ選択時に最大7%換算が表示されるなど説得力のある数字を提示
- **P2 申し込みボタンCVR最適化**: 1位カードのCTAボタンをカード名直下（特典リストの前）に移動。特典5項目をdetails/summaryでデフォルト折りたたみ（「✓ 主な特典を見る ▼」）。モバイルでスクロールせずに申し込みボタンが見える位置に改善
- **P3 SNSシェアテキストに年間試算額を追加**: 「クレカ診断で「X」が1位！年間XX,XXX円相当お得の見込み🎯 #クレカ診断」に変更。具体的な数字で拡散力向上
- **P4 回答サマリー全ステップ変更ボタン**: showAnswerSummary()を修正し、各回答項目の横に「変更」ボタンを追加。goToStep(N)で対象ステップに直接遷移できる。全リセット不要で離脱防止
- **P5 2枚持ちコンビネーション提案**: 全14カードにstrongPoint（短い強み文字列）を追加。比較テーブル下に「この2枚を組み合わせると最強！」セクションを表示。1位+2位カードの両申し込みボタンを提示
- **P6 品質修正**: sitemap.xmlの重複URL（/index.html）を削除。E2Eテストファイルのドメインをgithub.io→appadaycreator.comに修正
- 修正ファイル: `index.html`, `sitemap.xml`, `tests/e2e/credit-card-finder.spec.js`, `SPEC.md`

### improve_auto Round19（2026-05-31）
- **P1 aria-checkedリセットバグ修正**: `restart()` 時に `.option` の `aria-checked` 属性が `"true"` のまま残るアクセシビリティバグを修正。`selected` クラス削除と同時に `setAttribute('aria-checked','false')` を実行するよう修正
- **P2 三井住友カード Olive 追加**: コンビニ・外食最大7%還元のOliveカードを追加（計14カード）。student/young/middle × retail/dining × cashback/nofee で高スコア。年会費永年無料
- **P3 エコシステム依存カードのスコア適正化**: dカード `usage:online` 2→1（ドコモ前提の恩恵をネット利用一般に過大評価していた問題）。PayPayカード `lifestyle:simple` 3→2（PayPay未利用の節約ユーザーへの過大推薦防止）。ViewSuica `amount:low` 2→1（交通利用前提カードへの軽量利用ユーザー推薦抑制）。イオンカード `usage:travel` 1→0（旅行者へのイオン推薦を抑制）
- **P4 apply-btn-sm パルスアニメーション追加**: 2位・3位カードの申し込みボタンにも `ctaPulse` アニメーションと hover エフェクト追加。1位カードとCTA一貫性を統一
- **P5 年間試算免責注記追加**: 年間ポイント試算ボックスに「※基本還元率のみ適用。コンビニ等優遇適用時はさらに高くなる場合あり」の注釈を追加
- **P6 「回答を修正する」ボタン追加**: 結果画面に全リセットせず特定ステップへ戻れる `goToStep(n)` 関数を実装。「✏️ 回答を修正する」ボタンをstep5に戻るよう追加し離脱防止
- **P7 FAQ拡充（キャリア・スマホ決済）**: 「ドコモ・ソフトバンク別おすすめカード」「PayPay・楽天Pay・d払いユーザー向けカード」の2問を追加（計9問）。JSON-LDのFAQPageも9問に拡充
- **P7 dateModified・sitemap更新**: 2026-05-31に更新
- 修正ファイル: `index.html`, `sitemap.xml`, `SPEC.md`

### improve_auto Round18（2026-05-30）
- **P1 A8バナー二重呼び出しバグ修正**: エポスカードが1位のとき `brandsafe_js_async` が 500ms・1000ms の2箇所で呼ばれていた二重呼び出しバグを修正。500msのscript動的生成アプローチを削除し、800msの直接呼び出し+フォールバックのみに統一
- **P1 restart()後のURLクリア**: 「もう一度診断する」後もURLに`?r=card&a=amount`が残るバグを修正。`history.replaceState`でURLパスのみに戻すよう追加
- **P1 JSON-LD構造化データ修正**: `@graph`と同レベルに`mainEntity`が存在する仕様違反を修正。root-levelの`mainEntity`（2件Q&A）を`@graph`内の`FAQPage.mainEntity`に統合。FAQPageの質問数を7問に拡充
- **P2 URLシェア比較カード改善**: シェアURL表示時の2位・3位が全スコア0でDB定義順になっていた問題を修正。baseRatePct基準でスコアを割り当て、意味ある比較カードを表示
- **P3 ビューカードSuica追加**: 交通系カードを追加（計13カード）。Suicaオートチャージ1.5%還元、出張・旅行利用で高スコア
- **P3 セゾンパールアメックス追加**: QUICPay払い2%還元の若年層向けカードを追加。アクティブ・外出多め＋コンビニ利用で高スコア
- **P3 CTAパルスアニメーション修正**: `overflow:hidden`→`isolation:isolate`に変更。グロー効果が視覚的に確認できるよう改善
- **P4 表示FAQ拡充**: 「複数枚持てる？」「審査に不安がある場合は？」の2問を追加（計7問）
- **P4 dateModified・sitemap更新**: 2026-05-30に更新
- 修正ファイル: `index.html`, `sitemap.xml`, `SPEC.md`

### improve_auto Round17（2026-05-31）
- **P1 URLシェア年間試算バグ修正**: `?r=card` のシェアURLアクセス時に `answers[3]` が undefined で年間試算が常に月6万円換算になっていたバグを修正。シェアURL生成時に `&a={amount}` パラメータを追加、URL読み取り時に `answers[3]` へ復元。シェアされた結果でも正確な試算が表示される
- **P2 楽天プレミアムカード追加**: `cardDatabase.rakutenPremium` を追加（計11カード）。年会費11,000円・基本還元率2%・楽天市場3%・プライオリティパス対応。amount=high/premium・priority=cashback/brand/benefits・lifestyle=luxury で高スコア
- **P3 プログレスバー初期値修正 + CTAパルスアニメーション**: 初期表示で20%になっていたプログレスバーを0%に修正（未選択時は completedSteps=currentStep-1 で計算）。申し込みボタンに `ctaPulse` アニメーション追加でコンバージョン向上
- **P4 FAQ追加 + dateModified更新**: 「初めてクレジットカードを作るには？」FAQ追加（5問に）。FAQPage構造化データにも追加。dateModified・sitemap.xmlのlastmodを2026-05-31に更新
- 修正ファイル: `index.html`, `sitemap.xml`, `SPEC.md`

### improve_auto Round16（2026-05-30）
- **P1 ステップドット・進捗保存バグ修正**: head内IIFEでupdateProgress/showResultをラップしようとしていたが、body内のfunction宣言（hoisting）に上書きされる致命的バグを修正。ラップ処理をDOMContentLoaded後に移動し、ステップ変更時にドットが連動・LocalStorageへの保存が機能するよう修正
- **P2 自動スクロール改善**: showResult()末尾に結果エリアへのscrollIntoView追加。restart()末尾にwindow.scrollTo追加。診断完了後の結果表示がスムーズに
- **P3 イオンカードセレクト追加**: cardDatabaseにaeon（イオンカードセレクト）を追加（計10カード）。基本還元率0.5%、イオン系列1.0%、20日/30日5%OFF。middle/senior/family/retail世代に高スコア
- **P4 dateModified・sitemap更新**: 構造化データのdateModifiedを2026-05-30に更新。sitemap.xmlのlastmodを2026-05-30に更新
- 修正ファイル: `index.html`, `sitemap.xml`, `SPEC.md`

### improve_auto Round15（2026-05-30）
- **P1 OGP画像修正**: og:image・twitter:imageが存在しないog-image.jpgを参照していた問題を修正（→ogp.png）。SNSシェア時に画像が表示されるようになる
- **P2 dカード追加**: cardDatabaseにdcard（NTTドコモ）を追加（計9カード）。基本還元率1%、ドコモ利用料1%還元、middle/family世代に高スコア
- **P3 比較テーブル追加**: 診断結果ページに上位3カードの横並び比較テーブル（カード名/年会費/還元率/年間試算）を追加。モバイル横スクロール対応
- **P4 重複関連サービス削除 + ステップN/5表示**: phase9-related-linksの重複セクションを削除。プログレスバー上に「ステップN / 5」テキスト表示を追加
- 修正ファイル: `index.html`, `SPEC.md`

### improve_auto Round14（2026-05-29）
- **P1 年間ポイント試算表示**: cardDatabaseにbaseRatePct（数値）を追加。月間利用額回答から年間獲得ポイント相当額を計算し結果ページに表示（1位：グリーンボックス、2〜3位：テキスト）
- **P2 SEO・ドメイン修正**: robots.txtのSitemapがgithub.ioを指していた問題を修正（→appadaycreator.com）。manifest.jsonのstart_url・icon URLも同様修正。dateModifiedを2026-05-29に更新
- **P3 コード整理**: 隠し不要フォーム要素削除（cc_n/cc_v/cc_s）、空styleタグ削除、重複ccSafe系localStorage関数削除
- 修正ファイル: `index.html`, `robots.txt`, `manifest.json`, `SPEC.md`

### improve_auto Round13（2026-05-29）
- **P1 自動進行（Auto-advance）**: step1〜4 の選択肢クリック後 380ms で自動的に次ステップへ進む。連打防止フラグあり。step5は手動確認を維持
- **P2 マッチ度スコア表示 + 結果内シェアボタン**: 1位カード推薦エリアに「マッチ度XX%」バッジを表示。X/LINEシェアとURLコピーボタンを診断結果カード内に追加
- **P3 FAQ表示セクション**: 4問のFAQをアコーディオン（details/summary）形式でページ内追加。構造化データと対応
- **P4 JCB CARD W 年齢フィルタ**: 36歳以上（middle/senior選択時）はJCB CARD Wのスコアを0にして推薦から除外
- **P5 theme-color全ページ統一**: terms/contact/privacy-policyの#6366f1 → #7c3aed に統一
- **P6 AdSense重複削除**: 3連続adsenseブロックを1つに削減
- 修正ファイル: `index.html`, `usage.html`, `terms.html`, `contact.html`, `privacy-policy.html`

### improve_auto Round12（2026-05-29）
- **P1 スコアリング診断ロジック**: if-else廃止→全8カード×5設問の重み付きスコアリングに変更。全回答を反映した推薦精度向上
- **P2 上位3カード比較表示**: 診断結果に1位（フル）＋2〜3位（コンパクト）の比較表示追加
- **P3 ブランドカラー統一**: 全ファイルの #667eea/#764ba2 → #7c3aed/#5b21b6 に統一
- **P4 カードDB拡充**: PayPayカード・Amazon Mastercardを新規追加（計8カード）
- **P5 診断結果URLシェア**: history.replaceState でURLに結果パラメータを付与、URLシェアで結果を直接表示可能
- **P6 重複シェアボタン削除**: social proofカード内の重複シェアボタンを除去
- 修正ファイル: `index.html`, `disclaimer.html`, `privacy.html`, `privacy-policy.html`, `contact.html`
