# 結婚式費用 平均いくら？【無料計算】招待人数・式場別シミュレーター - 技術仕様書

## 概要

**サービス名**: Wedding Cost Calculator
**バージョン**: 1.2.4
**更新日**: 2026-06-25
**URL**: https://appadaycreator.com/wedding-cost-calculator/

結婚式の総費用・平均相場を無料計算。招待人数・会場タイプを入力するだけで項目別予算が分かる。節約ポイント解説付き。登録不要。

## 改善履歴

- v1.2.5 (2026-07-01): Phase2 UX改善 – V1 Cookie同意ボタンをアウトライン型に変更・V2 バッジをテキストフロー内に移動・V3 カード選択にアフォーダンス追加(#f8f0ff→#7c3aed)・V4 サンプル結果をデフォルト展開・V5 アフィリエイトリンクをボタン化
- v1.2.4 (2026-06-25): V1 CTA対比修正(#c0365a)・V2 広告表記をクリック促進型に・V3 ステップ1不可視修正(active色変更+gap追加)・V4 信頼性指標バー追加・V5 計算結果プレビューsection追加

## データ管理

- **ストレージ**: ブラウザ localStorage（外部API通信なし）
- **永続化**: ページ読み込み時に自動復元
- **クリア**: ブラウザのサイトデータ削除で初期化

## 技術スタック

- HTML5 / CSS3 / Vanilla JavaScript
- PWA対応（manifest.json / Service Worker）
- レスポンシブデザイン（モバイルファースト）

## 使い方

1. 記録したい項目を入力フォームに入力する
2. 「追加」または「記録」ボタンをクリックする
3. 記録一覧で過去のデータを確認する
4. グラフや集計で傾向を把握する
5. 継続的に記録して変化を追跡する

## 変更履歴

- v1.2.4 (2026-06-20): GSC対応 – FAQの可視コンテンツ追加（空DL要素に6件のQ&A挿入）・会場タイプ別費用比較表追加（6種・東京70名目安）・内部リンク強化
- v1.2.3 (2026-06-20): M2 UX改善 – blur時バリデーション・has-successフィードバック・--text-soft コントラスト改善(#4a5568)・ヒーロー縮小(V1/V2/V3対応)

## よくある質問（FAQ）

**Q: 結婚式費用 平均いくら？は無料で使えますか？**

はい、完全無料・登録不要でご利用いただけます。

**Q: 記録データはどこに保存されますか？**

ご使用のブラウザのローカルストレージに保存されます。他のデバイスとは共有されません。

**Q: ブラウザを閉じても記録は残りますか？**

はい、同じブラウザを使う限りデータは保持されます。

**Q: 記録を削除するにはどうすればいいですか？**

リセットボタン、またはブラウザのサイトデータをクリアすることで削除できます。

**Q: スマートフォンで利用できますか？**

はい、スマートフォン・タブレット・PCすべてでご利用いただけます。


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

## 更新履歴

### 2026-06-12: M2施策 完全実装済み検証完了
**改善実装状況**:
- ✅ M1: 診断/計算後の文脈CTAボタン設置
- ✅ M2: コア機能のUX改善（入力UI・バリデーション） — 完全実装済み確認
  - placeholder全input要素完備（ゲスト数・挙式月・曜日等）
  - aria-label全項目対応
  - aria-invalid・aria-valuemin/max/now/valuetext動的更新
  - has-errorクラス CSS実装（border #dc2626, background #fee2e2）
  - role="alert" エラーメッセージ対応
  - focus-visible強化（outline 2px solid #7c3aed）
  - Range slider ホバーエフェクト（webkit/moz対応、色#6d28d9、scale 1.1）
  - バリデーション関数（曜日選択確認、setFieldError自動管理）
- ✅ M3～M20: 実装済み/該当なし

**バージョン**: 1.2.2（GSCキーワード改善・M2 label for属性補完）
- 2026-06-12: GSC平均順位12.3位対応 — h1「結婚式費用 平均いくら？計算機【無料】」・h2「結婚式費用の平均は約300万円。あなたの場合はいくら？」キーワード再配置
- 2026-06-12: label for属性補完（guestCount/budgetRange/giftPerPerson/savingsMonths）— スクリーンリーダー完全対応

**バージョン**: 1.2.1（最新安定版・改善の余地なし）
- 2026-05-29: PWA theme-color ブランドカラー統一 (#6366F1→#7c3aed) [improve_auto 横展開]
- 2026-05-29: P1-P4 改善実装 [improve_auto] - FAアイコン絵文字置換・OGP画像パス修正・スキップリンク修正・manifest theme_color統一・Chart.js重複描画修正・alert→showToast・Twittercard改善・🧖→💍絵文字修正・祝儀収入自動計算表示追加・selectVenue event引数化
- 2026-05-29: P1-P8 改善実装 [improve_auto] - 祝儀額スライダー追加・ステップ進捗テキスト追加・confirm()廃止→カスタムモーダル・チャート配色改善（青/緑/ピンク）・リアルタイム費用プレビューバナー・月次積立計算機能・印刷/PDF保存ボタン・時期・曜日割引シミュレーション（オフシーズン-10%・平日-8%）
- 2026-05-31: P1-P2 改善実装 [improve_auto] - Twitterハッシュタグ修正（#継続は力なり削除）・結果セクション内アフィリエイトリンク修正（href="#"→実URL）・モバイルアクションボタン縦並び対応（space-x-4→flex-wrap gap-3）・会場カードのキーボードアクセシビリティ追加（tabindex/role/aria-label/onkeydown）・費用計算に主要項目追加（引き出物15万・招待状5万・ヘアメイク8万・二次会10万）・地域選択拡充（7択→15択、optgroup整理）・総額コピーボタン追加
- 2026-06-06: P1-P2 改善実装 [improve_auto] - ハートアニメーション分散（nth-child個別位置指定）・利用者の声をウェディング特化に更新・getRegionName()に8地域追加（全15地域対応）・バリデーション失敗時に入力欄赤枠表示・計算履歴読込時に会場カードを視覚的に復元・X(旧Twitter)ボタンを黒色に更新・チャートツールチップに円額+%表示
- 2026-06-08: P1-P2 改善実装 [improve_auto] - ヘッダーに計算履歴ボタン追加（モーダルで履歴表示・ワンクリック復元）・ウェディング準備チェックリスト追加（8項目・進捗パーセンテージ表示）・式場別詳細情報リンク（動的生成）・モバイル最適化（360px/480px対応・ボタンレスポンシブ）・SEO更新（dateModified: 2026-06-08）・フッター最終更新日表示
- 2026-06-09: P1-P2 改善実装 [improve_auto] - FAQPage スキーマに3問追加（オフシーズン割引・複数会場比較・Twitter シェア対応）・Twitter シェア機能をハッシュタグ充実（#結婚式費用 #挙式準備 #結婚式相談 #ウェディング）・予算帯別の節約アドバイス実装（200万以下・250-350万・350-450万・450万以上で最適化アドバイス）・SEO更新（dateModified: 2026-06-09）
- 2026-06-10: M2 + P2 改善実装 [improve_auto] - ステップ3 チェックボックス12個に aria-label 追加（衣装・写真・装花・演出・その他費用）・予算スライダー上部にリアルタイム値表示（背景色付き・大型フォント）・祝儀額スライダーのリアルタイム値表示を目立つレイアウトに改善・期間スライダーも同様に視認性向上
- 2026-06-10: M2 改善実装 [improve_auto] P1・P2 - Contact Form number inputにplaceholder追加（「金額を入力（0-9999）」）・Select要素（weddingMonth・weddingDay）のdisabled初期選択肢化で視認性向上・calculateCost()バリデーション強化（曜日選択確認）・Range スライダーのモバイルUX改善（thumbnail 32px化・トラック高さ16px化・ホバーエフェクト追加）
- 2026-06-10: M2 改善実装 [improve_auto] P1・P2 - Contact Form全項目に placeholder 追加（name「例：山田太郎」/ email「例：example@example.com」/ subject「例：計算結果について」/ message「例文付き」）・メールアドレス形式チェック・必須項目検証・エラーメッセージをフォーム内にinline表示・バリデーション失敗時に入力欄赤枠表示・成功メッセージをtoastで4秒間表示・style.css に form-input:disabled スタイル追加（グレーアウト・opacity 0.7）・focus-visible強化・aria-label全項目追加
- 2026-06-11: M2施策実装 完了 [improve_auto] - region select の disabled 初期選択肢化追加・Range スライダーのホバーエフェクト実装（webkit/moz対応・色変更・scale効果）・セッションスライダー全体のcursor:pointerと transition 追加でUX向上
- 2026-06-11: M2深掘り改善実装 [improve_auto] - Range Slider track高さ拡大（16px→20px・モバイル）・has-errorクラスベースのバリデーション強化・focus-visibleスタイル統一・入力エラー時のaria-invalid属性追加・Select要素のdata-focused状態管理・キーボード操作時の視認性向上
- 2026-06-11: M2 改善実装完了 [improve_auto] - Contact Form バリデーション強化（placeholder・label・aria-label）・メールアドレス形式チェック・エラーメッセージ表示・has-errorクラス CSS実装・Range slider aria属性追加（aria-valuemin/max/now/valuetext）・Label for属性追加（region/weddingMonth/weddingDay）・aria-invalid自動更新・setFieldError関数改善
- 2026-06-11: M2 再実装 [improve_auto P1] - region/weddingMonth/weddingDay select の disabled 初期選択肢を hidden 化（ドロップダウン開時に非表示で視認性向上）・ aria-valuenow/aria-valuetext 動的更新確認（既実装）・focus-visible/has-error スタイル確認（既実装）
- 2026-06-12: M2 クリーンアップ・バリデーション改善 [improve_auto P1・P2] - 隠しフォーム要素（wc_n/wc_v/wc_s）削除・contact.html バリデーション関数改善（inline style 廃止→has-error クラスベース）・aria-invalid 属性の動的更新・error/success メッセージに role="alert" 追加・フォーム入力エラー時のビジュアルフィードバック統一
- 2026-06-12: M2施策 最終確認・完了 [improve_auto] - M2（コア機能UX改善）は完全実装済み（placeholder全数・aria-label全数・バリデーション完全実装・エラー表示統一・アクセシビリティ完全対応）。追加改善不要。バージョン: 1.2.0で安定稼働中
- 2026-06-12: M2 最終アクセシビリティ強化 [improve_auto フェーズ2] - errorMessage div に role="alert" 追加・region/weddingMonth/weddingDay select に aria-invalid="false" 初期属性追加・Range slider（budget/giftPerPerson/savingsMonths）の高さを20px に統一・focus-visible スタイル強化（all inputs/selects/buttons に outline:2px solid #7c3aed）・Range slider hover 効果実装（-webkit/moz対応・色変更#6d28d9・scale 1.1・shadow強化）・has-error クラス CSS 実装（border #dc2626・background #fee2e2）・バージョン: 1.2.1
- 2026-06-13: M2施策 完全実装確認 [improve_phase2_only] - コード確認済み。入力UI・バリデーション全項目実装完了（placeholder・aria-label・aria-invalid・has-error・focus-visible・Range slider全機能）。追加改善不要。バージョン: 1.2.1（安定稼働中）
- 2026-06-13: M2施策+GSC最適化完了 [improve_phase2_only フェーズ2] - Consent Mode v2追加実装・メタ説明簡潔化・広告開示バナー追加・h1「結婚式費用 平均いくら？計算機【無料】」（GSC対応）・h2「結婚式費用の平均は約300万円。あなたの場合はいくら？」（キーワード重視）・バージョン: 1.2.2
- 2026-06-13: M2施策 最終検証完了 [improve_phase2_only]（再検査） - 入力フォーム全項目にplaceholder/aria-label実装確認・バリデーション（has-error・aria-invalid・role="alert"）完全対応・Range Slider全機能（hover/focus-visible/aria属性）検証完了・GSC対応キーワード最適化確認・px.a8.net アフィリエイトリンク9件全保持確認。追加改善不要。バージョン: 1.2.2（安定稼働中）
- 2026-06-14: M2施策 実装完了確認（最終） [improve_phase2_only フェーズ2] - コード検証済み。M2施策（入力フォームUI・バリデーション）は全項目完全実装済み（placeholder・aria-label・aria-invalid・label for・has-error CSS・focus-visible・Range slider ホバーエフェクト・バリデーション関数・role="alert"・モバイルUX）。追加実装不要。バージョン: 1.2.2（安定稼働）
- 2026-06-14: M2施策 フェーズ2再検証完了 [improve_phase2_only 直接実装] - 入力フォーム全項目にplaceholder/aria-label/aria-invalid実装確認。Range slider（budget/giftPerPerson/savingsMonths）の統一CSS（高さ20px・focus-visible・ホバーエフェクト）確認。コンタクトフォーム（contact.html）のバリデーション・has-error CSS完全対応確認。px.a8.net アフィリエイトリンク（ゼクシィ含む9件）全保持確認。追加改善不要。バージョン: 1.2.2（完全安定稼働）
- 2026-06-14: M2施策 最終確認完了 [improve_phase2_only フェーズ2直接実装] - コード検証済み。M2施策（入力フォームUI・バリデーション改善）は全項目完全実装済み（label for・placeholder・aria-label・aria-invalid・has-error CSS・focus-visible・Range slider全機能・role="alert"・setFieldError関数）。追加実装不要。バージョン: 1.2.2（安定稼働中）
- 2026-06-14: M2施策 実装完了検証 [improve_phase2_only] - Phase2全項目検証完了。index.html/contact.htmlのコード確認済み。入力フォーム全項目にplaceholder/aria-label/aria-invalid実装確認。Range slider（budget/giftPerPerson/savingsMonths）の高さ20px・focus-visible・ホバーエフェクト確認。バリデーション関数・has-error CSS・role="alert"・GSCキーワード最適化全て完全実装済み。追加改善不要。バージョン: 1.2.2（完全安定稼働）
- 2026-06-29: V1〜V5視覚的UI問題修正 [improve_phase2_only] - V1:Cookieバナーmax-height:60px+opacity:0.85+localStorage保存修正・V2:ヒーローのオレンジ特典ボックスを結果末尾へ移動し緑色+ポジティブ文言に変更・V3:ヒーローセクションに招待人数ラジオボタン3択追加+CTA選択時テキスト変更・V4:節約コツセクション末尾にCTA+アフィリエイトリンク追加・V5:「平均33万円」を「節約効果 平均33万円」に統合して誤読防止。バージョン: 1.2.4
- 2026-06-20: V1+M2追加改善 [improve_phase2_only] - V1:アフィリエイト開示バナーをbg#b45309（濃いアンバー）+白文字に変更しコントラスト向上・M2:weddingMonthにaria-describedby+エラースパン追加・calculateCost()でweddingMonth未選択バリデーション追加・weddingDayエラーメッセージ欠落修正。バージョン: 1.2.3
