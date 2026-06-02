# 30サービスチャレンジ - Claude Code 常駐設定

Tech&Brace代表・徳永将之が運営する「30サービスチャレンジ」のワークスペース。
複数のWebサービス・アプリを並行開発・運用するためのチャンネル。

## プロジェクト概要

**目標**: 30種類のサービスを構築・公開し、副業収益の柱を作る

**ワークスペース**: `/Users/masayukitokunaga/workspace/30service/`

## サービス一覧（2026-05-14時点）

| # | ディレクトリ | サービス名 | 状態 |
|---|------------|----------|------|
| 1 | coffee-note-app | コーヒーノートアプリ | 開発中 |
| 2 | golf-iron-advisor | ゴルフアイアンアドバイザー | 開発中 |
| 3 | item-locator | 物品ロケーター | 開発中 |
| 4 | kids-activity-finder | 子ども活動検索 | 開発中 |
| 5 | packing-checklist | パッキングチェックリスト | 開発中 |

## オーナー情報

- **氏名**: 徳永将之（Masayuki Tokunaga）
- **会社**: Tech&Brace 代表、ドリームネット 取締役
- **専門**: AI/LLM導入支援、ITコンサル、医療IT
- **制約**: 育児優先・夜21時以降のみPC作業・週10h以内

## Bot役割分担（2台体制）

複数のClaude Codeセッション（Bot）が同じワークスペースを使用する。

| Bot | 役割 | 担当タスク |
|-----|------|----------|
| **Bot1（メイン）** | 重いタスク | サービス新規開発・大規模修正・スクリプト開発 |
| **Bot2（サブ）** | 軽いタスク | 日記記録・ファイル確認・調査・質問・簡単な修正 |

- メモリ・スクリプト・設定は共有（同一ワークスペース）
- 重い作業でBot1が詰まっている間、Bot2に軽いタスクを投げる
- 同じファイルの同時編集は避ける

## 作業ルール

- 育児最優先。PC作業は夜21時以降のみ
- タスクは1日1個・夜間前提
- 日記・ログは確認なしで即記録
- 各サービスのCLAUDE.mdを参照して作業コンテキストを把握する

## 日次サービス作成フロー（Phase 1-7 自動統合版）

### 1️⃣ 朝: サービス計画生成
```bash
python3 scripts/generate_today_plan.py
```
→ `today_plan.json` + テンプレート生成

### 2️⃣ 実装: Claude が実装
- `_data.py` の MAIN_HTML / JS_CODE を実装
- `index.html` が完成

### 3️⃣ ✨ Phase 1-7 自動適用（新機能）
```bash
python3 scripts/auto_apply_all_phases.py
```
→ 以下を自動適用:
- FAQPage / Organization / BreadcrumbList schemas
- Open Graph / Twitter Cards
- WebPage/Article schemas
- HowTo schemas（5ステップ）
- Accessibility (WCAG 2.1 AA)
- Content expansion (FAQ 5問・使用例)
- Core Web Vitals optimization

### 4️⃣ 後処理・デプロイ
```bash
python3 scripts/post_process_services.py
```

詳細: `scripts/PHASE_1_7_INTEGRATION.md` を参照

## 各サービスの参照先

作業前に対象サービスのディレクトリ内 CLAUDE.md / README.md / SPEC.md を必ず確認する。

## 完了連絡のフォーマット（必須）

サービス作成・改修タスクの完了メッセージには必ず以下を含める：

### タスク開始時
最初のツール呼び出し前に必ず実行：
```bash
bash /Users/masayukitokunaga/workspace/30service/scripts/start_task.sh
```

### HOURLY_IMPROVE=1 環境変数が設定されている場合
`hourly_claude_improve.py` のサブプロセスとして呼ばれている。この場合は **Telegram への完了通知を送信しない**。
通知は `hourly_claude_improve.py` 側の `_send_improve_notify` が一括で送信する。

### タスク完了時の連絡フォーマット（通常タスク）
Telegramへの完了メッセージに以下を含める：

```
✅ [タスク名] 完了

[作業内容サマリー]

$(bash /Users/masayukitokunaga/workspace/30service/scripts/get_task_stats.sh)
```

実際には `get_task_stats.sh` を実行してその出力を貼り付けること。
出力例：
⏱ 所要時間: 12分34秒
🔢 トークン: 入力:15,000 / 出力:8,500 / キャッシュ読:120,000 / 計:23,500tok (≈$0.162)
