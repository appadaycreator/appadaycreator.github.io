#!/usr/bin/env python3
"""
1時間おきに「公開状況」シートのインプレッション(I列)上位5件に
/improve スキルを実行し、R列(サービス品質)・S列(改善回数)を更新する。

LaunchAgent: com.30service.hourly-claude-improve (StartInterval=3600)
ログ: /tmp/hourly_claude_improve.log
"""
import os
import sys
import json
import subprocess
import time
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

WORKSPACE = Path("/Users/masayukitokunaga/workspace/30service")
TOKEN_FILE = Path(__file__).parent / "token.json"
SPREADSHEET_ID = "15wuK_DCqaiAgWKky33jJtGhVuAL6u81tLcUVpR1ORm4"
SHEET = "公開状況"
LOG_SHEET = "サービス更新ログ"
LOG_HEADERS = ["日時", "No", "サービス名", "リポジトリ", "サービスURL", "改善前スコア", "改善後スコア", "スコア変化", "改善回数(通算)", "事前検出", "改善提案①", "実装内容②", "横展開先③", "横展開内容③", "所要時間(秒)"]
CLAUDE_BIN = Path.home() / ".local/bin/claude"
# モデル設定: 環境変数 CLAUDE_IMPROVE_MODEL で上書き可能
# 例: haiku=claude-haiku-4-5-20251001 / sonnet=claude-sonnet-4-6 / opus=claude-opus-4-7
_MODEL_ALIASES = {
    "haiku":  "claude-haiku-4-5-20251001",
    "sonnet": "claude-sonnet-4-6",
    "opus":   "claude-opus-4-7",
}
_model_env = os.environ.get("CLAUDE_IMPROVE_MODEL", "haiku")
CLAUDE_MODEL = _MODEL_ALIASES.get(_model_env, _model_env)  # エイリアスor直接モデルID
LOG_FILE = Path("/tmp/hourly_claude_improve.log")
LOCK_FILE = Path("/tmp/hourly_claude_improve.lock")
BOT_TOKEN = "8851812089:AAHo7TYkOvmepfgwgN7hmE9t3nqBm3HoHqk"  # @tokunaga_dev_bot（使用量・improve通知専用）
CHAT_ID = "8512824182"
SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]
N_WORKERS = 3        # 並列ワーカー数の上限（動的調整の最大値）
TOP_N = 3
TIMEOUT_SEC = 900    # 1サービスあたり最大15分（Haiku高速化で短縮）
COOLDOWN_SUCCESS_HOURS = 3   # 改善成功後のクールダウン
COOLDOWN_FAIL_HOURS   = 24  # 改善対象なし・エラー後のクールダウン
COOLDOWN_FILE = Path("/tmp/improve_cooldown.json")
INDEXNOW_KEY  = "060b5be77e884ff19fd16c1dcd467960"
INDEXNOW_HOST = "appadaycreator.com"

# 動的並列数調整: Claude使用量ログを読んで自動スロットリング
USAGE_LOG_FILE = Path.home() / ".openclaw" / "data" / "claude_usage_log.json"
# ワーカー1台あたりの推定消費レート（%/h）- 3並列で実測した値から算出
_SESSION_RATE_PER_W    = 15.0  # セッション(5h枠) - Haiku使用のため緩和
_WEEKLY_ALL_RATE_PER_W =  0.8  # 全モデル週次 - Haiku低コストのため緩和
_WEEKLY_SNT_RATE_PER_W =  3.0  # Sonnet週次（参照のみ・Haiku移行後は使用しない）

# 「公開状況」シートの期待ヘッダー（列インデックス: 期待キーワードリスト）
# いずれかのキーワードが含まれていればOK
EXPECTED_COLS = {
    0:  ["No", "no", "番号"],
    1:  ["サービス", "名前", "name"],
    3:  ["リポジトリ", "repo", "ディレクトリ"],
    9:  ["クリック", "Clicks", "click"],
    10: ["表示", "Impr", "インプレッション"],
    17: ["品質", "quality", "スコア"],
    18: ["改善", "回数", "count"],
    19: ["最終", "更新", "日時"],
}


def log(msg: str):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line, flush=True)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(line + "\n")


def notify_indexnow(repo: str) -> None:
    """改善完了したサービスURLをIndexNow経由でBing/Yahoo!Japanに即時通知する。"""
    import urllib.request, json as _json
    url = f"https://{INDEXNOW_HOST}/{repo}/"
    payload = {
        "host": INDEXNOW_HOST,
        "key": INDEXNOW_KEY,
        "keyLocation": f"https://{INDEXNOW_HOST}/{INDEXNOW_KEY}.txt",
        "urlList": [url],
    }
    data = _json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        "https://api.indexnow.org/indexnow",
        data=data, method="POST",
        headers={"Content-Type": "application/json; charset=utf-8"}
    )
    try:
        resp = urllib.request.urlopen(req, timeout=10)
        log(f"IndexNow通知完了: {url} (status={resp.status})")
    except Exception as e:
        log(f"IndexNow通知失敗: {e}")


