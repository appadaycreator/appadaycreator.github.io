# 火災保険・住宅保険診断【無料】必要な補償をチェック - 技術仕様書

## 概要

**サービス名**: Home Insurance Advisor
**バージョン**: 1.2.2
**更新日**: 2026-06-04
**URL**: https://appadaycreator.com/home-insurance-advisor/

住宅タイプ・家族構成・補償ニーズから最適な火災保険のプランを診断。水災・地震保険の要否も判定。年間保険料の目安も表示します。

## データ管理

- **ストレージ**: URLパラメータ（結果共有対応）
- **外部通信**: なし（完全クライアントサイド処理）
- **データ永続化**: なし（ページリロードでリセット）

## 技術スタック

- HTML5 / CSS3 / Vanilla JavaScript
- PWA対応（manifest.json）
- レスポンシブデザイン（モバイルファースト）

## 診断フロー（v1.1.0 ウィザード式）

1. Q1: 住宅の種類（持ち家/賃貸・戸建て/マンション）
2. Q2: 居住地域の水害リスク（高/中/低）
3. Q3: 地震保険への意向（加入/不要/診断おまかせ）
4. Q4: 家族構成（単身/夫婦/子あり/高齢者あり）
5. Q5: 家財総額（200万未満/200〜500万/500万以上）
6. Q6: 築年数（5年未満/5〜20年/20年以上/不明）

## 保険料計算ロジック（v1.1.0）

加算方式による計算:
- ベース保険料（住宅タイプ別）
- 水害リスク加算: 高+0.8万円、低-0.3万円
- 地震保険加算: 加入+1.5万円、おまかせ+0.8万円
- 築年数補正係数: 新築×0.9、標準×1.0、築古×1.18
- 家財加算: 200〜500万+0.2万円、500万以上+0.5万円
- 賃貸は建物補償なしのため水害・年齢・地震補正を縮小適用

## 新機能（v1.1.0）

- ウィザード型UI（1問ずつ表示、プログレスバー）
- 年間保険料の目安表示（住宅タイプ・条件別）
- 補償項目の優先度バッジ（必須/推奨/任意/情報）
- 地震保険「判断おまかせ」の自動判定ロジック
  - スコアリング: 住宅タイプ（持ち家+3、マンション+2、賃貸+1）
  - 水害リスク（高+2、中+1）
  - スコア5以上→「強く推奨」、3以上→「推奨」、未満→「検討」
- 築20年以上の持ち家への警告メッセージ
- URLパラメータによる結果共有（?type=&flood=&quake=&family=&goods=&age=）
- 診断結果テキストコピー機能
- Web Share API対応シェアボタン

## よくある質問（FAQ）

**Q: 火災保険診断は無料で使えますか？**

はい、完全無料・登録不要でご利用いただけます。

**Q: 賃貸の場合も火災保険は必要ですか？**

はい、ほとんどの賃貸契約では火災保険（家財・借家人賠償責任）への加入が必須です。内容を確認して加入しましょう。

**Q: 地震保険は火災保険とセットで入るのですか？**

はい、地震保険は火災保険に付帯する形でのみ加入できます。単独では加入できません。

**Q: 火災保険の保険料の目安はいくらですか？**

住宅タイプ・築年数・補償内容により大きく異なります。持ち家一戸建てで年3〜8万円、賃貸マンションで年0.5〜2万円程度が目安です。

**Q: 診断結果は実際の保険加入に使えますか？**

参考情報としてご活用ください。実際の加入には保険会社・代理店・ファイナンシャルプランナーへのご相談をおすすめします。


## 関連サービス

- [電力プラン診断](https://appadaycreator.com/electricity-plan-advisor/)
- [家計簿診断ツール](https://appadaycreator.com/household-budget-analyzer/)
- [水道代節約診断](https://appadaycreator.com/water-bill-reducer/)

## テスト

| ファイル | フレームワーク | 概要 |
|---------|--------------|------|
| `tests/e2e/` | Playwright | 本番URL対象E2E（Jest対象外） |

## デプロイ

GitHub Pages（mainブランチ push → 自動デプロイ）

## 更新履歴

### v1.2.3 (2026-06-04)
**P1 改善**:
- contact.html に iOS Safari PWA対応メタタグを追加: `apple-mobile-web-app-capable`, `apple-mobile-web-app-title`, `apple-mobile-web-app-status-bar-style="default"`
  - 問題: contact.html に PWA メタタグが不足し、iOS Safari でのホーム画面追加時に theme-color が正しく表示されない
  - 解決: index.html と同じ iOS PWA対応メタタグを追加し、全ページで一貫性を確保

### v1.2.2 (2026-06-04)
**P1 改善**:
- iOS Safari PWA theme-color 修正: `apple-mobile-web-app-status-bar-style` を "black-translucent" から "default" に変更
  - 問題: translucent black status bar がオレンジ色のヘッダーを不適切にオーバーレイ
  - 解決: デフォルトの light status bar で theme-color が正しく表示されるように修正

### v1.2.1 (2026-06-04)
**P1 改善**:
- iOS Safari PWA対応: `apple-mobile-web-app-capable`, `apple-mobile-web-app-title`, `apple-mobile-web-app-status-bar-style` メタタグを追加
- manifest.json に `categories` フィールド追加（PWA仕様準拠・iOS/Android アプリストア対応）

### v1.2.0 (2026-06-03)
**P1 改善**:
- PWA メタデータ修正: manifest.json の name/short_name を "Sleep Quality Checker" から "火災保険診断" に修正
- アイコン再デザイン: SVG icon を保険テーマ（盾・炎・波）で統一色（#EA580C）に更新
- OGP 画像活用: og:image を汎用画像から service-specific な `/home-insurance-advisor/ogp.png` に変更

**P2 改善**:
- ウィザード UI の視認性向上: `.option-btn` min-height 60px → 64px、`.step-dot` 8px → 10px に拡大
- Google Fonts 最適化: 不要なウェイト（300, 500）を削除して LCP (Largest Contentful Paint) を改善
- キーボード操作対応: `.option-btn` に Enter/Space キーサポートを追加（WCAG 2.1 AA レベル対応）

## ライセンス

MIT License
