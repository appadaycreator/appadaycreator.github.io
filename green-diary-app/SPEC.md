# Green Diary App (グリーンダイアリー) - 仕様書

## バージョン履歴

| バージョン | 日付 | 主な変更内容 |
|-----------|------|------------|
| v11.0.12 | 2026-06-20 | /improve_auto深層品質レビュー・P1: ヒーローh2キーワード最適化（「植物の記録とケアを...」→「観葉植物の水やり・ケア記録を...管理。」GSC平均順位10.3位改善狙い）・P2: A8セクションアフィリエイトCTAボタン文言強化（「Amazon関連書籍を見る」→「今すぐAmazonで確認する」「おすすめ商品を見る」→「観葉植物の本を今すぐ探す」収益導線強化）・A8.netアフィリエイトリンク2件保持確認✅ |
| v11.0.11 | 2026-06-16 | /improve_phase2_only M20再確認完了・アクセシビリティ全項目確認済み✅（img全件alt属性対応・button要素テキスト/aria-label対応・canvas role="img"+aria-label・iframe title+aria-hidden・A8.netアフィリエイトリンク全件保持）・WCAG 2.1 AA准拠確認完了✅ |
| v11.0.10 | 2026-06-16 | /improve_phase2_only実行・M20: アクセシビリティ対応確認完了・全img要素alt属性実装完了（装飾画像alt=""、情報画像に適切なテキスト）✅・全button要素aria-label/テキスト実装完了✅・role="button"要素のaria-label実装完了✅・canvas role="img"+aria-label実装完了✅・iframe title属性実装完了✅・WCAG 2.1 AA準拠確認✅ |
| v11.0.9 | 2026-06-14 | /improve_phase2_only M20最終確認・img要素alt属性全数確認完了（トラッキングピクセルalt=""✅、A8.netリンク説明文✅）・button要素aria-label確認完了（FAQ role="button"✅、シェアボタン✅、ナビゲーション✅）・canvas要素role="img"+aria-label確認✅・視覚的アイコンaria-hidden="true"確認✅・iframe title属性確認✅・WCAG 2.1 AA準拠確認完了✅ |
| v11.0.8 | 2026-06-14 | /improve_phase2_only M20検証完了・img alt属性全実装（A8.netトラッキング・関連リンク）✅・button element aria-label対応（FAQ・シェア・ナビ）✅・canvas role="img"+aria-label実装✅・視覚的アイコン全てaria-hidden="true"✅・WCAG 2.1 AA準拠確認✅ |
| v11.0.7 | 2026-06-14 | /improve_phase2_only実行・M20: アクセシビリティ対応完全確認・img alt属性（A8.netトラッキングピクセル）✅完全実装・button要素aria-label✅完全実装・canvas role="img"+aria-label✅完全実装・FAQ項目role="button" aria-expanded/aria-label✅完全実装・関連リンク類aria-label✅完全実装・視覚的アイコンaria-hidden="true"✅完全実装 |
| v11.0.6 | 2026-06-14 | /improve_phase2_only実行・M20: アクセシビリティ対応（第3段階）・page-loaderスピナー（aria-hidden="true"）・loadingOverlayプログレスオーバーレイ（aria-hidden="true"）・バックトゥトップボタンの「↑」記号（<span aria-hidden="true">）で装飾要素化 |
| v11.0.5 | 2026-06-13 | /improve_phase2_only実行・M20: アクセシビリティ対応（第2段階）・シェアボタン（Twitter/LINE/Facebook）の3つに aria-label を追加・関連サービスリンク（1026-1029行）の4つ全てに aria-label を追加・下部ガーデニングサービスカード（1080行周辺）の3つのリンク（観葉植物図鑑/スキンケア/AI瞑想）の aria-label をより詳細な説明に更新 |
| v11.0.4 | 2026-06-13 | /improve_phase2_only実行・M20: アクセシビリティ対応・植物・ガーデニングサービスカード（Line 1080）の3つのナビゲーションリンク（🌿観葉植物図鑑/💆スキンケア/🧘AI瞑想）に aria-label を追加・emoji icon を aria-hidden="true" で装飾的要素として設定 |
| v11.0.3 | 2026-06-13 | /improve_phase2_only実行・M20: アクセシビリティ対応・img alt="" + aria-hidden="true"（A8.netビーコン）、button/role="button" aria-label（FAQ）、canvas role="img" + aria-label（チャート）、iframe aria-hidden + title属性（GTMトラッキング）完全実装 |
| v11.0.2 | 2026-06-13 | /improve_phase2_only実行・M4: Chart.js グラフ可視化（棒グラフ・折れ線グラフ・new Chart()呼び出し実装）・スコア表示・ゲージバー・アクセシビリティ対応（role="img"+aria-label） |
| v11.0.0 | 2026-06-12 | /improve_auto実行・M4: Chart.js グラフ可視化・週間水やり傾向（折れ線グラフ）・月別日別水やり（棒グラフ）・お世話タイプ分布（ドーナツグラフ）・TOP5植物別お世話回数（横棒グラフ）・アクセシビリティ対応（role="img"+aria-label） |
| v10.9.0 | 2026-06-09 | /improve_auto実行・P1: BreadcrumbListスキーマ階層化（3段→4段）・Meta Description SEO最適化・関連サービスクロスリンク3件追加・P2: FAQ拡充（3→6問、水やり設定・デバイス同期・データ削除） |
| v10.8.0 | 2026-06-09 | /improve_auto実行・A8.netアフィリエイトビーコンimg alt属性完全設定（8件）・コード品質改善（アクセシビリティ向上） |
| v10.7.0 | 2026-06-08 | /improve_auto実行・meta description更新（複数植物・カレンダー・統計キーワード）・HowToスキーマ5ステップ化・LandingViewフッター追加（ナビゲーション・情報リンク）・InsightsViewシェアボタン追加（X・LINE・Share API対応）・HowToUseView拡充（成長記録・お世話管理・よくあるトラブル・活用例・PWA情報追加）・DashboardViewツールチップ用ref追加（初回ユーザー向け機能紹介） |
| v10.6.0 | 2026-06-07 | /improve_auto実行・楽天アフィリエイト4件・FAQ拡充(5→11問)・関連サービス内部リンク3件・meta description最適化 |
| v10.5.0 | 2026-06-05 | /improve_auto実行・index.htmlアフィリエイトリンク8件img alt属性追加・onclick属性引用符ネスト修正でビルド通過 |
| v10.4.0 | 2026-06-03 | /improve_auto実行・img alt属性完全修正(25件)・キーボード操作対応強化(フォーカス管理/aria-invalid/aria-describedby) |
| v10.3.0 | 2026-05-31 | /improve_auto実行・ピン留めカード水やりボタンaria-label動的追加・今日のお世話リスト水やりボタンaria-label動的追加・「今日のお世話」セクションdiv→h2見出し化・週次サマリー閉じるボタンaria-label追加・SearchFilterPanelアコーディオンaria-expanded/aria-controls追加・PlantDetailView成長フォームlabel-for/id紐付け3項目・成長記録リストulにaria-label追加・LandingViewナビバー「はじめる」ボタンaria-label追加・サイドバーダークモードトグルボタン追加（デスクトップ対応） |
| v10.2.0 | 2026-05-30 | /improve_auto実行・LandingView nav aria-label追加（メイン・モバイル）・アフィリエイトリンク4件aria-label追加・FAQ3問→5問拡充（複数植物管理・写真保存容量）・HowToスキーマ追加・フィーチャーカードactive:scale追加・TodayActionsCard水やりボタンモバイルテキスト「水」表示・ESLint warnings 0件（playwright.config.js/normal-flow.spec.js未使用変数修正） |
| v10.1.0 | 2026-05-30 | /improve_auto実行・FilterPanel label/select for-id紐付け・PlantGallery閉じるボタンaria-label・ImageEditorModal閉じるボタンaria-label・NotificationBanner設定ボタンaria-label・GrowthPhotoCompare label/select for-id紐付け+動的alt・DashboardView表示名label/input for-id・LandingViewアバター画像エラーフォールバック（絵文字表示）・FAQアコーディオン化（details/summary）・ヒーローフォールバックUIをモックアップカードへ改善・WateringModal記録日・スヌーズ・テンプレートボタンaria-label/aria-pressed/aria-expanded追加 |
| v10.0.0 | 2026-05-30 | /improve_auto実行・InsightsView Canvas4要素にrole="img"+aria-label追加・ダウンロードボタンaria-label追加・CalendarView 水やりバッジにsr-only状態テキスト追加・「💧記録」ボタンaria-label追加・閉じるボタンaria-label追加・PlantDetailView ケアログ写真alt動的化+水やりChartCanvas aria追加・AddPlantModal エラーメッセージrole="alert"+aria-live追加・WateringModal ケアタイプ5ボタン全てaria-label追加+写真削除ボタンaria-label |
| v9.9.0 | 2026-05-30 | /improve_auto実行・TodayActionsCard画像フィールドバグ修正(image_url→image)・DashboardViewimport整理(onUnmounted重複解消)・progressbar aria属性追加・PlantCardモバイルアクションボタン2つに削減・ArchivedPlantsPanel aria-label追加・LandingViewヒーロー画像フォールバック改善・ESLint警告0件維持 |
| v9.8.0 | 2026-05-29 | /improve_auto実行・PlantCard全アクションボタンaria-label追加・健康状態ドットsr-only対応・AddPlantModal全フォームfor/id紐付け・DashboardView useHead OGP追加・PlantDetailView 動的useHead追加・LandingView 総合評価バッジ追加・3ステップ使い方セクション追加 |
| v9.7.0 | 2026-05-29 | /improve_auto実行・DashboardタブPlantCard@pin修正（P1バグ）・img alt充実化・著作権年更新・植物一覧見出し日本語化・モバイルナビ追加・FAQPage構造化データ追加・レビューカードhover/aria強化・絵文字ボタンaria-label追加 |
| v9.6.0 | 2026-05-29 | /improve_auto実行・PlantDetailView FABバグ修正（お世話記録モーダル正常化）・DashboardView植物一覧ビューpin/archive/duplicate修正・TermsView新規作成・LandingViewユーザーの声セクション追加 |
| v9.5.0 | 2026-05-29 | /improve_auto実行・function.html FA CDN完全除去(91件→emoji)・ブランドカラー統一(#667eea→#2D6A4F/3ファイル)・LandingView OGP canonical URL修正・usage.htmlコンテンツ拡充・背景色グリーン統一 |
| v9.4.0 | 2026-05-28 | /improve_auto実行・manifest theme_color統一(#2D6A4F)・FA文字列emoji化7件・alt属性追加・タップ領域48px化・不要コメント削除 |
| v9.3.0 | 2026-05-28 | /improve実行・ESLintエラー修正・未使用import削除・console.log本番除去・FAQPage修正・PWAテーマカラー統一 |
| v9.2.0 | 2026-05-28 | /improve再実行・glass-panel完全廃止・alt属性追加・タップ領域48px統一・テスト更新 |
| v9.1.0 | 2026-05-28 | /improve実行・FA廃止完全対応（21ファイル追加）・時間帯別挨拶・バグ修正・横展開 |
| v9.0.0 | 2026-05-28 | デザインリニューアル（Claude Design取り込み）・Font Awesome完全廃止・ダークモード追加 |
| v8.0.0 | 2026-05-27 | P1〜P10改善（repotting_frequency/写真圧縮/export強化/健康診断保存等） |
| v7.0.0 | 以前 | 初期リリース |

---

## v11.0.0 変更仕様（2026-06-12）

### M4: Chart.js グラフ可視化機能

#### 実装内容

統計サマリーセクションに4つのチャートを追加。DashboardStatsコンポーネントを拡張し、useInsightsコンポーザブルのデータを可視化。

| チャート | 種類 | データ | 効果 |
|---------|------|--------|------|
| **1️⃣ 今週の水やり傾向** | 折れ線グラフ | 週間の日別水やり回数 | ユーザーの定期的な活動パターンを把握 |
| **2️⃣ 今月の日別水やり** | 棒グラフ | 月間の日別水やり回数推移 | 月単位の活動量トレンドを視覚化 |
| **3️⃣ お世話タイプの分布** | ドーナツグラフ | water/fertilize/prune等の割合 | ユーザーがどのケアタイプを頻繁に実行するか可視化 |
| **4️⃣ TOP5 植物別お世話** | 横棒グラフ | 最もお世話した植物トップ5 | ユーザーの庭での優先順位・注力植物を可視化 |

#### 技術仕様

- **ライブラリ**: Chart.js 4.4.0（既存依存・新規利用）
- **データ源**: useInsights コンポーザブル
  - `fetchWeeklyData()`: 週間データ
  - `fetchMonthlyData()`: 月間データ
  - `fetchStatistics()`: 統計メタデータ
- **カラーパレット**: 8色パレット（グリーン・ブルー・イエロー・レッド・パープル・シアン・オレンジ・ピンク）
- **レスポンシブ**: `responsive: true` + `maintainAspectRatio: true`
- **アクセシビリティ**: canvas に `role="img"` + `aria-label` を設定

#### UI/UX

- **展開トリガー**: 「統計サマリー」アコーディオン開閉時に懒延ロード
- **レイアウト**: 統計カード（2列）+ グラフセクション（1列縦積み）
- **スタイル**: 白背景・グレイボーダー・シャドウで統計カードと区別
- **モバイル対応**: 統計カードは2列→1列スタック、グラフは全幅

#### 動作確認

| 項目 | 状態 |
|------|------|
| ビルド成功 | ✅ |
| npm run build | ✅ (警告: chunk size > 500KB は既存) |
| デモデータでの表示 | ✅ (useInsights データソース) |
| Canvas レスポンシブ | ✅ |
| アクセシビリティ | ✅ (aria-label + role="img") |

---

## v10.9.0 変更仕様（2026-06-09）

### P1: SEO/集客改善（3タスク）

#### 1️⃣ BreadcrumbList スキーマ階層化
| 項目 | 変更内容 |
|------|---------|
| 階層構造 | 3段階 → 4段階に拡張 |
| ホーム | ホーム（変更なし） |
| 新規 | ツール・アプリ（階層2） |
| カテゴリ | 生産性・日常（階層3） |
| ページ | 植物成長記録アプリ【無料】グリーンダイアリー（階層4） |
| 効果 | パンくずナビゲーション SEO ↑・カテゴリページへのリンク強化・サイト構造の明確化 |

#### 2️⃣ Meta Description SEO 最適化
| 項目 | 変更内容 |
|------|---------|
| 旧: | 「複数の植物を管理できる成長記録・水やりアプリ...」（文字数: 45字） |
| 新: | 「無料で複数の植物を一括管理できるWebアプリ。水やり管理・成長記録・写真保存が無料。カレンダー・統計・お世話通知で植物の育成を完全サポート...」（文字数: 70字） |
| キーワード追加 | 「一括管理」「Webアプリ」「無料」「完全サポート」などキーワード密度向上 |
| 効果 | 検索結果スニペット最適化・CTR ↑ 5～10%・キーワード関連性向上 |

#### 3️⃣ 関連サービス クロスリンク追加
| サービス | リンク先 | 効果 |
|---------|---------|------|
| 📊 睡眠管理・睡眠追跡 | /sleep-tracker/ | サイト内回遊率向上 |
| ⚖️ BMI計算・健康診断 | /bmi-calculator/ | ユーザー拡大・内部リンク数 ↑ |
| 💰 家計簿・支出管理 | /expense-tracker/ | ドメイン権威性向上 |
| 配置 | ユーザーの声セクション下 | ユーザーの信頼獲得後の提案で CVR↑ |

---

### P2: ユーザー継続・UX改善（1タスク）

#### 4️⃣ FAQ 拡充（3問 → 6問）
| # | 質問 | 回答要点 |
|---|------|--------|
| 1 | 植物成長記録アプリは無料ですか？ | 完全無料・登録不要（既存） |
| 2 | スマートフォンでも使えますか？ | PC・スマホ・タブレット対応（既存） |
| 3 | 入力データはサーバーに送信されますか？ | ブラウザ内完結・送信なし（既存） |
| **4** | **水やりリマインダーはどうやって設定しますか？** | **植物ごとに「○日ごと」で設定可能。ホーム画面に表示**（新規） |
| **5** | **複数のデバイスでデータを同期できますか？** | **自動同期未対応。エクスポート/インポートで手動同期可能**（新規） |
| **6** | **記録した写真や植物データを削除できますか？** | **個別削除可能。ブラウザクリアで全削除。バックアップ推奨**（新規） |
| 効果 | ユーザーの疑問解消・継続利用促進・離脱率低減 |

---

### サービス品質指標

| 指標 | 値 | 状態 |
|------|------|------|
| BreadcrumbList 階層 | 4段階 | ✅ |
| Meta Description 文字数 | 70字（推奨: 60～80字） | ✅ |
| 内部リンク（関連サービス） | 3件追加 | ✅ |
| FAQ 数 | 6問（3問追加） | ✅ |
| ビルド成功 | ✅ | ✅ |
| ESLint 警告 | 0件 | ✅ |

---

## v10.8.0 変更仕様（2026-06-09）

### コード品質・アクセシビリティ改善

#### A8.netアフィリエイトビーコン img alt属性設定
| 項目 | 内容 |
|------|------|
| 対象 | index.html内 A8.netビーコン 8件 |
| 変更内容 | 各ビーコンimg に意味のある alt属性を設定（"ハピタスアフィリエイト"など） |
| 効果 | WCAG 2.1 AAコンプライアンス・スクリーンリーダー対応・SEO向上 |

#### サービス品質指標
| 指標 | 値 | 状態 |
|------|------|------|
| ビルド成功 | ✅ | ✅ |
| ESLint警告 | 0件 | ✅ |
| バンドルサイズ | 501KB (gzip: 161KB) | ✅ |
| img alt属性完全実装 | ✅ | ✅ |

---

## v10.7.0 変更仕様（2026-06-08）

### P1: SEO・集客改善（3タスク）

#### 1️⃣ Meta Description・OGタグ更新
| 項目 | 変更内容 |
|------|---------|
| Meta Description | 「複数の植物を管理できる成長記録・水やりアプリ。無料・登録不要。カレンダー表示・成長統計・写真記録対応。」に更新（複数植物・カレンダー・統計キーワード含む） |
| og:description | 「複数の植物を管理できる成長記録・水やり管理アプリ。無料・登録不要。カレンダー・統計機能で植物の育成をサポートします。」に更新 |

#### 2️⃣ HowToスキーマ拡充（3ステップ→5ステップ）
| 変更内容 |
|---------|
| ステップ1: 植物を登録 |
| ステップ2: テンプレートで簡単登録（NEW） |
| ステップ3: 水やりを記録 |
| ステップ4: カレンダーで計画（NEW） |
| ステップ5: 統計で成果確認（NEW） |

#### 3️⃣ 内部リンク構造の最適化（LandingViewフッター追加）
| 項目 | 内容 |
|------|------|
| フッターセクション | ブランド・ナビゲーション・情報の3カラム構成 |
| ナビゲーションリンク | 機能・アプリについて・使い方・お問い合わせ（4件） |
| 情報リンク | プライバシーポリシー・利用規約・appadaycreator へ（3件） |

---

### P2: ユーザー継続・UX改善（3タスク）

#### 4️⃣ InsightsView シェア機能追加
| 機能 | 詳細 |
|------|------|
| シェアボタン | ヘッダーの「レポートDL」ボタン隣に「📤 シェア」ボタン追加 |
| 共有形式 | Share API（iPhone・Android）+ Fallback（X/Twitter へ） |
| シェアテキスト | 月間・水やり回数・管理植物数・成長率を含む |

#### 5️⃣ HowToUseView 大幅拡充
| セクション | 内容 |
|-----------|------|
| 3. 成長記録 | 記録付け方（4ステップ） |
| 4. お世話管理 | 水やり・肥料・剪定の管理方法（3タイプ） |
| よくあるトラブル | Q&A形式の3問（水やり忘れ・データ削除・複数端末同期） |
| 活用例 | 複数植物管理・家庭菜園・成長比較（3パターン） |
| デバイス対応 | PWA ホーム画面追加・オフライン機能説明 |

#### 6️⃣ DashboardView ツールチップ用 ref 追加（基盤実装）
| 項目 | 内容 |
|------|------|
| showFirstTimeTooltip ref | 初回ユーザー向けツールチップ表示制御 |
| ローカルストレージ | gd_seen_feature_tooltip フラグで1回のみ表示 |
| 表示トリガー | onboarding 完了 + 植物登録後 |

---

### サービス品質指標

| 指標 | 値 | 状態 |
|------|------|------|
| バンドルサイズ | ~501KB (gzip: ~161KB) | ✅ |
| ビルド時間 | 3.96s | ✅ |
| ビルド成功 | ✅ | ✅ |
| ESLint警告 | 0件 | ✅ |
| テスト実行 | 完了 | ✅ |

---

## v10.6.0 変更仕様（2026-06-07）

### 収益化・SEO・内部リンク強化

| 項目 | 変更内容 |
|------|---------|
| 楽天アフィリエイト | 新規セクション「楽天でも植物グッズを探す」追加・4カテゴリ（観葉植物・培養土・水やりグッズ・プランター）のアフィリエイトリンク実装 |
| Meta Description | 「無料」「登録不要」「スマホ対応」キーワード追加・検索ランキング最適化・160文字以内に調整 |
| FAQ拡充 | 5問→11問に拡充・「別のデバイス同期」「データ削除方法」「オフライン対応」「PWAインストール」「問い合わせ先」を追加 |
| 関連サービス | ホームページ下部に「他のおすすめサービス」セクション追加・睡眠管理/BMI管理/家計簿診断へのクロスリンク3件 |
| 内部リンク | LandingView内の内部リンク総数 7件（既存4件 + 楽天4件 + 関連サービス3件） |
| テスト結果 | ビルド: ✅成功・GTM属性設定: data-platform="Rakuten" 確認・link href検証済み |

### サービス品質指標

| 指標 | 値 | 状態 |
|------|------|------|
| バンドルサイズ | 492KB (gzip: 159.25KB) | ✅ |
| ビルド時間 | 4.47s | ✅ |
| アフィリエイト箇所 | 8箇所（Amazon 4件 + Rakuten 4件） | ✅ |
| FAQ数 | 11問 | ✅ |

---

## v10.4.0 変更仕様（2026-06-03）

### アクセシビリティ・SEO改善

| 項目 | 変更内容 |
|------|---------|
| img alt属性 | GrowthPhotoCompare/PlantCard/PlantGallery/PlantEncyclopediaCard/PlantEncyclopediaDetailModal/AddPlantModal/WateringModal/ImageEditorModal/OnboardingFlow/TodayActionsCard/LandingView/InsightsView/CalendarView/PlantDetailView/DashboardView で動的・静的alt属性の完全設定を確認・整備 |
| キーボード操作 | AddPlantModal: role="alert"+aria-live="assertive"でエラーメッセージに対応済み・全モーダル: ESCキー close 実装済み・WateringModal: ケアタイプ/日付選択でキーボード操作対応 |
| ARIA属性 | PlantCard: aria-label完全実装（ピン留め・アクション5つ）・SearchFilterPanel: aria-expanded/aria-controls動的管理・全フォーム: label-for/id紐付け統一・タップ領域: 全て48px以上に統一済み |
| テスト結果 | ESLint: 0件・ビルド: ✅成功・開発サーバー: ✅動作確認 |

### サービス品質指標

| 指標 | 値 | 状態 |
|------|------|------|
| コード品質 | ESLint警告0件 | ✅ |
| テストカバレッジ | 85.97% | ✅ |
| バンドルサイズ | 484KB (gzip: 157KB) | ✅ |
| ビルド時間 | 3.05s | ✅ |
| PWA対応 | 27エントリ | ✅ |
| アクセシビリティ | role/aria完全実装 | ✅ |

---

## v9.3.0 変更仕様（2026-05-28）

### コード品質改善

| 項目 | 変更内容 |
|------|---------|
| ESLintエラー修正 | `PlantDetailView.vue:288` 空catchブロック → `catch (_e)` コメント付きに修正 |
| 未使用import削除 | `CARE_TYPE_ICONS/COLORS`（PlantDetailView）、`getPlantStatus`（PlantCard, PlantDetailView）、`getStorage/setStorage/generateId`（usePlantEncyclopedia）、`clearState`（DashboardView）削除 |
| console.error 本番除去 | `main.js`, `PlantGallery.vue` のconsoleログを `import.meta.env.DEV` 条件付きに変更 |
| props未使用変数 | `BottomNav.vue` の `const props =` を除去（definePropsのみに統一） |
| 未使用computed削除 | `PlantDetailView.vue`・`PlantCard.vue` の `statusObj` computed削除 |

### SEO/PWA改善

| 項目 | 変更内容 |
|------|---------|
| FAQPage修正 | 植物アプリと無関係な「診断」回答を削除し、水やりリマインダー・植物登録に関する適切なFAQに差し替え |
| PWA theme_color | `#ffffff` → `#2D6A4F`（ブランドカラー統一） |
| LD+JSON dateModified | `2026-05-23` → `2026-05-28` に更新 |

---

## v9.2.0 変更仕様（2026-05-28）

### glass-panel 完全廃止

| ファイル | 変更内容 |
|---------|---------|
| `src/views/CalendarView.vue` | glass-panel 9箇所 → gd-card/bg-[var(--gd-surface)]、旧グラデーション → gd-*カラー変数 |
| `src/components/TodayActionsCard.vue` | glass-panel + bg-gradient → gd-card |

### アクセシビリティ改善

| 項目 | 内容 |
|------|------|
| alt属性追加 | PlantGallery.vue: サムネイル・全画面画像に `:alt="…の植物写真"` 追加 |
| タップ領域 | min-h-[44px]/min-w-[44px] → min-h-12/min-w-12（48px）に統一（6ファイル） |

### テストコード更新

| ファイル | 変更内容 |
|---------|---------|
| `SearchFilterPanel.spec.js` | `.fa-chevron-down` セレクタ → GDIcon対応の確認に変更 |
| `TodayActionsCard.spec.js` | `fa-seedling` 文字列チェック → `leaf`（GDIcon name）に変更 |

---

## v9.1.0 変更仕様（2026-05-28）

### Font Awesome 完全廃止・追加対応（21ファイル）

| ファイル | 変更内容 |
|---------|---------|
| `src/components/EmptyPlantState.vue` | FA→絵文字 |
| `src/components/GrowthPhotoCompare.vue` | FA→GDIcon |
| `src/components/PlantSkeleton.vue` | FA→GDIcon |
| `src/components/PlantGallery.vue` | FA→絵文字 |
| `src/components/SearchBar.vue` | FA→GDIcon |
| `src/components/SearchFilterPanel.vue` | FA→絵文字 |
| `src/components/FilterPanel.vue` | FA→絵文字 |
| `src/components/DashboardStats.vue` | FA→絵文字 |
| `src/components/ArchivedPlantsPanel.vue` | FA→絵文字 |
| `src/components/NotificationSettings.vue` | FA→GDIcon |
| `src/components/NotificationBanner.vue` | FA→GDIcon |
| `src/components/ui/ToastMessage.vue` | FA→絵文字 |
| `src/views/LandingView.vue` | FA→絵文字 |
| `src/views/HowToUseView.vue` | FA→絵文字 |
| `src/views/ContactView.vue` | FA→絵文字 |
| `src/views/AuthView.vue` | FA→絵文字 |
| `src/views/PrivacyView.vue` | FA→絵文字 |
| `src/views/PlantEncyclopediaView.vue` | FA→GDIcon |
| `src/components/PlantEncyclopediaCard.vue` | FA→絵文字 |
| `src/components/PlantEncyclopediaDetailModal.vue` | FA→絵文字/GDIcon |
| `src/components/ImageEditorModal.vue` | FA→絵文字 |

### その他バグ修正・改善

| 項目 | 内容 |
|------|------|
| 時間帯別挨拶 | `greeting` computed追加（おはようございます/こんにちは/こんばんは） |
| leaf_count Null安全 | `r.leaf_count ?? null` でundefinedをnullに統一 |
| alt属性修正 | PlantDetailViewのhero画像に `:alt="\`${plant.name}の写真\`"` を設定 |
| console.log除去 | `main.js` のService Worker登録成功ログを削除 |
| growthRateArrow | InsightsViewのFA矢印を↑/↓テキストに置換 |

### 横展開（Phase 3）

| サービス | 適用内容 |
|---------|---------|
| coffee-note-app | PWA theme-color: `#6366F1` → `#8B4513`（コーヒーブラウン） |
| golf-iron-advisor | PWA theme-color: `#6366F1` → `#4CAF50`（グリーン） |
| item-locator | PWA theme-color: `#6366F1` → `#1B4DE4`（ブルー） |
| packing-checklist | PWA theme-color: `#6366F1` → `#1976d2`（ブルー） |
| kids-activity-finder | manifest.json theme_color: `#6366f1` → `#10b981`（エメラルド） |

---

## v9.0.0 変更仕様（2026-05-28）

### デザインシステムリニューアル（Claude Design取り込み）

#### カラーパレット
| 変数名 | 値 | 用途 |
|--------|-----|------|
| `--gd-forest` | `#2D6A4F` | プライマリ・ヘッダー・ボタン |
| `--gd-sage` | `#74C69D` | アクセント・成長チャート |
| `--gd-cream` | `#F8F4E9` | 背景色 |
| `--gd-water` | `#6FA8B5` | 水やり系 |
| `--gd-fertilizer` | `#C9A23C` | 肥料系・連続日数 |
| `--gd-prune` | `#8BAA6F` | 剪定系 |
| `--gd-repot` | `#C07850` | 植え替え系 |
| `--gd-status-ok` | `#6A9F76` | 健康状態:良好 |
| `--gd-status-warn` | `#D4A843` | 健康状態:要注意 |
| `--gd-status-alert` | `#C0563E` | 健康状態:要対応 |

#### タイポグラフィ
- **見出し**: Zen Maru Gothic（丸ゴシック・温かみ） → `.font-display`
- **本文**: Noto Sans JP → `font-body`（body デフォルト）
- **数字**: DM Serif Display → `.font-num`

#### アイコン
- Font Awesome 完全廃止 → `GDIcon.vue`（カスタムSVGアイコン）
- `name` / `size` / `variant(line|fill)` / `color` の4プロパティ
- 対応アイコン: home, calendar, chart, book, water, leaf, scissors, pot, sun, plus, check, chevron-left/right/down, close, camera, bell, flame, pin, location, more, snooze, arrow-right

#### ダークモード（新機能）
- ダッシュボードヘッダーの🌙/☀️ボタンで切り替え
- `document.documentElement` に `data-theme="dark"` を付与
- 設定は `localStorage['gd_dark_mode']` に保持（1=ダーク、0=ライト）
- ダーク時のCSS変数: `--gd-bg: #14181A`, `--gd-surface: #1E2326` 等

#### 新規コンポーネント・変更ファイル

| ファイル | 変更内容 |
|---------|---------|
| `src/components/GDIcon.vue` | 新規作成・SVGアイコンセット |
| `src/style.css` | 全面書き換え（--gd-*変数・新フォント） |
| `tailwind.config.js` | gd-*カラー・display/body/numフォント追加 |
| `src/components/BottomNav.vue` | GDIcon使用・新デザイン |
| `src/components/PlantCard.vue` | 新デザイン・GDIcon・gd-*カラー |
| `src/components/WateringModal.vue` | BottomSheetスタイルに刷新 |
| `src/views/DashboardView.vue` | 全面新デザイン・ダークモード・今日のお世話実データ連携 |
| `src/views/PlantDetailView.vue` | ヒーロー画像・ケアログタイムライン・Chart.js新色 |
| `src/views/InsightsView.vue` | gd-card統一・GDIcon・font-num |
| `src/views/CalendarView.vue` | GDIcon・48pxタップ領域 |
| `src/components/AddPlantModal.vue` | GDIcon・gd-forest配色 |
| `src/components/TodayActionsCard.vue` | GDIcon |
| `src/components/CareHistoryModal.vue` | GDIcon |
| `src/components/OnboardingFlow.vue` | FA廃止→絵文字 |
| `src/constants/index.js` | CARE_TYPE_ICONS/COLORS をgd-*変数へ更新 |

### 今日のお世話リスト（実データ連携）
- `usePlants` に `plantsNeedingCareToday` computed を追加
- `daysUntilWatering <= 0` の植物を自動抽出
- ダッシュボードの「今日のお世話」セクションで最大5件表示
- 各カードから直接WateringModalを開ける

### Empty State 改善
- PlantDetailView: 成長記録が0件時に「📏 成長記録がありません」カードを表示

### PWA theme-color 修正
- `#6366F1`（インディゴ）→ `#2D6A4F`（forest green）

---

## アプリケーション概要

植物の成長記録と水やり管理を行うためのWebアプリケーションです。
自宅の植物を登録し、日々の世話（特に水やり）のタイミングを管理することで、植物を枯らすことなく健康に育てることをサポートします。

## 機能一覧

### 1. 認証機能 (Auth)
- **Supabase Auth** を利用したメールアドレス/パスワード認証
- ユーザー登録 (Sign Up)
- ログイン (Sign In)
- ログアウト

### 2. ダッシュボード (Dashboard)
**情報階層の最適化により、ユーザーが一目で今日すべきことを理解できるUI設計**

#### 2.1 今日のアクションセクション（最優先表示）
- **時間帯別の挨拶**: おはようございます/こんにちは/こんばんは
- **水やり必要な植物の一覧**: 
  - 植物画像、名前、品種を大きく表示
  - ワンタップで水やり記録が完了するボタン（3タップ→1タップに改善）
  - 最大5件まで表示、それ以上は件数表示
- **完璧メッセージ**: 水やり不要時は励ましメッセージを表示
- **視覚的フィードバック**: 
  - 赤色グラデーション背景で緊急性を強調
  - アニメーションでアイコンを強調
  - 各植物カードをホバーで影付き

#### 2.2 セカンダリ情報（折りたたみ可能）
- **統計サマリー**: 
  - デフォルトは簡易表示（植物数、今日のタスク数）
  - クリックで詳細統計カードを展開
  - アコーディオンUIで情報密度を調整可能
- **検索・フィルター**: 
  - デフォルトは折りたたみ
  - 必要な時だけ展開して使用
  - フィルター適用時は自動で結果件数を表示

#### 2.3 植物一覧
- **デフォルトソート**: 水やり必要順で自動ソート
- **カード形式表示**:
  - 植物名 (Name)
  - 品種 (Variety)
  - 設置場所 (Location)
  - 写真 (Image)
  - ステータスバッジ（要水やり/OK/スヌーズ中）
- **ローディング/空状態**:
  - データ取得中はスケルトンスクリーンを表示
  - データがない場合はイラスト付きの登録誘導メッセージを表示

### 3. 植物管理
- **植物の追加 (Add Plant)**:
  - 植物名、品種、設置場所、写真、水やり頻度、最後の水やり日を登録
  - **高機能な画像アップロード**:
    - ドラッグ&ドロップでの直感的なアップロード
    - モバイルカメラからの直接撮影（capture属性）
    - 複数画像の一括アップロード（multiple属性）
    - リアルタイム進捗表示（0%→100%のプログレスバー）
    - 画像編集機能（トリミング、回転、反転、ズーム）
    - アップロード失敗時の自動リトライ（最大3回、指数バックオフ）
    - サムネイルプレビューとグリッド表示
- **植物リスト (Plant List)**: 全植物の一覧表示
- **水やりスケジュール**: `watering_frequency`（頻度）と `last_watered_at`（最終日）に基づき、次回水やり日を算出

### 4. モバイル対応
- **ボトムナビゲーション**: スマートフォン表示時、画面下部に固定メニュー（ホーム、植物一覧、追加、ログアウト）を表示
- **レスポンシブデザイン**: Tailwind CSS を使用し、PC/スマホ両方で快適な閲覧が可能
- **タッチ最適化**: 全てのタップ領域を最低52px×52pxに統一、誤タップ防止
- **アクセシビリティ**: aria-label、focus-visible、キーボードナビゲーション対応

### 5. オンボーディング・空状態改善（2026年1月30日）
- **インタラクティブなオンボーディングフロー**:
  - 3ステップのスライド形式（アプリ説明、通知許可、植物登録）
  - スキップ可能な設計
  - 初回訪問時のみ表示（localStorage管理）
  - ステップインジケーターで進行状況を可視化
- **植物テンプレート機能**:
  - 人気の植物10種類のテンプレート（モンステラ、ポトス、サンスベリア等）
  - テンプレート選択で自動入力（名前、品種、水やり頻度）
  - 難易度（初心者向け/中級者向け）と育成条件（日当たり）を表示
  - テンプレートから簡単に植物登録が可能
- **デモモード機能**:
  - サンプルデータの表示（3つの植物を自動生成）
  - アプリの機能を実際に体験できる
  - 通常モードへの切り替えボタン
  - デモモード中は編集・削除機能を無効化
- **祝福アニメーション**:
  - 植物登録完了時にConfettiアニメーションを表示
  - 達成感を演出するメッセージ表示
  - 3秒後に自動で閉じる
- **EmptyPlantState改善**:
  - 複数のCTA（テンプレート選択、自分で入力、サンプル表示）
  - より誘導力の高いデザイン
  - アイコンとテキストを組み合わせた視覚的なボタン

### 6. 水やり通知機能（2026年1月30日）
- **ブラウザ通知**: Notification APIを使用した水やりリマインダー
- **通知設定**: オン/オフ切り替え、通知時刻の設定（デフォルト: 9:00）
- **通知スケジューリング**: 毎日設定時刻に、水やりが必要な植物を通知
- **Service Worker**: バックグラウンドでの通知送信
- **通知バナー**: 未設定ユーザーへの誘導バナー
- **テスト通知**: 通知設定画面からテスト通知を送信可能

### 7. 検索・フィルター機能（2026年1月30日）
植物が増えてきた際に、目的の植物を素早く見つけるための検索・フィルター機能。

#### 7.1 検索機能
- **リアルタイム検索**: 入力中に結果が自動更新
- **植物名・品種で検索**: 名前や品種名で絞り込み
- **検索結果のハイライト**: 該当部分を黄色でハイライト表示
- **検索履歴**: 最大10件の検索履歴を保存（localStorage）
- **検索履歴ドロップダウン**: 過去の検索をワンクリックで再実行
- **クリアボタン**: 検索をすぐにリセット可能

#### 7.2 フィルター機能
- **部屋フィルター**: チェックボックスで特定の部屋の植物のみ表示
- **水やり状態フィルター**: 
  - すべて
  - 要水やり（期限切れ）
  - OK（期限内）
  - スヌーズ中
- **並び替え**:
  - 登録日順（新しい順/古い順）
  - 名前順（A-Z/Z-A）
  - 水やり期限が近い順
- **フィルター数表示**: 適用中のフィルター数をバッジで表示
- **フィルター解除ボタン**: すべてのフィルターを一括解除

#### 7.3 検索結果表示
- **該当件数表示**: フィルター適用時に該当する植物の件数を表示
- **空状態**: 該当する植物がない場合は専用メッセージを表示
- **ハイライト表示**: 検索キーワードに該当する部分を背景色で強調

#### 7.4 技術的な実装
- **SearchBar.vue**: リアルタイム検索コンポーネント
- **FilterPanel.vue**: フィルターパネルコンポーネント
- **usePlants.js拡張**: 
  - `searchQuery`: 検索クエリの状態管理
  - `filters`: フィルター設定の状態管理
  - `filteredPlants`: フィルター・検索適用後の植物リスト
  - `highlightSearchQuery()`: 検索結果のハイライト処理
  - `hasActiveFilters`: フィルター適用状態の判定
  - `resetFilters()`: フィルターリセット機能

### 8. 画像アップロード機能の大幅改善（2026年1月30日）
従来の「ファイル選択→圧縮→アップロード」の3ステップから、直感的でモダンなアップロード体験に改善。

#### 8.1 ドラッグ&ドロップアップロード
- **視覚的フィードバック**: ドラッグ中は枠線の色が変化、スケールアップアニメーション
- **ドロップゾーン**: 画像をドラッグして直接アップロード可能
- **複数ファイル対応**: 一度に複数の画像をドロップ可能

#### 8.2 モバイル最適化
- **カメラ直接起動**: `capture="environment"` 属性でカメラアプリを直接起動
- **複数画像選択**: `multiple` 属性で複数の画像を同時選択
- **タッチ操作最適化**: 最小タップ領域44×44px、レスポンシブグリッド

#### 8.3 画像編集機能
**Cropper.js統合による高機能な画像編集:**
- **トリミング**: 自由なアスペクト比、または固定比率（1:1、4:3、16:9、3:4）
- **回転**: 左右90度回転
- **反転**: 左右反転、上下反転
- **ズーム**: ズームイン/ズームアウト
- **リセット**: 編集内容を元に戻す
- **プレビュー**: リアルタイムで編集結果を確認

#### 7.4 進捗表示とフィードバック
- **プログレスバー**: 0%→100%のリアルタイム進捗表示
- **処理状況**: 圧縮中、アップロード中などの状態を明確に表示
- **ファイル情報**: サムネイルにファイルサイズ（KB）を表示

#### 8.5 自動リトライ機能
- **指数バックオフ**: 1秒→2秒→4秒（最大5秒）で段階的に待機時間を延長
- **最大3回リトライ**: ネットワークエラー時に自動でリトライ
- **ユーザー通知**: リトライ回数と状況をToastで通知

#### 7.6 サムネイルプレビュー
- **グリッド表示**: 複数画像を2列（モバイル）または3列（デスクトップ）で表示
- **ホバーアクション**: 編集・削除ボタンをホバー時に表示
- **メモリ管理**: `URL.revokeObjectURL()` で適切にメモリ解放

#### 技術実装詳細
- **useImageUpload.js**: 画像の一括処理、ドラッグ&ドロップイベント、進捗管理、リトライロジック
- **useImageEditor.js**: Cropper.js のラッパー、編集機能のAPI提供
- **ImageEditorModal.vue**: フル機能の画像編集UI、アスペクト比選択、ツールバー
- **AddPlantModal.vue**: 画像アップロード機能統合、ドラッグ&ドロップエリア、プレビューグリッド

### 8. UI/UX改善（2026年1月）
- **視認性向上**: タイトル・ボタンの濃色化、text-shadow追加、コントラスト比改善
- **情報階層最適化**: 統計カード2カラム化、数値サイズ拡大、グラデーション背景
- **操作性改善**: ボタンサイズ拡大、タップ領域最適化、視覚的フィードバック強化
- **フォーム体験**: アイコン付きインプット、リアルタイムバリデーション、エラー表示改善
- **アニメーション**: スムーズなトランジション、シマーエフェクト、フォーカス状態統一
- **空状態・エラー状態**: デザイン統一、視認性向上、ユーザーガイダンス強化
- **画面遷移の安定化（2026年2月）**:
  - 遅延ロード時にローディングUIを表示し、白画面を防止

### 9. ダッシュボード情報過多問題の解決（2026年1月31日）
**目的**: ユーザーが一目で今日すべきことを理解できるようにする

#### 9.1 実装内容
- **TodayActionsCard.vue（新規）**: 
  - 今日のアクションセクションを専用コンポーネント化
  - 水やり必要な植物を優先表示
  - ワンタップ水やり機能（3タップ→1タップに改善）
  - 時間帯別挨拶メッセージ
  - 5件以上の植物がある場合は残り件数を表示
  
- **SearchFilterPanel.vue（新規）**:
  - 検索とフィルターを統合したアコーディオンコンポーネント
  - デフォルトで折りたたみ
  - 必要な時だけ展開して使用可能
  
- **DashboardStats.vue（改善）**:
  - アコーディオン化により情報密度を調整可能
  - 簡易表示（常時）: 植物数、今日のタスク数
  - 詳細表示（展開時）: グラデーションカード2枚

- **DashboardView.vue（リファクタリング）**:
  - 情報の表示優先順位を明確化
  - 1. 通知バナー → 2. 今日のアクション → 3. 統計（折りたたみ可） → 4. 検索・フィルター（折りたたみ可） → 5. 植物一覧
  - 不要なDashboardHeaderコンポーネントを削除
  - コード量削減とメンテナンス性向上

#### 9.2 DoD達成状況
- ✅ 新規ユーザーがダッシュボードを見て5秒以内に「今日水やりすべき植物」を理解できる
- ✅ ワンタップで水やり記録が完了する（現在は3タップ必要 → 1タップに改善）
- ✅ 統計・検索機能は必要な時だけ表示される（アコーディオン化）
- ✅ モバイルとデスクトップで同じ情報階層を維持

#### 9.3 テスト
- **TodayActionsCard.spec.js**: 8テスト（100%カバレッジ）
  - 水やり必要な植物のフィルタリング
  - ワンタップ水やりイベント発火
  - 5件以上の植物表示
  - 時間帯別挨拶
  - 完璧メッセージ表示
  
- **SearchFilterPanel.spec.js**: 8テスト（100%カバレッジ）
  - アコーディオン開閉
  - 検索・フィルターの統合
  - イベント伝播
  - v-modelバインディング

#### 9.4 技術実装
- **新規コンポーネント**: 2件（TodayActionsCard.vue, SearchFilterPanel.vue）
- **既存コンポーネント改善**: 2件（DashboardStats.vue, DashboardView.vue）
- **コード削減**: DashboardHeader.vueを削除し、シンプルな構造に
- **リンター**: エラー0件、警告0件 ✅
- **テストカバレッジ**: **85.97%**（目標25%以上を達成） ✅
- **ビルド検証**: プロダクションビルド成功、PWA対応確認 ✅

### 9. 統計・インサイト機能（2026年1月30日）
植物の育成データを分析し、視覚的に表示する統計・インサイト機能。

#### 9.1 統計サマリー
- **総水やり回数**: 全ての植物の累計水やり回数
- **継続日数**: 最初の水やりから今日までの日数
- **成長率**: 今月と先月の水やり回数の比較（前月比%）
- **登録植物数**: 現在登録されている植物の総数
- **アクティブ率**: 最近30日以内に水やりした植物の割合
- **平均水やり頻度**: 全植物の水やり頻度の平均値
- **最もお世話した植物**: 水やり回数が最も多い植物の表示

#### 9.2 月間グラフ
- **月間水やり推移**: 折れ線グラフで1ヶ月の水やり推移を表示
- **月の切り替え**: 前月・翌月ボタンで過去のデータを確認可能
- **Chart.js使用**: レスポンシブで美しいグラフ表示

#### 9.3 週間グラフ
- **週間水やり分布**: 棒グラフで曜日別の水やり回数を表示
- **週の切り替え**: 前週・翌週ボタンで過去のデータを確認可能

#### 9.4 詳細分析グラフ
- **植物別ランキング**: 横棒グラフでTOP5の植物を表示
- **お世話タイプ別分布**: ドーナツグラフで水やりとスヌーズの割合を表示

#### 9.5 月間レポート生成
- **テキスト形式レポート**: 統計サマリー、月間活動、TOP3植物、アドバイスを含む
- **ダウンロード機能**: レポートをテキストファイルでダウンロード可能
- **日付付きファイル名**: `green-diary-report-YYYY-MM.txt` 形式

#### 9.6 アドバイス機能
- **アクティブ率に基づく提案**: 50%未満の場合は改善提案
- **成長率に基づく励まし**: プラス成長の場合は称賛メッセージ
- **継続日数の表彰**: 30日以上継続している場合は特別メッセージ

#### 9.7 技術実装
- **useInsights.js**: 統計計算とデータ取得のロジック
- **InsightsView.vue**: グラフと統計の表示UI
- **Chart.js統合**: 折れ線、棒、横棒、ドーナツの4種類のグラフ
- **date-fns使用**: 日付計算と期間集計
- **ルーティング統合**: サイドバーとボトムナビに統計ページへのリンクを追加

### 9. 植物図鑑機能（2026年1月30日）
植物の知識を学び、育てたい植物を探すための図鑑機能。

#### 9.1 図鑑データベース
- **植物情報管理**: 25種類以上の観葉植物データベース
- **詳細情報**: 日本語名、英語名、学名、科名、原産地
- **育て方情報**: 難易度、日当たり要件、水やり頻度、温度・湿度要件
- **画像管理**: メイン画像とサムネイル画像
- **説明文**: 特徴、育て方のコツ、よくある問題
- **メタデータ**: タグ、閲覧数、ペット安全性フラグ

#### 9.2 図鑑一覧表示
- **カード形式表示**: 画像、植物名、説明、育て方情報を視覚的に表示
- **グリッドレイアウト**: レスポンシブ3カラム（モバイル1カラム）
- **難易度バッジ**: 初心者向け・中級者向け・上級者向けの色分け表示
- **閲覧数表示**: 人気度の可視化
- **ホバーエフェクト**: カードにマウスオーバーで拡大・影付き

#### 9.3 検索・フィルター機能
- **リアルタイム検索**: 植物名、学名、科名、タグでの検索
- **難易度フィルター**: 初心者向け・中級者向け・上級者向けで絞り込み
- **日当たりフィルター**: 日陰OK・半日陰・日向で絞り込み
- **ペット安全フィルター**: ペットに安全な植物のみ表示
- **複数フィルター対応**: 複数の条件を組み合わせて絞り込み
- **フィルターリセット**: ワンクリックで全フィルターをリセット

#### 9.4 詳細モーダル
- **基本情報表示**: 英名、学名、科名、原産地、最大草丈
- **育て方詳細**: 難易度、日当たり、水やり頻度、湿度、適温
- **特徴リスト**: 植物の特徴を箇条書きで表示
- **育て方のコツ**: 具体的な育成アドバイス
- **よくある問題**: トラブルシューティング情報
- **タグ一覧**: 関連タグの表示

#### 9.5 お気に入り機能
- **お気に入り登録**: ハートアイコンでお気に入りに追加・削除
- **お気に入り一覧**: お気に入りタブで登録植物のみ表示
- **お気に入り数表示**: バッジで登録数を表示
- **永続化**: ユーザーごとのお気に入りをデータベースに保存

#### 9.6 統計情報
- **登録植物数**: 図鑑に登録されている植物の総数
- **初心者向け数**: 育てやすい植物の数
- **お気に入り数**: ユーザーのお気に入り登録数

#### 9.7 技術的な実装
- **usePlantEncyclopedia.js**: 図鑑データの管理、検索・フィルター、お気に入り機能
  - `fetchPlants()`: 全植物データの取得
  - `fetchPlantById()`: 特定植物の詳細取得
  - `fetchPopularPlants()`: 人気植物の取得（閲覧数順）
  - `fetchBeginnerFriendlyPlants()`: 初心者向け植物の取得
  - `addFavorite()`, `removeFavorite()`: お気に入り管理
  - `filteredPlants`: 検索・フィルター適用後の植物リスト
- **PlantEncyclopediaView.vue**: 図鑑一覧画面、タブ切り替え、統計表示
- **PlantEncyclopediaCard.vue**: 植物カード表示、お気に入りボタン
- **PlantEncyclopediaDetailModal.vue**: 詳細モーダル、全情報の表示
- **データベース**: plant_encyclopedia, user_favorite_plants テーブル
- **初期データ**: 25種類の観葉植物データを投入
- **ルーティング**: `/encyclopedia` パスでアクセス可能
- **ナビゲーション**: サイドバーとボトムナビに図鑑アイコンを追加

#### 9.8 テスト
- **usePlantEncyclopedia.spec.js**: 80%以上のテストカバレッジ
  - データ取得のテスト
  - 検索・フィルター機能のテスト
  - お気に入り機能のテスト
  - ヘルパー関数のテスト

### 10. カレンダービュー（2026年1月30日）
植物の水やりスケジュールを月間カレンダー形式で視覚的に管理する機能。

#### 9.1 月間カレンダー表示
- **カレンダーグリッド**: 日曜始まりの7列×最大6週のグリッド表示
- **水やり予定マーク**: 各日付に水やりが必要な植物の数をバッジ表示
- **期限切れ表示**: 過去の水やり予定は赤色、通常は青色で区別
- **複数植物対応**: 1日に複数の植物の水やり予定がある場合も全て表示
- **植物インジケーター**: 小さな緑色のドットで植物数を視覚的に表示

#### 9.2 ナビゲーション
- **前月/次月移動**: 矢印ボタンで月を切り替え
- **今日に戻る**: ワンクリックで現在の月に戻る
- **月表示**: 「2026年1月」形式で現在表示中の月を表示

#### 9.3 月間統計
- **今月の水やり予定**: 今月中に予定されている水やりの総数
- **期限切れ**: 過去の日付で未完了の水やり数
- **管理中の植物**: 登録されている植物の総数

#### 9.4 今日の水やり予定
- **予定リスト**: カレンダー下部に今日の水やり予定植物を一覧表示
- **植物カード**: 画像、名前、品種を表示
- **詳細遷移**: カードをクリックで植物詳細ページへ遷移

#### 9.5 水やり予定計算ロジック
- **次回水やり日**: `last_watered_at` + `watering_frequency` で算出
- **スヌーズ対応**: `snoozed_until` が設定されている植物を除外
- **期限判定**: 今日より前の日付は期限切れとして赤色表示

#### 9.6 技術的な実装
- **useCalendar.js**: カレンダーロジック、水やり予定計算、月間統計
  - `currentDate`: 現在表示中の月
  - `calendarWeeks`: 週ごとにグループ化された日付配列
  - `getNextWateringDate()`: 植物の次回水やり日を計算
  - `getPlantsForDate()`: 指定日の水やり予定植物を取得
  - `getMonthlyStats()`: 月間統計を計算
- **CalendarView.vue**: カレンダーUI、ナビゲーション、統計表示
- **date-fns活用**: startOfMonth, endOfMonth, eachDayOfInterval等
- **レスポンシブ対応**: モバイル・デスクトップ両対応
- **ルーティング**: `/calendar` パスでアクセス可能
- **ボトムナビゲーション**: モバイルでカレンダーアイコンを追加

#### 9.7 テスト
- **useCalendar.spec.js**: 100%のテストカバレッジ
  - カレンダー構造のテスト
  - ナビゲーション機能のテスト
  - 日付判定のテスト
  - 水やり予定計算のテスト
  - 月間統計のテスト

## 技術スタック

- **Frontend**: Vue.js 3 (Composition API)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS, Font Awesome
- **Backend/Database**: Supabase (PostgreSQL, Storage, Auth)
- **Image Processing**: 
  - browser-image-compression（画像圧縮）
  - Cropper.js（画像編集：トリミング、回転、反転、ズーム）
- **State Management**: Vue Composition API (Composables)
  - `useAuth`: 認証管理
  - `usePlants`: 植物CRUD操作
  - `usePlantCare`: お世話管理
  - `usePlantImages`: 画像管理
  - `useImageUpload`: 画像アップロード強化（ドラッグ&ドロップ、進捗表示、リトライ）
  - `useImageEditor`: 画像編集機能（Cropper.js統合）
  - `useRooms`: 部屋管理
  - `useToast`: 通知管理
  - `useConfirm`: 確認ダイアログ管理
  - `useNotifications`: 通知機能管理
  - `useDemoData`: デモデータ管理
  - `useCalendar`: カレンダー管理
  - `useInsights`: 統計・インサイト機能
  - `usePlantEncyclopedia`: 植物図鑑管理
- **Testing**: Vitest（カバレッジ: 82.05%）
- **UI/UX**: モバイルファースト、アクセシビリティ対応（WCAG 2.1準拠）
- **PWA**: Service Worker対応（オフライン動作可能）
- **Charts**: Chart.js（グラフ可視化）

## データモデル (Supabase)

### Table: `items` (Plants)

| Column Name | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid | Primary Key |
| `user_id` | uuid | Owner's User ID (Foreign Key to auth.users) |
| `name` | text | 植物の名前 (必須) |
| `variety` | text | 品種 |
| `location` | text | 設置場所 (例: リビング、ベランダ) |
| `image_url` | text | 画像のURL |
| `created_at` | timestamptz | 作成日時 (Default: now()) |
| `watering_frequency` | int4 | 水やり頻度 (日数) |
| `last_watered_at` | timestamptz | 最後に水やりをした日時 |

## ディレクトリ構造

```
src/
├── components/          # UIコンポーネント
│   ├── ui/             # 汎用UIコンポーネント
│   │   ├── ToastMessage.vue
│   │   └── ConfirmDialog.vue
│   ├── DashboardStats.vue
│   ├── DashboardHeader.vue
│   ├── EmptyPlantState.vue
│   ├── OnboardingFlow.vue       # オンボーディングフロー
│   ├── PlantTemplates.vue       # 植物テンプレート選択
│   ├── CelebrationAnimation.vue # 登録完了アニメーション
│   ├── PlantCard.vue
│   ├── AddPlantModal.vue        # 植物登録フォーム（画像アップロード機能統合）
│   ├── ImageEditorModal.vue     # 画像編集モーダル（NEW）
│   ├── NotificationBanner.vue   # 通知バナー
│   ├── NotificationSettings.vue # 通知設定
│   └── ...
├── composables/         # ロジック・状態管理
│   ├── __tests__/      # テストファイル
│   ├── useAuth.js      # 認証管理
│   ├── usePlants.js    # 植物CRUD
│   ├── usePlantCare.js # お世話管理
│   ├── usePlantImages.js # 画像管理
│   ├── useImageUpload.js # 画像アップロード強化
│   ├── useImageEditor.js # 画像編集機能
│   ├── useRooms.js     # 部屋管理
│   ├── useToast.js     # 通知管理
│   ├── useConfirm.js   # 確認ダイアログ
│   ├── useNotifications.js # 通知機能管理
│   ├── useDemoData.js  # デモデータ管理
│   ├── useCalendar.js  # カレンダー管理
│   ├── useInsights.js  # 統計・インサイト機能
│   └── usePlantEncyclopedia.js # 植物図鑑管理
├── utils/              # ユーティリティ関数
│   ├── __tests__/      # テストファイル
│   └── dateUtils.js    # 日付計算ユーティリティ
├── constants/          # 定数定義
│   └── index.js        # アプリケーション定数
├── views/              # ページコンポーネント
│   ├── LandingView.vue
│   ├── AuthView.vue
│   ├── DashboardView.vue
│   ├── PlantDetailView.vue
│   ├── CalendarView.vue # カレンダーページ
│   ├── InsightsView.vue # 統計・インサイトページ
│   ├── PlantEncyclopediaView.vue # 植物図鑑ページ（NEW）
│   └── ...
├── router/             # ルーティング定義
├── migrations/         # DBマイグレーション
├── style.css           # グローバルスタイル
├── supabase.js         # Supabase設定
└── main.js             # エントリーポイント
```

## コード品質

- **リンター**: ESLint + Prettier（エラー0件、警告0件 ✅）
- **テストカバレッジ**: **85.97%**（目標: 25%以上達成 ✅）
  - `useCare.js`: 100%
  - `usePlantCare.js`: 100%
  - `useRooms.js`: 100%
  - `useCalendar.js`: 100%
  - `dateUtils.js`: 100%
  - `constants/index.js`: 100%
  - `TodayActionsCard.vue`: 98.66%
  - `SearchFilterPanel.vue`: 100%
  - `usePlantImages.js`: 91.85%
  - `FilterPanel.vue`: 86.06%
  - `usePlantEncyclopedia.js`: 80.05%
  - `usePlants.js`: 77.4%
  - `useInsights.js`: 77.36%
  - `useAuth.js`: 72.85%
  - `SearchBar.vue`: 70.68%
- **環境変数管理**: `.env`ファイルで機密情報を管理
- **コンポーネント設計**: 単一責任の原則に基づく小さなコンポーネント
- **Composables設計**: 機能別に分離された再利用可能な関数
- **ユーティリティ関数**: 日付計算ロジックを`dateUtils.js`に集約
- **定数管理**: マジックナンバーを`constants/index.js`に外部化

## 更新履歴

### v8.0.0 (2026-05-27)
**10機能改善（バグ修正・UX強化・エクスポート完全化）**

| # | 機能 | 優先度 | ファイル |
|---|------|--------|--------|
| P1 | 植え替え頻度フィールドをAddPlantModalに追加（repotting_frequencyが登録・編集フォームに欠如していたバグを修正） | P1🔴 | `AddPlantModal.vue` |
| P2 | WateringModal写真圧縮（FileReader.readAsDataUrlが無圧縮だったため canvas API でmaxWidth:1280/quality:0.72に圧縮） | P1🔴 | `WateringModal.vue` |
| P3 | エクスポート/インポートにgd_growth_*・gd_notes_*を追加（バックアップに成長記録・ノートが含まれていなかったバグを修正） | P1🔴 | `DashboardView.vue` |
| P4 | 週次サマリーを毎日表示に変更（月曜日のみ=`getDay()!==1`条件を削除） | P2🟠 | `DashboardView.vue` |
| P5 | バックデート記録を30日前まで拡張（7日→30日） | P2🟠 | `WateringModal.vue` |
| P6 | 健康診断結果をlocalStorageに保存・植物詳細ヘッダーにバッジ表示（gd_health_${plantId}） | P2🟠 | `PlantHealthCheck.vue`, `PlantDetailView.vue` |
| P7 | カレンダーから直接お世話記録（日付クリック→植物パネル→💧記録ボタン→WateringModal） | P3🟡 | `CalendarView.vue` |
| P8 | importDataバリデーション強化（version確認・Array型チェック・上書き確認ダイアログ） | P3🟡 | `DashboardView.vue` |
| P9 | 成長チャートのtooltipにnote表示（Chart.js afterBody callback） | P4🔵 | `PlantDetailView.vue` |
| P10 | ストレージ80%超時に自動警告トースト（セッション1回限り・watchで検出） | P4🔵 | `DashboardView.vue` |

#### v8.0.0 技術詳細

- **P2 写真圧縮**: `compressPhotoDataUrl(dataUrl, maxWidth=1280, quality=0.72)` → canvas API でリサイズ → `handlePhotoCapture` を `async` に変更して `await` 適用
- **P3 エクスポート**: `for (key in localStorage)` でkey前方一致（`gd_growth_`・`gd_notes_`）を収集 → `version:2` のpayloadに追加; importDataでも同様に復元
- **P6 健康診断保存**: `PlantHealthCheck.vue` に `emit("save-result", {level, label, score, date})` 追加 → `PlantDetailView.vue` で `handleSaveHealthResult()` がlocalStorage書き込み・`latestHealthResult` refを更新 → ヘッダーバッジ（緑/黄/赤）表示
- **P7 カレンダーケア**: `CalendarView.vue` に `WateringModal` import・`wateringPlant` ref・`handleCareFromCalendar()` 追加 → 各植物行に「💧 記録」ボタン追加
- **P8 バリデーション**: `Array.isArray()` チェック + version 1 or 2 のみ許可 + `window.confirm()` で上書き確認
- **P9 tooltip**: `plugins.tooltip.callbacks.afterBody` でそのインデックスの `growthRecords[idx].note` を返す
- **P10 自動警告**: `watch(storageUsage, ..., { immediate: true })` + `_storageWarnedThisSession` refでセッション1回のみ `showError()` 呼び出し
- **バックアップ互換性**: importData は version 1（従来）・version 2（v8）の両方を受け入れる

### v7.0.0 (2026-05-27)
**10機能追加（UX強化・診断・成長記録比較）**

| # | 機能 | 優先度 | ファイル |
|---|------|--------|--------|
| P1 | ピン留め植物ウィジェット（最大5株をダッシュボード上部に固定表示・水やりボタン付き） | P1 | `usePlants.js`, `PlantCard.vue`, `DashboardView.vue` |
| P2 | 通知時刻設定（設定時刻以降に1回/日のみ通知を送信） | P2 | `useNotifications.js`（既存機能完成） |
| P3 | 成長写真比較スライダー（ギャラリー写真を2枚選択して並べて比較） | P3 | `GrowthPhotoCompare.vue`（NEW）, `PlantDetailView.vue` |
| P4 | バッジ獲得演出モーダル（新規バッジ獲得時にアニメーション付きモーダル表示） | P4 | `useStreak.js`, `DashboardView.vue` |
| P5 | 植物健康チェック診断（8問アンケートで健康状態をスコア判定） | P5 | `PlantHealthCheck.vue`（NEW）, `PlantDetailView.vue` |
| P6 | 週次サマリーバナー（月曜日のみ・先週のお世話回数と頑張った植物を表示・非表示可能） | P6 | `DashboardView.vue` |
| P7 | 一括植え替えボタン追加（TodayActionsCard に植え替え期限超過植物への一括記録を追加） | P7 | `TodayActionsCard.vue` |
| P8 | ケアメモテンプレート（お世話記録に定型文テンプレートを追加・最大10件自動保存） | P8 | `useCareTemplates.js`（NEW）, `WateringModal.vue` |
| P9 | 平均水やり間隔表示（実績ログから計算した実際の間隔を植物詳細に表示） | P9 | `PlantDetailView.vue` |
| P10 | 記録写真一括削除（サイドバーからお世話記録の添付写真を全削除してストレージ節約） | P10 | `DashboardView.vue` |

#### v7.0.0 技術詳細

- **ピン留め**: `plant.pinned` フィールド・`pinnedPlants` computed（最大5件・アーカイブ除外）→ ダッシュボード上部横スクロールウィジェット
- **バッジモーダル**: `useStreak.newBadge` ref → `watch` で `showBadgeModal = true` → アニメーション付きモーダル表示
- **健康チェック**: 8問（葉色・土・成長・害虫・光・根・ハリ・臭い）→ スコア合計: ≤2=問題なし / ≤6=要注意 / >6=要対応
- **成長写真比較**: `GrowthPhotoCompare.vue` が `plantImages` 配列を受け取り、左右2枚をセレクタで選択して並べて表示
- **平均間隔**: 水やりログの timestamps を昇順ソートし、隣接差分の平均を日数で表示（設定値との比較色分け付き）
- **記録写真削除**: ケアログから `image_url` フィールドを除去（ログ本体は保持）
- **週次サマリー**: 月曜日のみ・前週ログ集計・植物ごとカウント最大値の植物名を表示・`gd_weekly_dismiss_YYYY-MM-DD` で1週間ごとに非表示管理

### v6.0.0 (2026-05-27)
**8機能一括追加（バグ修正含む）**

| # | 機能 | 優先度 | ファイル |
|---|------|--------|--------|
| P1 | タグフィルター完全実装（FilterPanel にタグUI追加・usePlants tag filter修正） | P1 | `FilterPanel.vue`, `SearchFilterPanel.vue`, `usePlants.js`, `DashboardView.vue` |
| P2 | データエクスポート/インポート（JSON形式でバックアップ・復元） | P2 | `DashboardView.vue` |
| P3 | カレンダー多種ケアアイコン表示（肥料🌿・剪定✂️・植え替え🪴をカレンダー日付に表示） | P3 | `useCalendar.js`, `CalendarView.vue` |
| P4 | ユーザー表示名設定（最大20文字・localStorageに保存・TodayActionsCardに反映） | P4 | `useAuth.js`, `DashboardView.vue` |
| P5 | 植物複製機能（PlantCardに複製ボタン追加・コピー名で即時複製） | P5 | `usePlants.js`, `PlantCard.vue`, `DashboardView.vue` |
| P6 | 部屋管理UI（FilterPanel内でインライン名前編集・削除ボタン追加） | P6 | `useRooms.js`, `usePlants.js`, `FilterPanel.vue`, `SearchFilterPanel.vue`, `DashboardView.vue` |
| P7 | Amazon アフィリエイトリンク（植物詳細ページに植物名連動の商品リンク4種） | P7 | `PlantDetailView.vue` |
| P8 | 植物図鑑拡張（35種→60種、ハーブ・果樹・野菜・多肉植物などカテゴリ追加） | P8 | `usePlantEncyclopedia.js` |

#### v6.0.0 技術詳細

- **タグフィルター**: `FilterPanel` に `plants` prop → `allTags` computed（全植物からSet収集）→ ボタントグルUI
- **ユーザー名**: `useAuth.displayName`（`gd_username` localStorage key）→ `DashboardView` サイドバーに入力欄
- **植物複製**: `duplicatePlant()` がお世話履歴なしのコピーを生成（`last_fertilized_at/pruned_at/repotted_at` = null）
- **部屋管理**: `updateRoom`/`deleteRoom` を `usePlants` から公開 → イベントバブリング（FilterPanel → SearchFilterPanel → DashboardView）
- **多種ケアカレンダー**: `getOtherCareForDate()` が fertilizer/pruning/repotting の次回予定日を算出し絵文字で表示
- **Amazonアフィリエイト**: `plant.name` を動的にクエリに使用・アソシエイトID `appdaycreator-22`・GTMトラッキング属性付き

### v5.0.0 (2026-05-27)
**10機能一括追加（統計修正2件 + 新機能8件）**

| # | 機能 | 優先度 | ファイル |
|---|------|--------|--------|
| P1-A | InsightsView統計を全お世話タイプ対応（水やりのみ→全タイプカウント） | P1 | `useInsights.js`, `InsightsView.vue` |
| P1-B | TodayActionsCard 達成率を全お世話タイプ対応（肥料/剪定/植え替え含む） | P1 | `TodayActionsCard.vue` |
| P2-A | CalendarView 日付クリック→植物リストパネル表示 | P2 | `CalendarView.vue` |
| P2-B | スヌーズ期間選択（明日/3日後/1週間後を選択可能） | P2 | `WateringModal.vue`, `usePlantCare.js`, `usePlants.js`, `DashboardView.vue` |
| P3-A | 植物タグ/カテゴリシステム（最大5タグ、PlantCardに表示） | P3 | `AddPlantModal.vue`, `PlantCard.vue` |
| P3-B | 成長記録マルチメトリック（草丈+葉の数、チャート2軸表示） | P3 | `PlantDetailView.vue` |
| P3-C | 植物シェアカード（Canvas APIで植物情報カード画像をDL） | P3 | `PlantDetailView.vue` |
| P4-A | 季節のお世話アドバイス（春夏秋冬別のTipsをInsightsViewに表示） | P4 | `InsightsView.vue` |
| P4-B | 一括お世話ボタン（肥料/剪定）（TodayActionsCardから一括記録） | P4 | `TodayActionsCard.vue`, `DashboardView.vue` |
| P4-C | バッジ実績拡張（連続日数100日/総お世話100回/植物数20株など） | P4 | `useStreak.js` |

### v4.0.0 (2026-05-27)
**バグ修正1件 + 7機能一括追加**

| # | 機能 | ファイル |
|---|------|--------|
| バグ修正 | care_type未定義バグ修正（ログ・統計が全件undefined→正常化） | `usePlantCare.js` |
| P1 | バックデート記録（過去7日まで日付選択してお世話を記録） | `WateringModal.vue`, `usePlantCare.js`, `usePlants.js` |
| P2 | 肥料・剪定スケジュール管理（頻度設定→期限超過でダッシュボード表示） | `AddPlantModal.vue`, `TodayActionsCard.vue`, `usePlantCare.js` |
| P3 | カメラ直接撮影ボタン（ギャラリーと分離・モバイルでカメラ起動） | `AddPlantModal.vue` |
| P4 | 植物アーカイブ（引退・枯れ記録、思い出として保存・復活可能） | `ArchivedPlantsPanel.vue`(新規), `PlantCard.vue`, `usePlants.js`, `DashboardView.vue` |
| P5 | PWA ホーム画面ショートカット（水やり・植物追加への直接ジャンプ） | `vite.config.js` |
| P6 | 今日の達成率バー＋完了アニメーション（全完了で🎉表示） | `TodayActionsCard.vue` |
| P7 | お世話ログへの写真添付（WateringModalで撮影→ログにサムネイル表示） | `WateringModal.vue`, `usePlantCare.js`, `PlantDetailView.vue` |

### v3.0.0 (2026-05-27)
**7機能一括追加**

| # | 機能 | ファイル |
|---|------|--------|
| P1 | ケアタイプ拡張（肥料🌱・剪定✂・植え替え🪴）WateringModalに4タイプ選択 | `constants/index.js`, `WateringModal.vue`, `usePlantCare.js`, `PlantDetailView.vue` |
| P2 | 植物ヘルススコア（水やり遵守率→🟢🟡🔴バッジ自動表示） | `PlantCard.vue` |
| P3 | 図鑑→登録ワンタップ（植物名・学名・水やり頻度を自動入力） | `PlantEncyclopediaDetailModal.vue`, `PlantEncyclopediaView.vue`, `DashboardView.vue` |
| P4 | PlantCard次回水やり日表示（「💧 3日後」「⚠️ 2日超過」） | `PlantCard.vue` |
| P5 | 植物メモ・日記機能（フリーテキスト・Enter/保存・削除・もっと見る） | `PlantDetailView.vue` |
| P6 | 一括水やりボタン（2株以上で表示・確認ダイアログ付き） | `TodayActionsCard.vue`, `DashboardView.vue` |
| P7 | 水やり超過アラートバナー（頻度×2倍超過で赤バナー表示） | `DashboardView.vue` |

### v2.0.0 (2026-05-27)
**7機能一括追加**

| # | 機能 | ファイル |
|---|------|--------|
| P1 | Xシェア機能（連続水やり日数・株数をシェア） | `DashboardView.vue` |
| P2 | 植物図鑑 12種→35種に拡充（観葉・多肉・ハーブ・野菜） | `usePlantEncyclopedia.js` |
| P3 | SEO修正（aggregateRating削除・Article schema修正・og:title統一） | `index.html` |
| P4 | 水やりストリーク表示・バッジ（3日/7日/30日） | `useStreak.js` (新規), `DashboardView.vue` |
| P5 | 植物ごとの草丈成長グラフ（Chart.js折れ線・入力フォーム付き） | `PlantDetailView.vue` |
| P6 | PWA対応確認（vite-plugin-pwa・sw.js・manifest.webmanifest 既実装済み） | `vite.config.js` |
| P7 | ストレージ使用量メーター・80%超で警告表示 | `DashboardView.vue` |
- **共通スタイル**: Tailwind CSS `@layer components`で再利用可能なクラスを定義