def send_telegram(text: str):
    import urllib.request, urllib.parse, json as _json
    data = urllib.parse.urlencode({"chat_id": CHAT_ID, "text": text}).encode()
    req = urllib.request.Request(
        f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage", data=data, method="POST")
    try:
        resp = urllib.request.urlopen(req, timeout=10)
        body = _json.loads(resp.read())
        msg_id = body.get("result", {}).get("message_id", "?")
        log(f"Telegram送信完了 (message_id={msg_id})")
    except Exception as e:
        log(f"Telegram送信失敗: {e}")


def get_creds():
    creds = Credentials.from_authorized_user_file(str(TOKEN_FILE), SCOPES)
    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
    return creds


def safe_int(v) -> int:
    try:
        return int(float(str(v).replace(",", "")))
    except Exception:
        return 0


_cooldown_lock = None  # threading.Lock() は main() で初期化
_in_progress: set = set()  # 実行中リポジトリ（並列重複防止用）


def load_cooldown() -> dict:
    if COOLDOWN_FILE.exists():
        try:
            return json.loads(COOLDOWN_FILE.read_text())
        except Exception:
            return {}
    return {}


def is_in_cooldown(repo: str, cooldown: dict) -> bool:
    if repo not in cooldown:
        return False
    entry = cooldown[repo]
    # 新形式: {"ts": "...", "hours": N} / 旧形式: "..." (文字列)
    if isinstance(entry, dict):
        last = datetime.fromisoformat(entry["ts"])
        hours = entry.get("hours", COOLDOWN_SUCCESS_HOURS)
    else:
        last = datetime.fromisoformat(entry)
        hours = COOLDOWN_SUCCESS_HOURS
    return (datetime.now() - last).total_seconds() < hours * 3600


def set_cooldown(repo: str, cooldown: dict, success: bool, hours_override: int | None = None):
    if hours_override is not None:
        hours = hours_override
    else:
        hours = COOLDOWN_SUCCESS_HOURS if success else COOLDOWN_FAIL_HOURS
    cooldown[repo] = {"ts": datetime.now().isoformat(), "hours": hours}
    COOLDOWN_FILE.write_text(json.dumps(cooldown, ensure_ascii=False))


def claim_service(candidates: list) -> dict | None:
    """スレッド安全にサービスを1件クレームして返す。実行中セットで並列重複防止。"""
    with _cooldown_lock:
        cooldown = load_cooldown()
        available = [
            s for s in candidates
            if not is_in_cooldown(s["repo"], cooldown) and s["repo"] not in _in_progress
        ]
        if not available:
            return None
        svc = available[0]
        _in_progress.add(svc["repo"])  # 実行前にマーク（クールダウンはrun後にセット）
        return svc


def release_service(repo: str, success: bool, hours_override: int | None = None):
    """run_improve完了後に呼ぶ。クールダウンをセットして実行中セットから除外。"""
    with _cooldown_lock:
        cooldown = load_cooldown()
        set_cooldown(repo, cooldown, success=success, hours_override=hours_override)
        _in_progress.discard(repo)


def quick_scan(repo: str) -> list[str]:
    """Python側でgrepしてP1候補を検出する。claudeを呼ばずに問題を把握し、
    問題なしなら即スキップ、問題ありならPhase1省略で結果をclaudeに渡す。"""
    service_dir = WORKSPACE / repo
    issues = []

    def grep(pattern: str, path: str, opts: list[str] | None = None) -> str:
        cmd = ["grep", "-rl"] + (opts or []) + [pattern, path]
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        return r.stdout.strip()

    def grep_n(pattern: str, path: str, opts: list[str] | None = None) -> list[str]:
        cmd = ["grep", "-rn"] + (opts or []) + [pattern, path]
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        return [l for l in r.stdout.splitlines() if l.strip()]

    src = service_dir / "src"
    idx = service_dir / "index.html"

    if src.is_dir():
        # Vue/Viteサービス
        if grep("font-awesome", str(service_dir), ["--include=*.html", "--include=*.vue"]):
            issues.append("FontAwesome残存")
        if grep("console\\.log", str(src), ["--include=*.js", "--include=*.vue"]):
            issues.append("console.log残存")
        if grep("glass-panel", str(src), ["--include=*.vue"]):
            issues.append("glass-panel残存")
        no_alt = [l for l in grep_n("<img", str(src), ["--include=*.vue"]) if "alt=" not in l]
        if no_alt:
            issues.append(f"img alt属性なし({len(no_alt)}件)")
        # PWAテーマカラーが変更されていない（デフォルトindigo色）
        if idx.exists():
            html = idx.read_text(errors="ignore")
            if "#6366" in html or "6366f1" in html.lower():
                issues.append("PWA theme-colorデフォルト色")
    elif idx.exists():
        # 静的HTMLサービス
        html = idx.read_text(errors="ignore")
        if "font-awesome" in html.lower() or ' class="fa-' in html:
            issues.append("FontAwesome残存")
        if "GTM-" not in html:
            issues.append("GTM未設定")
        if "FAQPage" not in html:
            issues.append("FAQPageスキーマなし")
        if "schema.org" not in html:
            issues.append("構造化データなし")
        if "#6366" in html or "6366f1" in html.lower():
            issues.append("PWA theme-colorデフォルト色")

    return issues


def validate_headers(sheets) -> bool:
    """公開状況シートのヘッダー行を取得して想定列と一致するか検証する。
    不一致があればTelegram通知してFalseを返す。"""
    result = sheets.get(
        spreadsheetId=SPREADSHEET_ID,
        range=f"{SHEET}!A1:T1"
    ).execute()
    header_row = result.get("values", [[]])[0] if result.get("values") else []
    log(f"ヘッダー確認: {header_row}")

    mismatches = []
    for col_idx, keywords in EXPECTED_COLS.items():
        actual = header_row[col_idx].strip() if col_idx < len(header_row) else "(空)"
        if not any(kw.lower() in actual.lower() for kw in keywords):
            mismatches.append(f"  列{col_idx}({chr(65+col_idx)}): 期待={keywords} / 実際='{actual}'")

    if mismatches:
        msg = f"⚠️ 公開状況シートのヘッダーが変わっている可能性があります。\n" + "\n".join(mismatches)
        log(msg)
        send_telegram(msg)
        return False
    return True


def get_top_services(sheets) -> list[dict]:
    """公開状況シートから全対象サービスを取得（リポジトリ未存在・非公開は除外）
    列マッピング（2026-05-28確認）:
      A(0)=No., B(1)=サービス名, D(3)=リポジトリ名
      J(9)=Clicks7d, K(10)=Impr7d, P(15)=公開/非公開
      R(17)=サービス品質, S(18)=改善回数
    """
    result = sheets.get(
        spreadsheetId=SPREADSHEET_ID,
        range=f"{SHEET}!A:AL"
    ).execute()
    rows = result.get("values", [])
    if len(rows) < 2:
        return []

    services = []
    for i, row in enumerate(rows[1:], start=2):
        if not row or not row[0]:
            continue
        no = str(row[0]).strip()
        name = row[1].strip() if len(row) > 1 else ""
        repo = row[3].strip() if len(row) > 3 else ""
        public_status = row[15].strip() if len(row) > 15 else ""  # P列: 公開/非公開
        clicks7d = safe_int(row[9])  if len(row) > 9  else 0  # J列: Clicks7d
        impr7d   = safe_int(row[10]) if len(row) > 10 else 0  # K列: Impr7d
        r_val    = safe_int(row[17]) if len(row) > 17 and row[17] else 0  # R列
        s_val    = safe_int(row[18]) if len(row) > 18 and row[18] else 0  # S列
        affil    = row[37].strip() if len(row) > 37 else ""  # AL列: アフィリエイト状況

        # 非公開サービスはスキップ
        if public_status == "非公開" or public_status == "":
            continue

        # リポジトリ名が空またはディレクトリが存在しない場合はスキップ
        if not repo:
            continue
        service_dir = WORKSPACE / repo
        if not service_dir.is_dir():
            continue

        # 複合スコア: Impr7d + Clicks7d×5（クリックを重視）
        combined = impr7d + clicks7d * 5

        services.append({
            "row": i,
            "no": no,
            "name": name,
            "repo": repo,
            "impr7d": impr7d,
            "clicks7d": clicks7d,
            "combined": combined,
            "r_val": r_val,
            "s_val": s_val,
            "affil": affil,
        })

    return sorted(services, key=lambda x: -x["combined"])


def calc_ultra_strict_asset(name: str, clicks: int, affil: str) -> int:
    """
    売却可能最低値を超厳格算出。
    - 静的HTML/公開GitHub = 誰でもfork可能 → 技術参入障壁ゼロ
    - 収益0 = 買い手が払う理由は「手間省略」のみ
    - アフィリエイト申請中 = 未確定 → 加算しない
    - 収益実績なし → 上限3万円のハードキャップ
    """
    if any(x in name for x in ["都議選", "参院選", "選挙"]):
        return 1000

    base = 3000

    if any(x in name for x in ["FIRE", "住宅ローン", "確定申告", "医療費控除", "所得税",
                                 "借金", "NISA", "iDeCo", "相続", "遺産"]):
        niche = 4000
    elif any(x in name for x in ["保険", "証券", "不動産投資", "ローン返済", "ローン借り換え",
                                   "転職", "副業", "フリーランス", "起業"]):
        niche = 2000
    elif any(x in name for x in ["シミュレーター", "計算ツール"]) and \
         any(x in name for x in ["費用", "コスト", "料金", "代", "税"]):
        niche = 1000
    else:
        niche = 0

    if clicks >= 50:
        traffic = 12000
    elif clicks >= 31:
        traffic = 8000
    elif clicks >= 21:
        traffic = 5000
    elif clicks >= 11:
        traffic = 3000
    elif clicks >= 6:
        traffic = 1500
    elif clicks >= 1:
        traffic = 500
    else:
        traffic = 0

    affil_bonus = 8000 if ("✅" in (affil or "")) else 0

    total = min(base + niche + traffic + affil_bonus, 30000)
    return round(total / 1000) * 1000


def calculate_score(repo: str) -> int:
    """サービス品質スコアを多角的視点で厳しく評価（0-100点）。
    0点スタートで各観点を積み上げる方式。基本点は与えない。

    採点基準（Vue/Vite系）:
      コード品質(25): FontAwesome廃止+15, glass-panel廃止+5, console.log廃止+5
      デザインシステム(20): gd-*CSS変数+10, GDIcon.vue+10
      PWA/SEO(20): theme-color適切+10, meta description+5, OG tags+5
      アクセシビリティ(15): img alt全設定+10, タップ領域48px+5
      ドキュメント(10): SPEC.md+5, CLAUDE.md+5
      テスト・ビルド(10): package.jsonにtest+5, build script+5

    採点基準（静的HTML系）:
      SEO構造化(30): FAQPage+10, HowTo+10, schema.org+10
      計測・広告(20): GTM+15, OG tags+5
      コード品質(20): FontAwesome廃止+15, console.log廃止+5
      アクセシビリティ(15): img alt+10, theme-color適切+5
      ドキュメント(15): SPEC.md+10, CLAUDE.md+5
    """
    service_dir = WORKSPACE / repo
    idx = service_dir / "index.html"
    package_json = service_dir / "package.json"
    score = 0

    def file_contains(path, pattern: str) -> bool:
        try:
            return pattern in Path(path).read_text(errors="ignore")
        except Exception:
            return False

    def grep_any(pattern: str, directory: str, exts: list[str]) -> bool:
        for ext in exts:
            r = subprocess.run(
                ["grep", "-rl", pattern, directory, f"--include=*.{ext}"],
                capture_output=True, text=True, timeout=10
            )
            if r.stdout.strip():
                return True
        return False

    if package_json.exists():
        # ===== Vue/Vite系 =====
        src = service_dir / "src"

        # コード品質(25点)
        has_fa = grep_any("font-awesome", str(service_dir), ["html", "vue", "js"])
        if not has_fa:
            score += 15
        has_glass = grep_any("glass-panel", str(src), ["vue"]) if src.is_dir() else False
        if not has_glass:
            score += 5
        has_console = grep_any("console.log", str(src), ["vue", "js"]) if src.is_dir() else False
        if not has_console:
            score += 5

        # デザインシステム(20点)
        style_css = src / "style.css"
        if src.is_dir() and style_css.exists() and "--gd-" in style_css.read_text(errors="ignore"):
            score += 10
        if src.is_dir() and (src / "components" / "GDIcon.vue").exists():
            score += 10

        # PWA/SEO(20点)
        if idx.exists():
            html = idx.read_text(errors="ignore")
            if "theme-color" in html and "#6366" not in html and "6366f1" not in html.lower():
                score += 10
            if 'name="description"' in html or "og:description" in html:
                score += 5
            if "og:title" in html or "og:image" in html:
                score += 5

        # アクセシビリティ(15点)
        if src.is_dir():
            r = subprocess.run(
                ["grep", "-rn", "<img", str(src), "--include=*.vue"],
                capture_output=True, text=True, timeout=10
            )
            imgs = r.stdout.splitlines()
            no_alt = [l for l in imgs if "alt=" not in l]
            if not no_alt:
                score += 10
            has_small_tap = grep_any(r"min-h-\[44px\]", str(src), ["vue"])
            if not has_small_tap:
                score += 5

        # ドキュメント(10点)
        if (service_dir / "SPEC.md").exists():
            score += 5
        if (service_dir / "CLAUDE.md").exists():
            score += 5

        # テスト・ビルド(10点)
        try:
            pkg = json.loads(package_json.read_text())
            scripts = pkg.get("scripts", {})
            if "build" in scripts:
                score += 5
            if "test" in scripts:
                score += 5
        except Exception:
            pass

    elif idx.exists():
        # ===== 静的HTML系 =====
        html = idx.read_text(errors="ignore")

        # SEO構造化(30点)
        if "FAQPage" in html:
            score += 10
        if "HowTo" in html:
            score += 10
        if "schema.org" in html:
            score += 10

        # 計測・広告(20点)
        if "GTM-" in html:
            score += 15
        if "og:title" in html or "og:image" in html:
            score += 5

        # コード品質(20点)
        if "font-awesome" not in html.lower() and ' class="fa-' not in html:
            score += 15
        if "console.log" not in html:
            score += 5

        # アクセシビリティ(15点)
        import re
        imgs = re.findall(r"<img[^>]*>", html, re.IGNORECASE)
        no_alt = [img for img in imgs if "alt=" not in img.lower()]
        if not no_alt:
            score += 10
        if "theme-color" in html and "#6366" not in html:
            score += 5

        # ドキュメント(15点)
        if (service_dir / "SPEC.md").exists():
            score += 10
        if (service_dir / "CLAUDE.md").exists():
            score += 5

    return min(score, 100)


def setup_log_headers(sheets):
    """ログシートのヘッダーを設定/更新する（常に最新のLOG_HEADERSで上書き）。"""
    n = len(LOG_HEADERS)
    end_col = chr(ord("A") + n - 1)
    sheets.update(
        spreadsheetId=SPREADSHEET_ID,
        range=f"{LOG_SHEET}!A1:{end_col}1",
        valueInputOption="USER_ENTERED",
        body={"values": [LOG_HEADERS]}
    ).execute()
    log("ログシートのヘッダーを設定しました")


def _extract_phase(stdout: str, phase_markers: list[str], next_markers: list[str], max_len: int = 500) -> str:
    """stdout から指定フェーズのブロックを抽出する。"""
    if not stdout:
        return ""
    start = -1
    for marker in phase_markers:
        idx = stdout.find(marker)
        if idx != -1:
            start = idx
            break
    if start == -1:
        return ""
    end = len(stdout)
    for marker in next_markers:
        idx = stdout.find(marker, start + 1)
        if idx != -1 and idx < end:
            end = idx
    block = stdout[start:end].strip()
    return block[:max_len]


def _extract_log_parts(stdout: str) -> tuple[str, str, str, str, int]:
    """stdout から ①改善提案 ②実装内容 ③横展開先 ③横展開内容 資産価値(円) を返す。"""
    if not stdout:
        return "", "", "", "", 0

    # デバッグ: stdout冒頭と末尾をファイルに保存
    try:
        Path("/tmp/improve_stdout_debug.txt").write_text(
            f"=== 先頭1000文字 ===\n{stdout[:1000]}\n\n=== 末尾1000文字 ===\n{stdout[-1000:]}\n",
            encoding="utf-8"
        )
    except Exception:
        pass

    # ①改善提案: Phase1のmarkdown提案ブロック（### 1. タイトル 形式）
    # または完成度評価テーブルの直前まで
    proposal = _extract_phase(
        stdout,
        ["### 1.", "### [1]", "**目的**", "P1 |", "| P1 |", "優先度順", "①改善点提案", "改善点提案"],
        ["## 完成度評価", "## 資産価値", "フェーズ2", "フェーズ１完了", "📋 実装内容", "✅ /improve_auto"],
        600
    )

    # ②実装内容: 通知ブロックの📋実装内容セクション（最も確実なマーカー）
    impl = _extract_phase(
        stdout,
        ["📋 実装内容", "② 実装内容", "②実装内容"],
        ["🔁 横展開", "📊 完成度", "⏱ 所要時間", "🔢 トークン"],
        600
    )
    # フォールバック: •/・/✅で始まる実装行を収集
    if not impl:
        lines = [l.strip() for l in stdout.splitlines()
                 if l.strip().startswith(("✅", "•", "・", "- ")) and len(l.strip()) > 5]
        impl = "\n".join(lines[:10])[:500]

    # ③横展開: 🔁 横展開セクション
    cross_block = _extract_phase(
        stdout,
        ["🔁 横展開", "③横展開", "## 横展開"],
        ["⏱ 所要時間", "🔢 トークン", "---"],
        800
    )

    # 横展開先サービス名を抽出（行中のリポジトリっぽい文字列）
    import re
    cross_targets = ""
    cross_content = ""
    if cross_block:
        # リポジトリ名パターン（小文字-区切り）を抽出
        repos = re.findall(r"\b([a-z][a-z0-9-]{3,40})\b", cross_block)
        # 既知のワークスペースに存在するものに絞る
        ws = Path("/Users/masayukitokunaga/workspace/30service")
        valid = [r for r in dict.fromkeys(repos) if (ws / r).is_dir()]
        cross_targets = ", ".join(valid[:10]) if valid else ""
        cross_content = cross_block[:400]

    # 資産価値（円）を抽出 - レンジ形式は中央値に変換
    import re as _re2
    asset_value = 0

    def _midpoint(lo: str, hi: str) -> int:
        """「X〜Y万円」→ 最低予想金額（下限・円）"""
        try:
            a = int(lo.replace(",", "").replace("，", ""))
            return a * 10000
        except ValueError:
            return 0

    def _single(s: str) -> int:
        try:
            return int(s.replace(",", "").replace("，", "")) * 10000
        except ValueError:
            return 0

    _RANGE = r"¥?(\d[\d,，]*)\s*[〜～~]\s*¥?(\d[\d,，]*)\s*万円"
    _SINGLE = r"¥?(\d[\d,，]*)\s*万円"

    # パターン1: 「資産価値: ¥X〜¥Y万円 → ¥A〜¥B万円」→ 改善後の中央値
    m = _re2.search(r"資産価値[^\n]{0,30}→[^\n]{0,5}" + _RANGE, stdout)
    if m:
        asset_value = _midpoint(m.group(1), m.group(2))
    # パターン2: 「完成後目標: ¥X〜¥Y万円」→ 中央値
    if not asset_value:
        m = _re2.search(r"完成後目標[^\d\n]{0,15}" + _RANGE, stdout)
        if m:
            asset_value = _midpoint(m.group(1), m.group(2))
    # パターン3: 「資産価値: ¥X万円 → ¥Y万円」→ 後者
    if not asset_value:
        m = _re2.search(r"資産価値[^\n]{0,30}→[^\n]{0,5}" + _SINGLE, stdout)
        if m:
            asset_value = _single(m.group(1))
    # パターン4: 「完成後目標: ¥X万円」→ 単一値
    if not asset_value:
        m = _re2.search(r"完成後目標[^\d\n]{0,15}" + _SINGLE, stdout)
        if m:
            asset_value = _single(m.group(1))
    # フォールバック: stdout中の全「万円」隣接数値の最大値
    if not asset_value:
        all_vals = [_single(v) for v in _re2.findall(r"(\d[\d,，]*)\s*万円", stdout)]
        if all_vals:
            asset_value = max(all_vals)

    # デバッグ: 抽出結果をファイルに記録（確認後削除可）
    try:
        snippet = stdout[max(0, stdout.find("資産価値")-50):stdout.find("資産価値")+200] if "資産価値" in stdout else stdout[-300:]
        Path("/tmp/asset_debug.txt").write_text(
            f"asset_value={asset_value}\n万円_count={stdout.count('万円')}\nsnippet:\n{snippet}\n",
            encoding="utf-8"
        )
    except Exception:
        pass

    return proposal, impl, cross_targets, cross_content, asset_value


def write_update_log(sheets, svc: dict, score_before: int, score_after: int,
                     pre_issues: list, stdout: str, elapsed_sec: int):
    """サービス更新ログシートに改善記録を1行追加する。"""
    try:
        proposal, impl, cross_targets, cross_content, _ = _extract_log_parts(stdout)
        delta = score_after - score_before
        delta_str = f"+{delta}" if delta >= 0 else str(delta)
        service_url = f"https://appadaycreator.com/{svc['repo']}/"
        row = [
            datetime.now().strftime("%Y/%m/%d %H:%M"),
            svc["no"],
            svc["name"],
            svc["repo"],
            service_url,
            score_before,
            score_after,
            delta_str,
            svc["s_val"] + 1,
            ", ".join(pre_issues) if pre_issues else "なし",
            proposal,
            impl,
            cross_targets,
            cross_content,
            elapsed_sec,
        ]
        sheets.append(
            spreadsheetId=SPREADSHEET_ID,
            range=f"{LOG_SHEET}!A:O",
            valueInputOption="USER_ENTERED",
            insertDataOption="INSERT_ROWS",
            body={"values": [row]}
        ).execute()
        log(f"  ログ記録: {svc['name']} {score_before}→{score_after}点 ({delta_str}) 横展開={cross_targets or 'なし'}")
    except Exception as e:
        log(f"  ログ記録失敗: {e}")


def update_spreadsheet(sheets, row: int, score: int, s_val: int, asset_value: int = 0):
    """R列(サービス品質)・S列(改善回数)・T列(最終更新日時)・AM列(資産価値)をbatchUpdateで1回に統合"""
    now = datetime.now().strftime("%Y/%m/%d %H:%M")
    sheets.batchUpdate(
        spreadsheetId=SPREADSHEET_ID,
        body={
            "valueInputOption": "USER_ENTERED",
            "data": [
                {"range": f"{SHEET}!R{row}:T{row}", "values": [[score, s_val + 1, now]]},
                {"range": f"{SHEET}!AM{row}", "values": [[asset_value]]},
            ],
        }
    ).execute()


def _send_improve_notify(svc: dict, score: int, stdout: str, worker_id: int):
    """改善完了通知を @tokunaga_dev_bot へ送信する。"""
    # stdoutから📋〜の通知ブロックを抽出（improve_auto.md が出力している場合）
    notify_text = ""
    if "📋 実装内容" in stdout:
        start = stdout.find("✅")
        if start == -1:
            start = stdout.find("📋")
        end = stdout.rfind("(≈$")
        if end != -1:
            end = stdout.find("\n", end) + 1
        if start != -1:
            notify_text = stdout[start:end].strip() if end > start else stdout[start:start+2000].strip()

    # 抽出できなかった場合は _extract_log_parts で内容を組み立てる
    if not notify_text:
        proposal, impl, cross_targets, cross_content, _ = _extract_log_parts(stdout)
        lines = [f"✅ /improve_auto {svc['name']} 完了", "", f"📊 品質スコア: {score}点"]
        if proposal:
            lines += ["", "📋 改善提案:", proposal[:400]]
        if impl:
            lines += ["", "🔧 実装内容:", impl[:400]]
        if cross_targets:
            lines += ["", f"🔁 横展開: {cross_targets}"]
        notify_text = "\n".join(lines)

    # 末尾にURLを追加（未含の場合のみ）
    url = f"https://appadaycreator.com/{svc['repo']}/"
    if url not in notify_text:
        notify_text += f"\n\n🔗 {url}"

    send_telegram(notify_text)
    log(f"[W{worker_id}]   通知送信完了")


def run_improve(service: dict, pre_issues: list[str]) -> tuple[bool, str]:
    """指定サービスに /improve_auto を実行。(成功フラグ, stdout) を返す。"""
    no = service["no"]
    repo = service["repo"]
    cmd = f"/improve_auto {no} {repo}"
    if pre_issues:
        cmd += f"\n事前スキャン済みP1問題: {', '.join(pre_issues)}"
    log(f"実行: /improve_auto {no} {repo} (P1: {pre_issues})")

    try:
        env = os.environ.copy()
        env["HOURLY_IMPROVE"] = "1"  # Telegram通知を/improve_auto側でスキップさせる
        result = subprocess.run(
            [str(CLAUDE_BIN), "--dangerously-skip-permissions", "-p", cmd,
             "--model", CLAUDE_MODEL,
             "--output-format", "text",
             "--max-turns", "35"],
            cwd=str(WORKSPACE / repo),
            capture_output=True,
            text=True,
            timeout=TIMEOUT_SEC,
            env=env,
        )
        if result.returncode == 0:
            log(f"✓ {repo}: 完了")
            return True, result.stdout
        else:
            log(f"✗ {repo}: 失敗 (code={result.returncode})\n{result.stderr[:300]}")
            return False, ""
    except subprocess.TimeoutExpired:
        log(f"✗ {repo}: タイムアウト({TIMEOUT_SEC}s)")
        return False, ""
    except Exception as e:
        log(f"✗ {repo}: エラー: {e}")
        return False, ""


SLEEP_BETWEEN = 300   # 改善完了後の次サービスまでの待機秒数（5分）
SLEEP_COOLDOWN = 300  # 全サービスクールダウン中の待機秒数（5分）


def _compute_optimal_workers() -> int:
    """Claude使用状況ログからセッション/週次の指標を見て安全な並列数を返す。

    設計方針:
    - セッション(5h)・週次ともに常時監視し、週間ペースが均等になるよう制御。
    - 上限95%で安全マージン確保。
    - 最低1並列は維持（0にはしない）。
    """
    try:
        if not USAGE_LOG_FILE.exists():
            return N_WORKERS
        entries = json.loads(USAGE_LOG_FILE.read_text())
        if not entries:
            return N_WORKERS
        latest = entries[-1] if isinstance(entries, list) else entries

        # ログの鮮度確認（30分以上古い場合は信頼性低）
        from datetime import timezone, timedelta
        ts = datetime.fromisoformat(latest.get("timestamp", "1970-01-01T00:00:00+00:00"))
        if (datetime.now(timezone.utc) - ts).total_seconds() > 1800:
            return N_WORKERS

        data = latest.get("data", {})
        now_utc = datetime.now(timezone.utc)

        def max_w(key, rate_per_w):
            m = data.get(key)
            if not m or m.get("utilization") is None:
                return N_WORKERS
            pct = float(m["utilization"])
            resets_str = m.get("resets_at")
            if not resets_str:
                return N_WORKERS
            resets_at = datetime.fromisoformat(resets_str.replace("Z", "+00:00"))
            hours_left = max((resets_at - now_utc).total_seconds() / 3600, 0.1)
            safe_rate = max(95.0 - pct, 0.0) / hours_left
            return max(1, int(safe_rate / rate_per_w + 1e-9))

        w_session = max_w("five_hour",  _SESSION_RATE_PER_W)
        w_all     = max_w("seven_day",  _WEEKLY_ALL_RATE_PER_W)
        # Haiku使用のためSonnet週次チェックは不要
        optimal = max(1, min(w_session, w_all, N_WORKERS))

        return optimal
    except Exception as e:
        log(f"使用量計算エラー: {e}")
        return N_WORKERS


def _compute_sleep_between() -> int:
    """週次Sonnetのペース超過度に応じてSLEEP_BETWEENを動的計算する。"""
    try:
        from datetime import timezone
        if not USAGE_LOG_FILE.exists():
            return SLEEP_BETWEEN
        entries = json.loads(USAGE_LOG_FILE.read_text())
        if not entries:
            return SLEEP_BETWEEN
        latest = entries[-1] if isinstance(entries, list) else entries
        data = latest.get("data", {})
        sd = data.get("seven_day")  # Haiku使用のため全モデル週次で判定
        if not sd or not sd.get("resets_at"):
            return SLEEP_BETWEEN
        pct = float(sd.get("utilization", 0))
        resets_at = datetime.fromisoformat(sd["resets_at"].replace("Z", "+00:00"))
        now_utc = datetime.now(timezone.utc)
        hours_left = max((resets_at - now_utc).total_seconds() / 3600, 0.1)
        ideal_pct = (1.0 - hours_left / (7 * 24)) * 100.0
        over = pct - ideal_pct
        if over <= 5.0:
            return SLEEP_BETWEEN        # 300s (通常)
        elif over <= 15.0:
            return SLEEP_BETWEEN * 2   # 600s
        elif over <= 25.0:
            return SLEEP_BETWEEN * 4   # 1200s
        else:
            return SLEEP_BETWEEN * 8   # 2400s
    except Exception:
        return SLEEP_BETWEEN


def _worker(worker_id: int, stop_event, sheets_factory):
    """並列ワーカー: サービスをクレームして改善を繰り返す。"""
    log(f"[W{worker_id}] ワーカー起動")
    while not stop_event.is_set():
        try:
            # 動的スロットリング: 使用量に応じて不要ワーカーをスリープ
            optimal = _compute_optimal_workers()
            if worker_id >= optimal:
                log(f"[W{worker_id}] スロットル中 (最適={optimal}/{N_WORKERS}並列)。{SLEEP_COOLDOWN}秒後に再確認")
                time.sleep(SLEEP_COOLDOWN)
                continue

            sheets = sheets_factory()
            candidates = get_top_services(sheets)
            if not candidates:
                log(f"[W{worker_id}] 対象サービスが見つかりません")
                time.sleep(SLEEP_COOLDOWN)
                continue

            # クールダウン除外ログ（W0のみ表示して重複を防ぐ）
            if worker_id == 0:
                cooldown = load_cooldown()
                skipped = [s["repo"] for s in candidates if is_in_cooldown(s["repo"], cooldown)]
                if skipped:
                    log(f"クールダウン除外: {skipped}")

            svc = claim_service(candidates)
            if not svc:
                log(f"[W{worker_id}] 全候補がクールダウン中（{SLEEP_COOLDOWN}秒後に再試行）")
                time.sleep(SLEEP_COOLDOWN)
                continue

            log(f"[W{worker_id}] --- {svc['no']} {svc['name']} ({svc['repo']}) ---")
            pre_issues = quick_scan(svc["repo"])
            log(f"[W{worker_id}]   事前スキャン: {pre_issues if pre_issues else '検出なし'}")
            score_before = svc["r_val"]

            # 飽和判定: 高品質+改善済み+低トラフィックはClaude不要
            # (quick_scanは構造的な既知問題のみ検出するため、これはスコアベースで判定)
            r = svc["r_val"]; s = svc["s_val"]; impr = svc["impr7d"]; cl = svc["clicks7d"]
            saturated = (
                (r >= 90 and s >= 3 and cl < 3) or   # S/A上位・十分改善済み・無トラフィック
                (r >= 80 and s >= 5 and impr < 10)    # 高品質・5回以上改善・表示ほぼなし
            )
            if saturated and not pre_issues:
                log(f"[W{worker_id}]   飽和判定スキップ (score={r}, 改善={s}回, impr={impr}, cl={cl})")
                release_service(svc["repo"], success=False)
                time.sleep(_compute_sleep_between())
                continue

            # A) トラフィックゼロは改善しても効果薄→24hクールダウン
            zero_traffic = svc["combined"] == 0

            t_start = time.time()
            ok, stdout = run_improve(svc, pre_issues)
            elapsed = int(time.time() - t_start)

            # D) スコア変化なし or トラフィックゼロ → クールダウン延長
            hours_override = None
            if zero_traffic:
                hours_override = 24
                log(f"[W{worker_id}]   トラフィックゼロ: クールダウン24h")

            if ok:
                score = calculate_score(svc["repo"])
                if score == score_before and hours_override is None:
                    hours_override = COOLDOWN_SUCCESS_HOURS * 2
                    log(f"[W{worker_id}]   スコア変化なし ({score_before}点): クールダウン延長 {hours_override}h")
                # Claudeの楽観的テキスト解析を廃止 → 超厳格計算式で算出
                asset_value = calc_ultra_strict_asset(svc["name"], svc["clicks7d"], svc.get("affil", ""))
                release_service(svc["repo"], success=ok, hours_override=hours_override)
                try:
                    update_spreadsheet(sheets, svc["row"], score, svc["s_val"], asset_value)
                    log(f"[W{worker_id}]   シート更新: R={score}, S={svc['s_val']+1}, T={datetime.now().strftime('%Y/%m/%d %H:%M')}, AM={asset_value:,}円")
                except Exception as e:
                    log(f"[W{worker_id}]   シート更新失敗: {e}")
                write_update_log(sheets, svc, score_before, score, pre_issues, stdout, elapsed)
                notify_indexnow(svc["repo"])
                _send_improve_notify(svc, score, stdout, worker_id)
            else:
                release_service(svc["repo"], success=ok, hours_override=hours_override)
                log(f"[W{worker_id}]   {svc['name']}: 改善対象なし")

            sleep_sec = _compute_sleep_between()
            if sleep_sec != SLEEP_BETWEEN:
                log(f"[W{worker_id}] ペース超過: 次サービスまで{sleep_sec}s待機")
            time.sleep(sleep_sec)

        except Exception as e:
            log(f"[W{worker_id}] エラー（継続）: {e}")
            try:
                _in_progress.discard(svc["repo"])
            except Exception:
                pass
            time.sleep(SLEEP_COOLDOWN)

    log(f"[W{worker_id}] ワーカー終了")


ASSET_CACHE_FILE = Path("/tmp/asset_total_cache.json")


def _get_total_asset_value() -> int:
    """公開状況シートのAM列（資産価値）の合計を返す。"""
    try:
        creds = get_creds()
        sheets = build("sheets", "v4", credentials=creds).spreadsheets().values()
        result = sheets.get(
            spreadsheetId=SPREADSHEET_ID,
            range=f"{SHEET}!AM2:AM500"
        ).execute()
        rows = result.get("values", [])
        total = 0
        for row in rows:
            if row:
                try:
                    total += int(float(str(row[0]).replace(",", "")))
                except (ValueError, TypeError):
                    pass
        return total
    except Exception as e:
        log(f"資産価値合計取得エラー: {e}")
        return -1


def _send_hourly_status(stop_event):
    """毎時N:00に稼働状況をTelegramへ送信するスレッド。"""
    from datetime import timezone, timedelta
    time.sleep(5)  # 起動直後の初期化を待つ

    while not stop_event.is_set():
        # 次の :00 まで待機
        now = datetime.now()
        next_hour = (now + timedelta(hours=1)).replace(minute=0, second=0, microsecond=0)
        wait_sec = (next_hour - now).total_seconds()
        # 30秒刻みでstop_eventを確認しながら待機
        elapsed = 0.0
        while elapsed < wait_sec and not stop_event.is_set():
            chunk = min(30.0, wait_sec - elapsed)
            time.sleep(chunk)
            elapsed += chunk
        if stop_event.is_set():
            return
        try:
            if not USAGE_LOG_FILE.exists():
                continue
            entries = json.loads(USAGE_LOG_FILE.read_text())
            if not entries:
                continue
            latest = entries[-1] if isinstance(entries, list) else entries
            data = latest.get("data", {})
            now_utc = datetime.now(timezone.utc)
            jst = timezone(timedelta(hours=9))
            now_jst = datetime.now(jst).strftime("%m/%d %H:%M")

            # 直近1時間の処理件数とサービス名をログから集計
            completed_1h = 0
            completed_services = []  # 重複除去済みサービス名リスト
            try:
                cutoff = datetime.now() - timedelta(hours=1)
                cutoff_str = cutoff.strftime("%Y-%m-%d %H:%M")
                seen = {}  # 重複除去用（dict で順序保持）
                for line in LOG_FILE.read_text(encoding="utf-8", errors="ignore").splitlines():
                    if "✓ " in line and ": 完了" in line:
                        ts_part = line[1:17]
                        if ts_part >= cutoff_str:
                            # サービス名を抽出: "✓ {name}: 完了"
                            try:
                                svc_name = line.split("✓ ", 1)[1].split(": 完了")[0].strip()
                                seen[svc_name] = None
                            except Exception:
                                pass
                completed_services = list(seen.keys())
                completed_1h = len(completed_services)
            except Exception:
                pass

            # 資産価値合計と直近1時間変化
            current_total = _get_total_asset_value()
            prev_total = -1
            try:
                if ASSET_CACHE_FILE.exists():
                    prev_total = json.loads(ASSET_CACHE_FILE.read_text()).get("total", -1)
            except Exception:
                pass
            if current_total >= 0:
                ASSET_CACHE_FILE.write_text(json.dumps({"total": current_total}))
            asset_change = current_total - prev_total if (current_total >= 0 and prev_total >= 0) else None

            def fmt_yen(v):
                return f"¥{v:,}円 (≈{v//10000}万円)" if abs(v) >= 10000 else f"¥{v:,}円"

            lines = [f"🤖 hourly_claude_improve 稼働状況 {now_jst} JST\n"]
            svc_names_str = ", ".join(completed_services) if completed_services else "なし"
            lines.append(f"📦 直近1時間処理件数: {completed_1h}件\n   {svc_names_str}")
            if current_total >= 0:
                lines.append(f"💰 総資産価値: {fmt_yen(current_total)}")
            if asset_change is not None:
                sign = "+" if asset_change >= 0 else ""
                emoji = "📈" if asset_change >= 0 else "📉"
                lines.append(f"{emoji} 直近1時間変化: {sign}{fmt_yen(asset_change)}")
            lines.append("")
            min_w = N_WORKERS
            for key, label, rate in [
                ("five_hour",        "セッション(5h)",   _SESSION_RATE_PER_W),
                ("seven_day",        "全モデル週次",     _WEEKLY_ALL_RATE_PER_W),
                ("seven_day_sonnet", "Sonnet週次",      _WEEKLY_SNT_RATE_PER_W),
            ]:
                m = data.get(key)
                if not m or m.get("utilization") is None:
                    lines.append(f"・{label}: データなし")
                    continue
                pct = float(m["utilization"])
                resets_str = m.get("resets_at", "")
                resets_at = datetime.fromisoformat(resets_str.replace("Z", "+00:00"))
                hours_left = max((resets_at - now_utc).total_seconds() / 3600, 0.1)
                safe_rate = max(95.0 - pct, 0.0) / hours_left
                # _compute_optimal_workers と同じ: max(1, ...) で最低1を保証
                w = min(N_WORKERS, max(1, int(safe_rate / rate + 1e-9)))
                min_w = min(min_w, w)
                lines.append(f"・{label}: {pct:.0f}% 残{hours_left:.1f}h → {safe_rate:.2f}%/h → 最大{w}並列")

            optimal = max(1, min(min_w, N_WORKERS))
            lines.append(f"\n⚡ 実効並列数: {optimal}/{N_WORKERS}")
            send_telegram("\n".join(lines))
        except Exception as e:
            log(f"稼働状況通知エラー: {e}")


def main():
    import os, signal, threading

    global _cooldown_lock
    _cooldown_lock = threading.Lock()

    # 二重起動防止: PID存在確認付きロックファイルで排他制御
    if LOCK_FILE.exists():
        pid = LOCK_FILE.read_text().strip()
        try:
            os.kill(int(pid), 0)
            log(f"既に実行中 (PID={pid})。終了します。")
            return
        except (ProcessLookupError, ValueError):
            log(f"古いロックファイルを削除します (PID={pid} は終了済み)")
            LOCK_FILE.unlink(missing_ok=True)

    LOCK_FILE.write_text(str(os.getpid()))
    stop_event = threading.Event()

    def cleanup(sig, frame):
        log("シグナル受信: デーモン終了")
        stop_event.set()
        LOCK_FILE.unlink(missing_ok=True)
        sys.exit(0)

    signal.signal(signal.SIGTERM, cleanup)
    signal.signal(signal.SIGINT, cleanup)

    def sheets_factory():
        creds = get_creds()
        svc = build("sheets", "v4", credentials=creds)
        return svc.spreadsheets().values()

    log(f"=== KeepAliveデーモン起動 (N_WORKERS={N_WORKERS}) ===")
    try:
        # B) ヘッダー検証は起動時1回だけ（毎ループ呼ぶのは無駄なAPIコール）
        sheets_init = sheets_factory()
        if not validate_headers(sheets_init):
            log("ヘッダー検証失敗: 起動中止")
            LOCK_FILE.unlink(missing_ok=True)
            return

        # 15分報スレッド（15分ごとに稼働状況をTelegram通知）
        status_thread = threading.Thread(target=_send_hourly_status, args=(stop_event,), daemon=True)
        status_thread.start()

        threads = [
            threading.Thread(target=_worker, args=(i, stop_event, sheets_factory), daemon=True)
            for i in range(N_WORKERS)
        ]
        for t in threads:
            t.start()
        for t in threads:
            t.join()
    finally:
        LOCK_FILE.unlink(missing_ok=True)


if __name__ == "__main__":
    main()
