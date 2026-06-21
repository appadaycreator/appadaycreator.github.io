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
from datetime import datetime, timedelta
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
LOG_HEADERS = ["日時", "No", "サービス名", "リポジトリ", "サービスURL", "改善回数(通算)", "事前検出", "改善提案①", "実装内容②", "横展開先③", "横展開内容③", "所要時間(秒)"]
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
# CLAUDE_IMPROVE_MODEL が明示指定されているか（デフォルト "haiku" との区別）
_MODEL_EXPLICITLY_SET = os.environ.get("CLAUDE_IMPROVE_MODEL") is not None

# モデルルーティング: 施策の複雑度分類
# JS/ロジック実装が必要な施策 → Sonnet（品質重視）
_COMPLEX_M = frozenset({"M1", "M2", "M3", "M4", "M5", "M6", "M7", "M9", "M10", "M17"})
# HTML属性・メタデータ・コンテンツ追加のみの施策 → Haiku（速度・コスト重視）
_SIMPLE_M  = frozenset({"M8", "M11", "M12", "M13", "M14", "M15", "M16", "M18", "M19", "M20"})

LOG_FILE = Path("/tmp/hourly_claude_improve.log")
LOCK_FILE = Path("/tmp/hourly_claude_improve.lock")
BOT_TOKEN = "8851812089:AAHo7TYkOvmepfgwgN7hmE9t3nqBm3HoHqk"  # @tokunaga_dev_bot（使用量・improve通知専用）
CHAT_ID = "8512824182"
SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]
N_WORKERS = 30       # 並列ワーカー数の上限（動的調整の最大値）
TOP_N = 3
TIMEOUT_SEC = 900    # フォールバック上限（Sonnet/フェーズ1実施時）。実際は max-turns に連動して 300/600/900s に動的設定
COOLDOWN_SUCCESS_HOURS = 24  # 改善成功後のクールダウン（24h: 1サービス1日1回）
COOLDOWN_FAIL_HOURS   = 24  # 改善対象なし・エラー後のクールダウン
INDEXNOW_KEY  = "060b5be77e884ff19fd16c1dcd467960"
INDEXNOW_HOST = "appadaycreator.com"

# 動的並列数調整: Claude使用量ログを読んで自動スロットリング
USAGE_LOG_FILE = Path.home() / ".openclaw" / "data" / "claude_usage_log.json"
# ワーカー1台あたりの推定消費レート（%/h）- 3並列で実測した値から算出
# モデル別レート（Sonnet使用時はSonnet向け値を採用）
if _model_env == "sonnet":
    _SESSION_RATE_PER_W    = 25.0  # Sonnetセッション(5h枠)
    _WEEKLY_ALL_RATE_PER_W =  3.0  # Sonnet全モデル週次
    _WEEKLY_SNT_RATE_PER_W =  3.0  # Sonnet週次
else:
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
    17: ["CD", "クロード", "デザイン"],  # R列: CD（Claude Design フラグ・書き込まない）
    18: ["改善", "回数", "count"],
    19: ["最終", "更新", "日時"],
}


def log(msg: str):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line, flush=True)
    # stdout が TTY のときだけファイルにも書く（LaunchAgent/nohup では stdout がファイルに
    # リダイレクト済みのため二重書き込みを避ける）
    if sys.stdout.isatty():
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
_git_lock     = None  # ㉘ git commit+push の直列化ロック（並列ワーカー競合防止）
_visual_lock  = None  # Playwright並列実行防止（1並列のみ許可）
_in_progress: set = set()  # 実行中リポジトリ（並列重複防止用）
_fail_counts: dict = {}    # ㉚ repo → 連続失敗回数（指数バックオフ用）
_m_fail_counts: dict = {}  # ㊺ "{repo}:{M}" → 連続失敗回数（施策単位）
_m_skip_until: dict = {}   # ㊺ "{repo}:{M}" → スキップ期限 datetime（2回連続失敗→72h除外）

# ⑮ get_top_services TTLキャッシュ（5分・ワーカー間共有でSheets API呼び出しを削減）
_TOP_SVC_CACHE: dict = {"ts": 0.0, "data": None}
_TOP_SVC_TTL = 300  # 5分

CD_FMT = "%Y/%m/%d %H:%M"


def claim_service(candidates: list) -> dict | None:
    """スレッド安全にサービスを1件クレームして返す。
    cd_expiry（R列から読んだクールダウン期限）で判定し、_in_progress で重複防止。
    IGNORE_COOLDOWN=1 環境変数でクールダウンを無視（最大ワーカー稼働用）。"""
    _ignore_cd = os.environ.get("IGNORE_COOLDOWN") == "1"
    with _cooldown_lock:
        now = datetime.now()
        available = [
            s for s in candidates
            if (_ignore_cd or s.get("cd_expiry") is None or now >= s["cd_expiry"])
            and s["repo"] not in _in_progress
        ]
        if not available:
            return None
        svc = available[0]
        _in_progress.add(svc["repo"])
        return svc


def quick_scan(repo: str) -> list[str]:
    """収益化→SEO→機能→コード品質→見た目の優先度順に問題を検出する。
    返却リストは優先度タグ付き文字列 "[P0-収益] ..." 形式。"""
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
        # ===== Vue/Vite サービス =====
        if idx.exists():
            html = idx.read_text(errors="ignore")
            # M4: ビジュアライゼーション
            has_chart = "chart.js" in html.lower() or "<canvas" in html.lower()
            if not has_chart:
                issues.append("[M4] グラフ/ビジュアライゼーションなし（Chart.jsで結果を可視化推奨）")
            # M14: SEOスキーマ
            schema_missing = []
            if "FAQPage" not in html:
                schema_missing.append("FAQPage")
            if "HowTo" not in html:
                schema_missing.append("HowTo")
            if schema_missing:
                issues.append(f"[M14] SEOスキーマ未実装: {'/'.join(schema_missing)}")
            # M15: meta/OGタグ
            meta_missing = []
            if 'name="description"' not in html and "og:description" not in html:
                meta_missing.append("meta description")
            if "og:title" not in html and "og:image" not in html:
                meta_missing.append("OGタグ")
            if meta_missing:
                issues.append(f"[M15] SEOメタ未設定: {'/'.join(meta_missing)}")
        # M3: データ保存・履歴
        if not grep("localStorage", str(src), ["--include=*.js", "--include=*.vue"]):
            issues.append("[M3] localStorage未使用（データ保存・履歴機能なし）")
        # M9: 結果シェア機能
        has_share = any(
            grep(pat, str(src), ["--include=*.js", "--include=*.vue"])
            for pat in ["navigator.share", "twitter.com/intent", "line.me/R", "clipboard"]
        )
        if not has_share:
            issues.append("[M9] 結果シェア機能なし（Twitter/LINE/クリップボードコピー）")
        # M19: コード品質
        if grep("font-awesome", str(service_dir), ["--include=*.html", "--include=*.vue"]):
            issues.append("[M19] FontAwesome残存（軽量アイコンへ置換推奨）")
        if grep("console\\.log", str(src), ["--include=*.js", "--include=*.vue"]):
            issues.append("[M19] console.log残存")
        no_alt = [l for l in grep_n("<img", str(src), ["--include=*.vue"]) if "alt=" not in l]
        if no_alt:
            issues.append(f"[M20] img alt属性なし({len(no_alt)}件)")

    elif idx.exists():
        # ===== 静的HTML サービス =====
        html = idx.read_text(errors="ignore")
        import re as _re
        # ⑫ HTMLコメントを除去（false positive防止: <!--...-->内パターンを「実装済み」と誤認しない）
        html = _re.sub(r'<!--.*?-->', '', html, flags=_re.DOTALL)
        # M1: 文脈CTAの有無
        # ㊽ <a href>または<button>内のCTAキーワード限定（meta/本文テキストでの誤検知防止）
        _cta_kws = "申し込む|無料登録|詳しく見る|今すぐ|無料で始める|資料請求|会員登録|申込"
        has_cta = bool(
            _re.search(r'<a\b[^>]*\bhref\b[^>]*>(?:(?!<).){0,200}(?:' + _cta_kws + r')', html, _re.IGNORECASE | _re.DOTALL) or
            _re.search(r'<button\b[^>]*>(?:(?!<).){0,200}(?:' + _cta_kws + r')', html, _re.IGNORECASE | _re.DOTALL) or
            "px.a8.net" in html or "affiliate" in html.lower()
        )
        if not has_cta:
            issues.append("[M1] 申込/CTA導線なし（アフィリエイト・登録ボタン未設置）")
        # M2: コア機能UX - inputにplaceholderなし
        inputs = _re.findall(r'<input[^>]*>', html, _re.IGNORECASE)
        user_inputs = [i for i in inputs if not any(
            t in i.lower() for t in ['type="hidden"', "type='hidden'", 'type="submit"', "type='submit'"]
        )]
        no_placeholder = [i for i in user_inputs if "placeholder" not in i.lower()]
        if len(no_placeholder) >= 2:
            issues.append(f"[M2] inputにplaceholder未設定({len(no_placeholder)}件) - UX改善余地あり")
        # M3: データ保存・履歴
        if "localStorage" not in html:
            issues.append("[M3] localStorage未使用（データ保存・履歴機能なし）")
        # M4: ビジュアライゼーション（計算/診断系のみ）
        is_data_service = any(kw in html for kw in ["計算", "診断", "分析", "スコア", "結果", "calculator", "result"])
        has_chart = "chart.js" in html.lower() or "<canvas" in html.lower()
        if is_data_service and not has_chart:
            issues.append("[M4] グラフ/ビジュアライゼーションなし（Chart.jsで結果を可視化推奨）")
        # M5: 結果連動アフィリエイト推薦
        # ㊹ "amazon"単体はテキスト中に頻出→"amazon.co.jp"/"amazon.com"に限定して誤検知削減
        if "px.a8.net" in html or "amazon.co.jp" in html.lower() or "amazon.com" in html.lower():
            has_dynamic_rec = any(kw in html for kw in ["おすすめ", "あなたに", "診断結果", "結果に応じ", "recommend"])
            if not has_dynamic_rec:
                issues.append("[M5] 結果連動アフィリエイト推薦なし（診断/計算結果に合わせた動的CTA未実装）")
        # M6: 目標設定・トラッキング（家計/健康/学習系のみ）
        is_tracking = any(kw in html for kw in ["家計", "節約", "体重", "運動", "学習", "貯金", "ダイエット", "フィットネス", "おこづかい"])
        has_goal = any(kw in html for kw in ["目標", "goal", "ゴール", "達成"])
        if is_tracking and not has_goal:
            issues.append("[M6] 目標設定・達成度トラッキング機能なし")
        # M7: 比較・シミュレーション（計算/比較系のみ）
        # ㊹ "比較"は文中に頻出→UI要素（select/radio/tab）と共存する場合のみ「実装済み」と判定
        is_calc = any(kw in html for kw in ["計算", "比較", "シミュレーション", "プラン", "コース"])
        has_compare_kw = any(kw in html for kw in ["compare", "シミュレーション", "simulation", "パターンA", "パターンB", "プランA"])
        has_compare_ui = bool(_re.search(r'<(?:select|input[^>]*type=["\']radio["\'])[^>]*>', html, _re.IGNORECASE))
        has_compare = has_compare_kw or has_compare_ui
        if is_calc and not has_compare:
            issues.append("[M7] 比較・シミュレーション機能なし（複数パターン計算推奨）")
        # M8: ツールチップ・入力ガイダンス
        has_text_inputs = bool(_re.search(r'<input[^>]*type=["\']?(text|number|email|tel)["\']?', html, _re.IGNORECASE)) or "<textarea" in html.lower()
        has_tooltip = any(kw in html for kw in ["tooltip", "data-tip", "aria-describedby", "help-text", "hint"])
        if has_text_inputs and not has_tooltip:
            issues.append("[M8] 入力フォームへのツールチップ/ガイダンステキスト未設定")
        # M9: 結果シェア
        has_share = any(kw in html for kw in ["twitter.com/intent", "line.me/R", "facebook.com/share", "navigator.share", "clipboard"])
        if not has_share:
            issues.append("[M9] 結果シェア機能なし（Twitter/LINE/クリップボードコピー）")
        # M10: 印刷・エクスポート（計算/診断系のみ）
        if is_data_service:
            has_export = any(kw in html for kw in ["window.print", ".print()", "download", "CSV", "エクスポート", "ダウンロード"])
            if not has_export:
                issues.append("[M10] 印刷/エクスポート機能なし")
        # M11: 使い方・活用例・FAQ
        has_howto = any(kw in html for kw in ["使い方", "ご利用方法", "使用例", "活用例", "step", "Step", "STEP", "FAQ", "よくある"])
        if not has_howto:
            issues.append("[M11] 使い方/活用例/FAQセクションなし")
        # M12: 関連コンテンツ・解説記事
        # ㊹ nav/header/footer内の単語でのfalse positive防止（セクション文脈のみチェック）
        _html_no_nav = _re.sub(r'<(?:nav|header|footer)[^>]*>.*?</(?:nav|header|footer)>',
                               '', html, flags=_re.IGNORECASE | _re.DOTALL)
        has_related = any(kw in _html_no_nav for kw in
                          ["関連コンテンツ", "関連記事", "コラム", "豆知識", "アドバイス", "解説", "ヒント"])
        if not has_related:
            issues.append("[M12] 関連コンテンツ/解説記事セクションなし")
        # M13: 内部リンク
        if "appadaycreator.com" not in html:
            issues.append("[M13] 内部リンク（他サービス誘導）なし")
        # M14: SEO構造化データ
        schema_missing = []
        if "FAQPage" not in html:
            schema_missing.append("FAQPage")
        if "HowTo" not in html:
            schema_missing.append("HowTo")
        if schema_missing:
            issues.append(f"[M14] SEOスキーマ未実装: {'/'.join(schema_missing)}")
        # M15: meta description・OGタグ
        meta_missing = []
        if 'name="description"' not in html:
            meta_missing.append("meta description")
        if "og:title" not in html and "og:image" not in html:
            meta_missing.append("OGタグ")
        if meta_missing:
            issues.append(f"[M15] SEOメタ未設定: {'/'.join(meta_missing)}")
        # M16: PWA化
        if 'rel="manifest"' not in html and "manifest.json" not in html:
            issues.append("[M16] PWA化未実施（manifest.json未設定）")
        # M17: 収益導線最適化
        if "px.a8.net" in html:
            has_cta_btn = any(kw in html for kw in ['class="btn', "class='btn", "btn-primary", "cta-btn", "cta-button", "btn-cta"])
            if not has_cta_btn:
                issues.append("[M17] アフィリエイトCTAボタン化未実施（収益導線最適化余地あり）")
        # M18: モバイル最適化
        if 'name="viewport"' not in html:
            issues.append("[M18] viewportメタタグ未設定（モバイル未対応）")
        # M19: パフォーマンス・コード品質
        if "font-awesome" in html.lower() or ' class="fa-' in html:
            issues.append("[M19] FontAwesome残存（軽量アイコンへ置換推奨）")
        if "console.log" in html:
            issues.append("[M19] console.log残存")
        # M20: アクセシビリティ
        imgs = _re.findall(r"<img[^>]*>", html, _re.IGNORECASE)
        no_alt = [img for img in imgs if "alt=" not in img.lower()]
        if no_alt:
            issues.append(f"[M20] img alt属性なし({len(no_alt)}件)")

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
        actual = header_row[col_idx].strip() if col_idx < len(header_row) else ""
        if not actual:
            continue  # ヘッダーが空の場合はスキップ（データ列として使用中でも問題なし）
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
      Q(16)=SEO完成度(品質スコア), R(17)=CD(Claude Designフラグ), S(18)=改善回数
    """
    # ⑮ TTLキャッシュ: 5分以内の結果を再利用（並列ワーカーのSheets API重複呼び出しを削減）
    if _TOP_SVC_CACHE["data"] is not None and time.time() - _TOP_SVC_CACHE["ts"] < _TOP_SVC_TTL:
        return _TOP_SVC_CACHE["data"]

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
        rank7d   = float(str(row[11]).replace(",", ".")) if len(row) > 11 and row[11] else 0.0  # L列: 掲載順位7d
        s_val    = safe_int(row[18]) if len(row) > 18 and row[18] else 0  # S列
        affil    = row[37].strip() if len(row) > 37 else ""  # AL列: アフィリエイト状況
        cd_str   = row[17].strip() if len(row) > 17 else ""  # R列: CD期限
        cd_expiry = None
        if cd_str:
            try:
                cd_expiry = datetime.strptime(cd_str, CD_FMT)
            except ValueError:
                pass

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
            "rank7d": rank7d,
            "combined": combined,
            "s_val": s_val,
            "affil": affil,
            "cd_expiry": cd_expiry,
        })

    # PSIスコアをキャッシュから読み込み、優先度ブーストを付加（APIは呼ばない）
    try:
        import importlib.util as _ilu
        _psi_spec = _ilu.spec_from_file_location("psi_checker", Path(__file__).parent / "psi_checker.py")
        _psi_mod  = _ilu.module_from_spec(_psi_spec)
        _psi_spec.loader.exec_module(_psi_mod)
        for _svc in services:
            _psi = _psi_mod.get_score_cached(_svc["repo"])
            _svc["psi_score"] = _psi
            _svc["psi_boost"] = _psi_mod.get_psi_boost(_psi)
    except Exception as _psi_err:
        log(f"[PSI] キャッシュ読み込みスキップ: {_psi_err}")
        for _svc in services:
            _svc.setdefault("psi_score", None)
            _svc.setdefault("psi_boost", 0)

    _sorted = sorted(services, key=lambda x: -(x["combined"] + x.get("psi_boost", 0)))
    _TOP_SVC_CACHE.update({"ts": time.time(), "data": _sorted})
    return _sorted


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


def write_update_log(sheets, svc: dict, pre_issues: list, stdout: str, elapsed_sec: int,
                     s_delta: int = 1):
    """サービス更新ログシートに改善記録を1行追加する。
    s_delta: ⑳と揃える。実測改善数（+1固定廃止）。"""
    try:
        proposal, impl, cross_targets, cross_content, _ = _extract_log_parts(stdout)
        service_url = f"https://appadaycreator.com/{svc['repo']}/"
        row = [
            datetime.now().strftime("%Y/%m/%d %H:%M"),
            svc["no"],
            svc["name"],
            svc["repo"],
            service_url,
            svc["s_val"] + s_delta,  # ㉕ +1固定→実測s_delta（⑳と整合）
            ", ".join(pre_issues) if pre_issues else "なし",
            proposal,
            impl,
            cross_targets,
            cross_content,
            elapsed_sec,
        ]
        sheets.append(
            spreadsheetId=SPREADSHEET_ID,
            range=f"{LOG_SHEET}!A:L",
            valueInputOption="USER_ENTERED",
            insertDataOption="INSERT_ROWS",
            body={"values": [row]}
        ).execute()
        log(f"  ログ記録: {svc['name']} 横展開={cross_targets or 'なし'}")
    except Exception as e:
        log(f"  ログ記録失敗: {e}")


def update_spreadsheet(sheets, row: int, s_val: int, asset_value: int,
                       cooldown_expiry: datetime, update_progress: bool = True,
                       s_delta: int = 1):
    """R列(CD期限)・S列(改善回数)・T列(最終更新日時)・AM列(資産価値)をbatchUpdateで更新。
    update_progress=False の場合はR列のみ（失敗時のクールダウン記録）。
    s_delta: ⑳ S列の増分（デフォルト1・実測値を渡すと正確になる）。
    R列はRAWで書き込み（USER_ENTEREDだとSheetsが日付シリアルに変換して読み返しに失敗する）。"""
    cd_str = cooldown_expiry.strftime(CD_FMT)
    # R列: RAW（テキストとして格納。日付フォーマット列でも文字列のまま保持させる）
    sheets.batchUpdate(
        spreadsheetId=SPREADSHEET_ID,
        body={
            "valueInputOption": "RAW",
            "data": [{"range": f"{SHEET}!R{row}", "values": [[cd_str]]}],
        }
    ).execute()
    if update_progress:
        now_str = datetime.now().strftime(CD_FMT)
        sheets.batchUpdate(
            spreadsheetId=SPREADSHEET_ID,
            body={
                "valueInputOption": "USER_ENTERED",
                "data": [
                    {"range": f"{SHEET}!S{row}:T{row}", "values": [[s_val + s_delta, now_str]]},
                    {"range": f"{SHEET}!AM{row}", "values": [[asset_value]]},
                ],
            }
        ).execute()


def _get_diff_summary(repo: str) -> dict:
    """直前のgit commit差分から変更内容を構造的に把握する。
    並列コミット競合に強い: HEAD~1ではなく対象ファイルの最新コミットSHAを使う。
    Returns: {has_changes, stats, added, removed, descriptions}
      descriptions: 自然言語の変更概要リスト（最大4件）
    """
    import re as _re_d
    result = {"has_changes": False, "stats": "", "added": 0, "removed": 0, "descriptions": []}
    try:
        # 対象ファイルに触れた最新コミットSHAを取得（並列コミット競合を回避）
        # フォーマット: "<SHA> <unix_timestamp>"
        log_r = subprocess.run(
            ["git", "log", "-1", "--pretty=format:%H %ct", "--", f"{repo}/index.html"],
            cwd=str(WORKSPACE), capture_output=True, text=True, timeout=10
        )
        if log_r.returncode != 0 or not log_r.stdout.strip():
            return result
        _parts = log_r.stdout.strip().split()
        last_sha = _parts[0]
        # 10分以上前のコミットは「今回の改善」ではないのでスキップ
        import time as _time
        _commit_age = _time.time() - int(_parts[1]) if len(_parts) > 1 else 9999
        if _commit_age > 600:
            return result

        stat_r = subprocess.run(
            ["git", "diff", f"{last_sha}^", last_sha, "--numstat", "--", f"{repo}/index.html"],
            cwd=str(WORKSPACE), capture_output=True, text=True, timeout=10
        )
        if stat_r.returncode == 0 and stat_r.stdout.strip():
            parts = stat_r.stdout.strip().split()
            result["added"] = int(parts[0]) if len(parts) > 0 and parts[0].isdigit() else 0
            result["removed"] = int(parts[1]) if len(parts) > 1 and parts[1].isdigit() else 0
            result["has_changes"] = result["added"] > 0 or result["removed"] > 0
            result["stats"] = f"+{result['added']}行/-{result['removed']}行"

        if not result["has_changes"]:
            return result

        # 旧版・新版を取得して構造比較
        old_r = subprocess.run(
            ["git", "show", f"{last_sha}^:{repo}/index.html"],
            cwd=str(WORKSPACE), capture_output=True, text=True, timeout=15
        )
        new_r = subprocess.run(
            ["git", "show", f"{last_sha}:{repo}/index.html"],
            cwd=str(WORKSPACE), capture_output=True, text=True, timeout=15
        )
        if old_r.returncode != 0 or new_r.returncode != 0:
            return result

        old, new = old_r.stdout, new_r.stdout
        # desc: list of (change_text, effect_text) tuples
        desc = []

        # h1 変更
        _old_h1 = _re_d.search(r'<h1[^>]*>\s*([^<]{4,}?)\s*</h1>', old)
        _new_h1 = _re_d.search(r'<h1[^>]*>\s*([^<]{4,}?)\s*</h1>', new)
        if _old_h1 and _new_h1 and _old_h1.group(1).strip() != _new_h1.group(1).strip():
            desc.append((
                f"h1改善: 「{_new_h1.group(1).strip()[:35]}」",
                "検索キーワード一致度・クリック率改善"
            ))

        # meta description 変更
        _old_md = _re_d.search(r'<meta\s+name="description"\s+content="([^"]{15,})"', old)
        _new_md = _re_d.search(r'<meta\s+name="description"\s+content="([^"]{15,})"', new)
        if _old_md and _new_md and _old_md.group(1) != _new_md.group(1):
            desc.append((
                f"meta説明文更新: 「{_new_md.group(1)[:35]}…」",
                "検索スニペット改善・流入率向上"
            ))

        # FAQアイテム数
        _old_faq = len(_re_d.findall(r'<dt[\s>]|class=["\']faq-(?:q|question)|itemtype="[^"]*FAQPage', old, _re_d.I))
        _new_faq = len(_re_d.findall(r'<dt[\s>]|class=["\']faq-(?:q|question)|itemtype="[^"]*FAQPage', new, _re_d.I))
        if _new_faq > _old_faq and _new_faq > 0:
            desc.append((
                f"FAQ拡充: {_old_faq}問→{_new_faq}問",
                "ユーザーの疑問解消・滞在時間・回遊改善"
            ))

        # CTA/ボタン追加（日本語テキストのみ）
        _old_btns = set(_re_d.findall(
            r'(?:class="[^"]*(?:cta|btn)[^"]*"[^>]*>|<button[^>]*>)\s*([ぁ-んァ-ン一-龯a-zA-Z0-9・\-「」（）]{4,30})',
            old, _re_d.I))
        _new_btns = set(_re_d.findall(
            r'(?:class="[^"]*(?:cta|btn)[^"]*"[^>]*>|<button[^>]*>)\s*([ぁ-んァ-ン一-龯a-zA-Z0-9・\-「」（）]{4,30})',
            new, _re_d.I))
        _added_btns = [b.strip() for b in (_new_btns - _old_btns) if _re_d.search(r'[ぁ-んァ-ン一-龯]', b)]
        if _added_btns:
            desc.append((
                f"CTAボタン追加: 「{'」「'.join(_added_btns[:3])}」",
                "収益化クリック機会を増やしCVR改善"
            ))

        # Consent Mode v2
        if 'Consent Mode v2' not in old and 'Consent Mode v2' in new:
            desc.append((
                "Consent Mode v2実装",
                "Google広告・Analytics同意管理対応→AdSense安定化"
            ))
        elif 'cookie-consent' not in old and 'cookie-consent' in new:
            desc.append((
                "クッキー同意バナー追加",
                "GDPR/個人情報保護法対応・広告表示安定化"
            ))

        # HowToスキーマ
        if '"HowTo"' not in old and '"HowTo"' in new:
            desc.append((
                "HowToスキーマ追加",
                "Googleリッチリザルト表示機会増加→CTR向上"
            ))

        # アフィリエイトリンク追加
        _old_af = len(_re_d.findall(r'px\.a8\.net', old))
        _new_af = len(_re_d.findall(r'px\.a8\.net', new))
        if _new_af > _old_af:
            desc.append((
                f"A8アフィリエイトリンク+{_new_af - _old_af}件",
                f"収益導線を{_new_af - _old_af}箇所追加・収益化機会拡大"
            ))

        # 構造的変更が検出できなかった場合: 差分から日本語行を抽出（フォールバック）
        if not desc:
            diff_r = subprocess.run(
                ["git", "diff", f"{last_sha}^", last_sha, "--", f"{repo}/index.html"],
                cwd=str(WORKSPACE), capture_output=True, text=True, timeout=10
            )
            _skip_kw = {"appadaycreator.com", "px.a8.net", "schema.org", "google", "gtm",
                        "analytics", "@context", "@type", "acceptedAnswer", "HowToStep"}
            for line in diff_r.stdout.splitlines():
                if not line.startswith("+") or line.startswith("+++"):
                    continue
                text = _re_d.sub(r'<[^>]+>', '', line[1:]).strip()
                text = _re_d.sub(r'\s+', ' ', text).strip()
                if (5 <= len(text) <= 80 and _re_d.search(r'[ぁ-んァ-ン一-龯]', text)
                        and not any(kw in line for kw in _skip_kw)):
                    desc.append((text, "コンテンツ品質・ユーザー体験改善"))
                    if len(desc) >= 3:
                        break

        result["descriptions"] = desc[:4]
    except Exception as e:
        log(f"  diff取得エラー: {e}")
    return result


def _take_screenshot_sync(repo: str) -> str | None:
    """index.htmlのローカルスクショをPlaywrightで撮る（Telegramファイル添付用・デスクトップ上部）。"""
    idx = WORKSPACE / repo / "index.html"
    if not idx.exists():
        return None
    shot_path = f"/tmp/improve_shot_{repo}.png"
    try:
        from playwright.sync_api import sync_playwright
        with sync_playwright() as p:
            browser = p.chromium.launch(args=["--no-sandbox", "--disable-dev-shm-usage"])
            page = browser.new_page(viewport={"width": 1280, "height": 800})
            page.goto(f"file://{idx}", wait_until="domcontentloaded", timeout=15000)
            page.wait_for_timeout(2000)
            page.screenshot(path=shot_path, full_page=False)
            browser.close()
        return shot_path
    except Exception as e:
        log(f"  スクショ失敗: {e}")
        return None


def _take_multi_screenshots(repo: str) -> list[str]:
    """3視点スクショを撮る: ①デスクトップ上部 ②デスクトップ中段スクロール ③モバイル幅。
    撮れたもののみ返す（最低0〜3枚）。
    """
    idx = WORKSPACE / repo / "index.html"
    if not idx.exists():
        return []
    paths = []
    try:
        from playwright.sync_api import sync_playwright
        with sync_playwright() as p:
            browser = p.chromium.launch(args=["--no-sandbox", "--disable-dev-shm-usage"])

            # ① デスクトップ上部（ファーストビュー）
            page = browser.new_page(viewport={"width": 1280, "height": 900})
            page.goto(f"file://{idx}", wait_until="domcontentloaded", timeout=15000)
            page.wait_for_timeout(1500)
            p1 = f"/tmp/vshot_{repo}_1_top.png"
            page.screenshot(path=p1, full_page=False)
            paths.append(p1)

            # ② デスクトップ中段（ツール/コンテンツエリア）
            total_h = page.evaluate("document.body.scrollHeight")
            scroll_to = min(int(total_h * 0.4), 1200)
            page.evaluate(f"window.scrollTo(0, {scroll_to})")
            page.wait_for_timeout(800)
            p2 = f"/tmp/vshot_{repo}_2_mid.png"
            page.screenshot(path=p2, full_page=False)
            paths.append(p2)

            page.close()

            # ③ モバイル幅（375px）
            page_m = browser.new_page(viewport={"width": 375, "height": 812})
            page_m.goto(f"file://{idx}", wait_until="domcontentloaded", timeout=15000)
            page_m.wait_for_timeout(1500)
            p3 = f"/tmp/vshot_{repo}_3_mobile.png"
            page_m.screenshot(path=p3, full_page=False)
            paths.append(p3)
            page_m.close()

            browser.close()
    except Exception as e:
        log(f"  [multi_shot] 撮影エラー: {e}")
    return paths


def _visual_scan(repo: str) -> tuple[list[str], list[str]]:
    """3視点スクショをClaude Haikuで厳格分析し必須改善項目を[V1]〜[V5]形式で返す。
    「改善なし」を許容しない: 常に具体的な改善点を5件抽出させる。
    Returns: (issues, shot_paths)
    """
    import time as _vt
    import re as _re_v
    _t0 = _vt.time()

    shots = _take_multi_screenshots(repo)
    if not shots:
        # フォールバック: 従来の1枚スクショ
        single = _take_screenshot_sync(repo)
        shots = [single] if single else []
    if not shots:
        log(f"  [visual_scan] スクショ取得失敗 → スキップ")
        return [], []

    log(f"  [visual_scan] スクショ {len(shots)}枚取得: {shots}")

    shot_list = "\n".join(f"- {p}" for p in shots)
    labels = ["①デスクトップ上部", "②デスクトップ中段", "③モバイル"]
    shot_desc = " / ".join(labels[:len(shots)])

    prompt = (
        f"以下の{len(shots)}枚の画像ファイルを読んでください（{shot_desc}）:\n"
        f"{shot_list}\n\n"
        "このWebサービスのUI・UX・コンバージョンの問題点を【必ず5件以上】指摘してください。\n"
        "「問題なし」「良好」などの評価は禁止。必ず改善できる点を探してください。\n\n"
        "出力形式（厳守）:\n"
        "[V1] 問題の具体的な説明（何がどう悪いか）\n"
        "[V2] 問題の具体的な説明\n"
        "[V3] 問題の具体的な説明\n"
        "[V4] 問題の具体的な説明\n"
        "[V5] 問題の具体的な説明\n\n"
        "チェック観点（モバイル・デスクトップ両方で確認）:\n"
        "・CTAボタンの視認性・サイズ・配色・位置（ファーストビューに存在するか）\n"
        "・アフィリエイトリンクの目立ち方・クリックしたくなる文言か\n"
        "・フォント・行間・余白・コントラスト比（読みやすさ）\n"
        "・モバイルでのレイアウト崩れ・タップしにくい要素\n"
        "・信頼性要素（実績数値・レビュー・バッジ）の有無・目立ち方\n"
        "・ページ離脱を防ぐ要素（FAQ・関連ツール・次のアクション）の配置\n"
        "・ページ全体の密度（スカスカ or ごちゃごちゃ）\n"
        "解決策は不要。問題の説明のみ1行で。"
    )

    log(f"  [visual_scan] Claude Haiku 分析開始（{len(shots)}枚）...")
    try:
        r = subprocess.run(
            [str(CLAUDE_BIN), "-p", "--model", "haiku", "--allowedTools", "Read"],
            input=prompt,
            capture_output=True,
            text=True,
            timeout=120,
        )
        elapsed_v = _vt.time() - _t0
        raw_out = r.stdout.strip()
        log(f"  [visual_scan] Haiku応答 ({elapsed_v:.1f}s): {raw_out[:400]}")
        if r.returncode != 0:
            log(f"  [visual_scan] Haiku終了コード={r.returncode}, stderr={r.stderr[:200]}")
        issues = []
        for line in raw_out.splitlines():
            m = _re_v.search(r'\[(V\d+)\]\s*(.+)', line.strip())
            if m:
                issues.append(f"[{m.group(1)}] {m.group(2).strip()}")
        issues = issues[:5]
        log(f"  [visual_scan] 抽出結果 {len(issues)}件: {issues}")
        return issues, shots
    except Exception as e:
        log(f"  [visual_scan] 失敗: {e}")
        return [], shots


def _send_telegram_photo(caption: str, photo_path: str) -> None:
    """写真+キャプションをTelegramに送信する。"""
    try:
        import requests as _req
        with open(photo_path, "rb") as f:
            _req.post(
                f"https://api.telegram.org/bot{BOT_TOKEN}/sendPhoto",
                data={"chat_id": CHAT_ID, "caption": caption[:1024]},
                files={"photo": f},
                timeout=30,
            )
    except Exception as e:
        log(f"  Telegram写真送信失敗: {e}")
        send_telegram(caption)


def _send_improve_notify(svc: dict, stdout: str, worker_id: int,
                         verify_detail: str = "", marker_results: str = "",
                         pre_issues: list | None = None, elapsed: int = 0,
                         s_delta: int = 1, asset_value: int = 0,
                         v_issues: list | None = None):
    """改善完了通知 - git diff で実変更を確認し、変更あり時はスクショ付きで送信する。

    テンプレート（変更あり）:
        ✅ No.155 国内旅行費用シミュレーター
        ━━━━━━━━━━━━━━━━━━━━━━
        🔍 深層レビュー｜⏱8分12秒｜S=36｜¥12,000
        📊 +115行/-5行
          • じゃらん・一休.com・Yahoo!トラベル CTAボタン追加
          • HowToスキーマ（5ステップ）追加
          • h1テキスト「計算シミュレーター」に改善
        ✔️ マーカーOK
        🔗 appadaycreator.com/domestic-travel-planner/

    テンプレート（変更なし）:
        ℹ️ No.155 国内旅行費用シミュレーター
        🔍 深層レビュー｜⏱1分37秒 - 改善点なし
    """
    import re as _re_n
    pre_issues = pre_issues or []
    v_issues = v_issues or []
    deep_review = not pre_issues

    # ── モード行 ──
    if deep_review:
        mode = "🔍 深層レビュー"
    else:
        m_ids = sorted({_re_n.search(r'M\d+', i).group()
                        for i in pre_issues if _re_n.search(r'M\d+', i)})
        mode = f"🔧 {'/'.join(m_ids[:4])} 修正"
    if v_issues:
        mode += f" + 👁V{len(v_issues)}"

    # ── メトリクス ──
    elapsed_str = f"{elapsed // 60}分{elapsed % 60:02d}秒" if elapsed >= 60 else f"{elapsed}秒"
    new_s = svc.get("s_val", 0) + s_delta
    am_str = f"¥{asset_value:,}" if asset_value else "¥-"

    # ── git diff で実変更確認 ──
    diff = _get_diff_summary(svc["repo"])

    if not diff["has_changes"]:
        # 変更なし: 簡素な通知のみ（スクショ・S値更新なし）
        msg = (
            f"ℹ️ No.{svc['no']} {svc['name']}\n"
            f"{mode}｜⏱{elapsed_str} — 改善点なし\n"
            f"🔗 appadaycreator.com/{svc['repo']}/"
        )
        send_telegram(msg)
        log(f"[W{worker_id}]   通知送信完了（変更なし）")
        return

    # ── 変更あり: 詳細通知 ──
    # マーカー確認
    if marker_results and any(c in marker_results for c in ("✅", "✓", "OK", "通過")):
        marker_line = f"✔️ {marker_results[:60]}"
    elif marker_results:
        marker_line = f"⚠️ {marker_results[:60]}"
    else:
        marker_line = "✔️ 確認済み"

    # 変更内容＋効果のブロック（change/effect タプルリスト対応）
    change_block = ""
    if diff["descriptions"]:
        lines = []
        for item in diff["descriptions"][:3]:
            if isinstance(item, tuple):
                chg, eff = item
                lines.append(f"▶ {chg}\n   → {eff}")
            else:
                lines.append(f"▶ {item}")
        change_block = "\n".join(lines)

    n_changes = len(diff["descriptions"])
    stats_line = f"📊 {diff['stats']}  {n_changes}件の改善" if n_changes else f"📊 {diff['stats']}"

    msg = (
        f"✅ No.{svc['no']} {svc['name']}\n"
        f"{'━' * 22}\n"
        f"{mode}｜⏱{elapsed_str}｜S={new_s}｜{am_str}\n"
        f"{stats_line}\n"
    )
    if change_block:
        msg += "\n" + change_block + "\n"

    # ── ビジュアルスキャン結果 ──
    if v_issues:
        msg += "\n👁 スクショ解析:\n"
        for vi in v_issues:
            msg += f"  {vi}\n"

    # ── コードスキャン結果 ──
    if pre_issues:
        m_issues = [i for i in pre_issues if _re_n.search(r'M\d+', i)]
        if m_issues:
            msg += "\n🔎 コードスキャン:\n"
            for mi in m_issues[:3]:
                msg += f"  {mi}\n"

    # ── PSIスコア ──
    _psi = svc.get("psi_score")
    if _psi is not None:
        if _psi < 50:
            _psi_str = f"🔴 PSI {_psi}"
        elif _psi < 90:
            _psi_str = f"🟡 PSI {_psi}"
        else:
            _psi_str = f"🟢 PSI {_psi}"
        msg += f"\n{_psi_str}\n"

    msg += f"\n{marker_line}\n"
    msg += f"🔗 appadaycreator.com/{svc['repo']}/"

    # スクショ撮影・送信（改善後の最新スクショを添付）
    shot = _take_screenshot_sync(svc["repo"])
    if shot:
        _send_telegram_photo(msg, shot)
        log(f"[W{worker_id}]   通知送信完了（{diff['stats']}・スクショ付き・V{len(v_issues)}件）")
    else:
        send_telegram(msg)
        log(f"[W{worker_id}]   通知送信完了（{diff['stats']}・V{len(v_issues)}件）")


_PRIORITY_GUIDE = """\

【20施策チェックリスト（ユーザー価値×収益 優先度順）- 必ずM1から順に検討・実施すること】

M1【収益×満足】診断/計算後の文脈CTAボタン設置
  → ユーザーが価値を感じた瞬間（計算結果・診断完了直後）に、その結果に関連するアフィリエイトCTAを自然な流れで配置

M2【満足】コア機能のUX改善（入力UI・バリデーション）
  → 入力フォームへのplaceholder/ラベル追加・入力バリデーション・エラーメッセージ・数値スライダー等の入力補助

M3【満足×再訪】データ保存・履歴機能（localStorage）
  → 入力値・計算結果の自動保存・履歴一覧表示・前回データ復元でリピート利用を促進

M4【満足】グラフ・スコア・ゲージで結果を可視化（Chart.js）
  → 数値結果をChart.jsでグラフ化・スコア表示・プログレスバー・比較チャートで直感的に可視化（外部APIは使わない）

M5【収益×満足】結果に連動したアフィリエイト商品推薦
  → 計算/診断結果に基づいて「あなたにおすすめ」の関連アフィリエイト商品をJSで動的に表示

M6【再訪×満足】目標設定・達成度トラッキング
  → 目標値のlocalStorage保存・達成率計算・前回との比較表示で継続利用を促進

M7【満足】比較・シミュレーション機能
  → 複数パターンの入力値を並べて比較・「もし〜だったら」シミュレーション・条件変更による即時再計算

M8【満足】ツールチップ・入力ガイダンス・ヘルプテキスト充実
  → 各入力欄への説明テキスト追加・?アイコン+ツールチップ・入力例・単位の明示でユーザーの迷いを解消

M9【拡散×満足】結果シェア機能（Twitter/LINE/クリップボードコピー）
  → 計算・診断結果をSNSシェア・navigator.share API・クリップボードコピーボタン実装

M10【満足】印刷・結果エクスポート機能
  → window.print()ボタン・結果テキストのクリップボードコピー・CSVダウンロード実装

M11【満足×集客】使い方・活用例・FAQ充実（オンボーディング）
  → このサービス固有の活用例3件以上・FAQ5問以上でユーザーが迷わず使いこなせる状態に整備
  ⚠️ 厳禁: 「ライフスタイルツールの活用ガイド」「お金・家計ツールの活用ガイド」等の汎用h2ブロック、「AppADayCreator のツールの特徴」のulリスト、「初回利用時にはまずフォームや入力欄に...」「スマートフォンからのご利用でも...」等の全サービス共通の定型文は一切使わないこと。AdSense「スケールされたコンテンツ悪用」ポリシー違反の原因になる。

M12【満足×集客】関連コンテンツ・解説記事セクション
  → このサービスのテーマに関する豆知識・アドバイス・解説コンテンツ追加（深掘り情報→SEO＆滞在時間向上）
  ⚠️ 厳禁: 「ぜひトップページから他のツールもご活用ください。すべて完全無料・登録不要でお使いいただけます」「家計管理・健康記録・育児サポート...」等の汎用CTA文章は一切使わないこと。

M13【集客×満足】内部リンク・他サービス誘導
  → appadaycreator.comの関連サービスへの誘導リンク・フッター送客・「こんなツールも」セクション追加

M14【集客】SEO構造化データ（FAQPage/HowToスキーマ）
  → FAQPageスキーマ・HowToスキーマをapplication/ld+jsonで実装・検索リッチスニペット獲得

M15【集客】meta description・OGタグ最適化
  → 120〜160文字のmeta description・og:title/description/image/url設定・SNSシェア見栄え改善

M16【集客×再訪】PWA化（ホーム画面追加・オフライン対応）
  → manifest.json設定・beforeinstallpromptでインストール促進・Service Workerでオフライン基本動作

M17【収益】収益導線の最適化（CTAデザイン・AdSense配置）
  → 既存アフィリエイトリンクのCTAボタンデザイン化・AdSenseスロット追加・収益CTAの視認性改善

M18【品質】モバイル最適化・レスポンシブ改善
  → viewportメタタグ確認・タップターゲットサイズ44px以上・モバイルでの入力しやすさ改善

M19【品質】パフォーマンス・不要コード除去
  → FontAwesome等不要ライブラリ除去・console.log削除・画像遅延読み込み（loading="lazy"）追加

M20【品質】アクセシビリティ（alt属性・aria属性）
  → img alt属性追加・button/input aria-label・フォームlabel・キーボード操作対応

⚠️ M1〜M20の番号順（ユーザー価値×収益の優先度順）に実装すること。⬜未実施の施策を上位から実装する。
⚠️ 見た目だけの修正（色変更・テーマカラー・デザイン微調整）は施策外のため実施しない。
⚠️ 外部API・外部サービス新規連携は禁止。全機能はブラウザ内（localStorage・Chart.js・純粋なJS計算）のみ。
⚠️ 絶対禁止: px.a8.net を含むアフィリエイトリンク・ビーコンimgは削除・変更しないこと。収益源のため必須保持。"""


def _extract_a8_pairs(html: str) -> list[dict]:
    """index.htmlからA8.netのリンク+ビーコンimgペアを全て抽出する。
    Returns: [{"mat": code, "link": link_html, "beacon": beacon_html}, ...]"""
    import re as _re
    pairs = []
    seen = set()

    a_pattern = _re.compile(
        r'(<a\s[^>]*href=["\']https://px\.a8\.net/[^"\']*a8mat=([A-Z0-9+]+)[^"\']*["\'][^>]*>.*?</a>)',
        _re.DOTALL | _re.IGNORECASE
    )
    for m in a_pattern.finditer(html):
        link_html = m.group(1)
        mat_code = m.group(2)
        if mat_code in seen:
            continue
        seen.add(mat_code)
        after = html[m.end():m.end() + 400]
        beacon_m = _re.search(
            r'<img\b[^>]*src=["\'][^"\']*a8\.net/0\.gif[^"\']*["\'][^>]*>',
            after, _re.IGNORECASE
        )
        pairs.append({
            "mat": mat_code,
            "link": link_html,
            "beacon": beacon_m.group(0) if beacon_m else "",
        })
    return pairs


def _restore_missing_a8_pairs(idx: Path, saved: list[dict], repo: str) -> int:
    """改善後のHTMLで消えたA8リンクを</body>前に再挿入する。Returns: 復元件数。"""
    if not saved or not idx.exists():
        return 0
    html = idx.read_text(encoding="utf-8", errors="ignore")
    missing = [p for p in saved if p["mat"] not in html]
    if not missing:
        return 0

    blocks = []
    for p in missing:
        blocks.append(
            f'<div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;'
            f'padding:12px;margin:8px auto;max-width:640px;text-align:center;">'
            f'{p["link"]}{p["beacon"]}</div>'
        )
    insert = (
        "\n<!-- AF RESTORED -->\n<div style='max-width:640px;margin:0 auto;padding:0 16px;'>\n"
        + "\n".join(blocks)
        + "\n</div>\n"
    )
    new_html = html.replace("</body>", insert + "</body>", 1)
    idx.write_text(new_html, encoding="utf-8")
    log(f"  AF保護: {len(missing)}件を復元 ({repo}): {[p['mat'][:10] for p in missing]}")
    return len(missing)


def _build_gsc_hint(svc: dict) -> str:
    """GSCメトリクスを元にターゲット改善指示を返す。データがない場合は空文字。"""
    clicks  = svc.get("clicks7d", 0)
    impr    = svc.get("impr7d",   0)
    rank    = svc.get("rank7d",   0.0)
    ctr     = (clicks / impr * 100) if impr > 0 else 0.0

    hints = []

    if impr == 0:
        hints.append("・GSC表示回数がゼロです。構造化データ（FAQPage/HowTo/WebApplication schema）の追加・修正と、メタタイトル・descriptionへの主要キーワード追記でインデックス流入を狙ってください。")
    else:
        if rank > 15:
            hints.append(f"・平均掲載順位が{rank:.1f}位と低めです。コンテンツの網羅性と専門性を高め（FAQ追加・手順解説・比較表追加）、内部リンクも強化してください。")
        elif rank > 8:
            hints.append(f"・平均掲載順位{rank:.1f}位。タイトル・見出し（h1/h2）へのキーワード再配置と、ユーザー意図に沿ったコンテンツ拡充で上位表示を狙ってください。")
        if ctr < 1.5 and impr >= 50:
            hints.append(f"・表示回数{impr}に対しCTR{ctr:.1f}%と低いです。title/descriptionを検索意図に合わせてクリックしたくなる文言に書き換えてください（数字・ベネフィット・緊急性を含める）。")
        if clicks >= 20:
            hints.append(f"・週間クリック数{clicks}件と流入があります。CTA配置・アフィリエイトリンクの視認性向上・離脱防止施策（目的到達後のNext Step提示）で収益化を強化してください。")

    if not hints:
        return ""

    return (
        "【GSCデータに基づく優先改善指示（最優先で対応すること）】\n"
        + "\n".join(hints)
        + f"\n（参考: 直近7日 表示:{impr} / クリック:{clicks} / 平均順位:{rank:.1f} / CTR:{ctr:.1f}%）"
    )


def _build_psi_hint(svc: dict) -> str:
    """PSIスコアに基づくパフォーマンス改善指示を返す。スコアが良好な場合は空文字。"""
    score = svc.get("psi_score")
    if score is None or score >= 90:
        return ""

    hints = []
    if score < 50:
        hints.append(
            f"・PageSpeedスコアが{score}点（Poor）です。"
            "画像をWebP化・lazy-load追加、不要なインラインスクリプト削除、"
            "CSSのinline化でCLS/LCP/FCPを改善してください。"
        )
    elif score < 70:
        hints.append(
            f"・PageSpeedスコアが{score}点（要改善）です。"
            "画像にwidth/height属性追加、スクリプトにdefer付与、"
            "重いライブラリのCDN化でスコアを70点以上に改善してください。"
        )
    else:
        hints.append(
            f"・PageSpeedスコアが{score}点です。"
            "画像にloading=\"lazy\"追加、不要CSSの削除など軽微な最適化でGood（90+）を目指してください。"
        )

    return (
        "【PageSpeedパフォーマンス改善（SEOランキングに直結）】\n"
        + "\n".join(hints)
        + f"\n（参考: PSIモバイルスコア={score}/100）"
    )


_M_SECTION_MAP: dict[str, str] = {
    "M1":  "結果表示エリア付近のCTAボタン・アフィリエイトリンク（button/a タグ・結果出力div）",
    "M2":  "入力フォーム・バリデーション部分（input/select/form タグ周辺）",
    "M3":  "localStorage 読み書きJS（getItem/setItem・履歴表示ロジック）",
    "M4":  "Chart.js 初期化・グラフ描画部分（new Chart・canvas要素）",
    "M5":  "結果セクション後のアフィリエイト推薦エリア（px.a8.net 付近）",
    "M6":  "目標・進捗管理JS（目標値設定・達成度計算ロジック）",
    "M7":  "比較テーブル・シミュレーション切り替えUI",
    "M8":  "各入力欄の title 属性・ツールチップ・説明テキスト",
    "M9":  "SNSシェアボタン・クリップボードコピーJS",
    "M10": "印刷用CSS・エクスポート処理JS",
    "M11": "FAQ・使い方セクション（details/dl タグ・.faq-area）",
    "M12": "関連コンテンツ・解説記事リンクセクション",
    "M13": "フッター・サイドバーの内部リンク誘導エリア",
    "M14": "<head> 内の JSON-LD（application/ld+json）・schema 属性",
    "M15": "<head> 内の meta[name=description]・og:・twitter: タグ",
    "M16": "<head> 内の manifest リンク・ServiceWorker 登録JS",
    "M17": "収益CTAボタン・AdSenseコードブロック",
    "M18": "@media・モバイル用CSS・viewport 設定",
    "M19": "未使用変数・重複コード・インライン過多スタイル",
    "M20": "img[alt]・aria-label・role 属性・tabindex",
}


def _build_section_hint(pre_issues: list[str]) -> str:
    """未実施M番号に対応するHTMLセクション集中ヒントを返す。
    Claudeが全ファイルを精査せず対象箇所に直行できるよう誘導してトークンを削減する。"""
    import re as _re_s
    lines = []
    for issue in pre_issues:
        m = _re_s.match(r'\[(M\d+)\]', issue)
        if m:
            mid = m.group(1)
            if mid in _M_SECTION_MAP:
                lines.append(f"  {mid}: {_M_SECTION_MAP[mid]}")
    if not lines:
        return ""
    return (
        "【編集集中箇所（全ファイル精査より優先）】\n"
        "未実施施策に対応する以下の箇所のみ編集してください。それ以外は読み飛ばしてOK:\n"
        + "\n".join(lines)
    )


def _build_focused_guide(pending_ids: set) -> str:
    """_PRIORITY_GUIDEから未実施M番号のセクションのみ抽出して返す。
    フェーズ1スキップ時に使用することで、実装不要な施策の説明文（全体の大半）を除去する。"""
    import re as _re_g
    if not pending_ids:
        return _PRIORITY_GUIDE
    # ヘッダー（最初のMセクション前）を取得
    header_end = _re_g.search(r'\nM1【', _PRIORITY_GUIDE)
    header = _PRIORITY_GUIDE[:header_end.start()] if header_end else ""
    # ⚠️フッターを取得（M20セクション後の注意事項）
    footer_start = _re_g.search(r'\n⚠️ M1〜', _PRIORITY_GUIDE)
    footer = _PRIORITY_GUIDE[footer_start.start():] if footer_start else ""
    # ボディ部分（M1〜M20のセクション群）からpending_idsに一致するものだけ抽出
    body_start = header_end.start() if header_end else 0
    body_end = footer_start.start() if footer_start else len(_PRIORITY_GUIDE)
    body = _PRIORITY_GUIDE[body_start:body_end]
    sections = _re_g.split(r'(?=\nM\d+【)', body)
    filtered = [
        s for s in sections
        if (m := _re_g.match(r'\nM(\d+)【', s)) and f"M{m.group(1)}" in pending_ids
    ]
    return header + "".join(filtered) + footer


def _build_code_snippets(pending_ids: set, service_name: str, repo: str) -> str:
    """㉒ 単純施策（_SIMPLE_M）向けの実装スニペットをプロンプトに直注入する。
    Haikuが実装方法を考えるトークンを省き、直接Edit呼び出しに集中させる。
    複雑施策（_COMPLEX_M）は Sonnet に任せるため対象外。"""
    targets = pending_ids & _SIMPLE_M
    if not targets:
        return ""

    snippets = []

    if "M11" in targets:
        snippets.append(
            "M11スニペット（<main>末尾または</article>前に挿入）:\n"
            "<section><h2>よくある質問</h2><details><summary>このツールは無料ですか？</summary>"
            "<p>はい、完全無料・登録不要でご利用いただけます。</p></details>"
            "<details><summary>スマートフォンでも使えますか？</summary>"
            "<p>はい、モバイル対応しています。</p></details>"
            "<details><summary>計算結果はどこかに保存されますか？</summary>"
            "<p>ブラウザのlocalStorageに保存されます。サーバーへの送信はありません。</p></details>"
            "</section>"
        )

    if "M13" in targets:
        snippets.append(
            "M13スニペット（</footer>前または<footer>内に追加）:\n"
            '<nav aria-label="関連ツール"><p>関連する無料ツール: '
            '<a href="https://appadaycreator.com/">AppADayCreator トップ</a></p></nav>'
        )

    if "M14" in targets:
        snippets.append(
            "M14スニペット（</head>直前に挿入）:\n"
            '<script type="application/ld+json">{"@context":"https://schema.org",'
            '"@type":"FAQPage","mainEntity":[{"@type":"Question",'
            f'"name":"「{service_name}」は無料で使えますか？",'
            '"acceptedAnswer":{"@type":"Answer","text":"はい、完全無料・登録不要です。"}},'
            '{"@type":"Question","name":"スマートフォンでも使えますか？",'
            '"acceptedAnswer":{"@type":"Answer","text":"はい、モバイル対応済みです。"}}]}'
            "</script>"
        )

    if "M15" in targets:
        snippets.append(
            "M15スニペット（<head>内の既存metaの後に追加・存在しない場合のみ）:\n"
            f'<meta property="og:title" content="{service_name} | AppADayCreator">\n'
            f'<meta property="og:description" content="{service_name}の無料ツール。登録不要でスマートフォンからも利用可能。">\n'
            '<meta property="og:type" content="website">\n'
            f'<meta property="og:url" content="https://appadaycreator.com/{repo}/">\n'
            '<meta name="twitter:card" content="summary">'
        )

    if "M16" in targets:
        snippets.append(
            "M16スニペット（<head>内に追加・manifest.jsonが存在する場合のみ）:\n"
            f'<link rel="manifest" href="/{repo}/manifest.json">'
        )

    if "M18" in targets:
        snippets.append(
            "M18スニペット（<head>内に追加・viewportがない場合のみ）:\n"
            '<meta name="viewport" content="width=device-width,initial-scale=1">'
        )

    if "M19" in targets:
        snippets.append(
            "M19対応: console.log の削除・FontAwesomeのCDNリンク削除。"
            "img[loading]がない場合は loading=\"lazy\" を追加。"
        )

    if "M20" in targets:
        snippets.append(
            "M20対応: alt属性のない<img>タグに alt=\"\" （装飾画像）または適切なaltテキストを追加。"
            "button要素にaria-labelを追加（テキストがない場合）。"
        )

    if not snippets:
        return ""

    return (
        "\n\n【㉒ 実装スニペット（そのままコピー&編集して使用すること・考え直し不要）】\n"
        + "\n\n".join(snippets)
    )


def _python_patch(repo: str, pending_ids: set, service_name: str = "") -> set:
    """㉖㉛㊳㊻ 自明施策（M9/M11/M12/M13/M14/M15/M16/M18/M19/M20）をPythonで直接修正し、実施済みidを返す。
    Claudeを呼ばずにHTMLを直接編集することでトークンを節約する。"""
    trivial = pending_ids & {"M9", "M11", "M12", "M13", "M14", "M15", "M16", "M18", "M19", "M20"}
    if not trivial:
        return set()
    idx = WORKSPACE / repo / "index.html"
    if not idx.exists():
        return set()

    html = idx.read_text(encoding="utf-8", errors="ignore")
    original = html
    patched = set()
    import re as _re

    # M18: viewportメタタグ追加（未設定の場合のみ）
    if "M18" in trivial and 'name="viewport"' not in html and "name='viewport'" not in html:
        vp = '<meta name="viewport" content="width=device-width,initial-scale=1">'
        html = html.replace("<head>", "<head>\n" + vp, 1)
        if 'name="viewport"' in html:
            patched.add("M18")

    # M16: manifest.jsonが存在する場合のみ<link rel="manifest">追加
    if "M16" in trivial and 'rel="manifest"' not in html and "manifest.json" not in html:
        manifest_path = WORKSPACE / repo / "manifest.json"
        if manifest_path.exists():
            mf = f'<link rel="manifest" href="/{repo}/manifest.json">'
            html = html.replace("</head>", mf + "\n</head>", 1)
            if 'rel="manifest"' in html:
                patched.add("M16")

    # ㉛ M15: OGPメタタグ追加（og:title/og:image が両方ない場合のみ）
    if "M15" in trivial and "og:title" not in html and "og:image" not in html:
        _sn = service_name or repo
        # ㊾ 既存meta descriptionがあればog:descriptionに流用（固定テンプレートより高品質）
        _existing_desc = _re.search(
            r'<meta\s+name=["\']description["\']\s+content=["\'](.*?)["\']',
            html, _re.IGNORECASE
        )
        _og_desc = (_existing_desc.group(1) if _existing_desc
                    else f"{_sn}の無料ツール。登録不要でスマートフォンからも利用可能。")
        og_tags = (
            f'<meta property="og:title" content="{_sn} | AppADayCreator">\n'
            f'<meta property="og:description" content="{_og_desc}">\n'
            '<meta property="og:type" content="website">\n'
            f'<meta property="og:url" content="https://appadaycreator.com/{repo}/">\n'
            '<meta name="twitter:card" content="summary">'
        )
        html = html.replace("</head>", og_tags + "\n</head>", 1)
        if "og:title" in html:
            patched.add("M15")

    # ㉛ M14: FAQPageスキーマ追加（未設定の場合のみ）
    if "M14" in trivial and "FAQPage" not in html:
        _sn = service_name or repo
        faq_schema = (
            '<script type="application/ld+json">{"@context":"https://schema.org",'
            '"@type":"FAQPage","mainEntity":['
            '{"@type":"Question",'
            f'"name":"「{_sn}」は無料で使えますか？",'
            '"acceptedAnswer":{"@type":"Answer","text":"はい、完全無料・登録不要です。"}},'
            '{"@type":"Question","name":"スマートフォンでも使えますか？",'
            '"acceptedAnswer":{"@type":"Answer","text":"はい、モバイル対応済みです。"}}]}'
            "</script>"
        )
        html = html.replace("</head>", faq_schema + "\n</head>", 1)
        if "FAQPage" in html:
            patched.add("M14")

    # ㊶ M14: HowToスキーマ追加（FAQPageと独立チェック・未設定の場合のみ）
    if "M14" in trivial and "HowTo" not in html:
        _sn = service_name or repo
        howto_schema = (
            '<script type="application/ld+json">{"@context":"https://schema.org",'
            '"@type":"HowTo",'
            f'"name":"{_sn}の使い方",'
            '"step":['
            '{"@type":"HowToStep","name":"入力","text":"画面の入力フォームに情報を入力してください。"},'
            '{"@type":"HowToStep","name":"実行","text":"ボタンを押して計算・診断を実行してください。"},'
            '{"@type":"HowToStep","name":"確認","text":"表示された結果を確認してご活用ください。"}]}'
            '</script>'
        )
        html = html.replace("</head>", howto_schema + "\n</head>", 1)
        if "HowTo" in html:
            patched.add("M14")  # set()なので重複追加は無害

    # ㉛ M13: 内部リンク追加（appadaycreator.comへのリンクがない場合のみ）
    if "M13" in trivial and "appadaycreator.com" not in html:
        internal_link = (
            '<nav aria-label="関連ツール" style="text-align:center;padding:8px 16px;font-size:.85em;">'
            '<a href="https://appadaycreator.com/">関連する無料ツール一覧 | AppADayCreator</a>'
            '</nav>'
        )
        html = html.replace("</footer>", internal_link + "\n</footer>", 1)
        if "appadaycreator.com" not in html:
            html = html.replace("</body>", internal_link + "\n</body>", 1)
        if "appadaycreator.com" in html:
            patched.add("M13")

    # M19: console.log削除・FontAwesome CDNリンク削除
    if "M19" in trivial:
        _h = html
        _h = _re.sub(r'\bconsole\.log\s*\([^)]{0,200}\)\s*;?', '', _h)
        _h = _re.sub(
            r'<link[^>]*href=["\'][^"\']*font.awesome[^"\']*["\'][^>]*/?>[ \t]*\n?',
            '', _h, flags=_re.IGNORECASE
        )
        _h = _re.sub(
            r'<script[^>]*src=["\'][^"\']*font.awesome[^"\']*["\'][^>]*>\s*</script>[ \t]*\n?',
            '', _h, flags=_re.IGNORECASE
        )
        if _h != html:
            html = _h
            patched.add("M19")

    # M20: alt属性のない<img>タグにalt=""を追加（装飾画像）
    if "M20" in trivial:
        def _add_alt(m):
            tag = m.group(0)
            if "alt=" in tag.lower():
                return tag
            if tag.endswith("/>"):
                return tag[:-2] + ' alt=""/>'
            return tag[:-1] + ' alt="">'
        new_html = _re.sub(r'<img\b[^>]*>', _add_alt, html, flags=_re.IGNORECASE)
        if new_html != html:
            html = new_html
            patched.add("M20")

    # ㊳ M9: SNSシェアボタン追加（twitter/LINEが両方ない場合のみ）
    if "M9" in trivial and "twitter.com/intent/tweet" not in html and "line.me/R/share" not in html:
        import urllib.parse as _up
        _sn = service_name or repo
        _enc_url = _up.quote(f"https://appadaycreator.com/{repo}/")
        _enc_name = _up.quote(_sn)
        share_block = (
            f'<div style="text-align:center;padding:12px 16px;font-size:.9em;">'
            f'<a href="https://twitter.com/intent/tweet?url={_enc_url}&text={_enc_name}" '
            f'target="_blank" rel="noopener" style="margin:4px 10px;color:#1da1f2;">𝕏でシェア</a>'
            f'<a href="https://line.me/R/share?text={_enc_name}+{_enc_url}" '
            f'target="_blank" rel="noopener" style="margin:4px 10px;color:#06c755;">LINEで送る</a>'
            f'</div>'
        )
        # </footer>があればその直前に、なければ</body>直前に挿入
        if "</footer>" in html:
            html = html.replace("</footer>", share_block + "\n</footer>", 1)
        else:
            html = html.replace("</body>", share_block + "\n</body>", 1)
        if "twitter.com/intent/tweet" in html:
            patched.add("M9")

    # ㊻ M11: よくある質問セクション追加（AdSense安全テンプレート・Claudeの違反フレーズ生成を回避）
    if "M11" in trivial and not any(kw in html for kw in ["使い方", "ご利用方法", "よくある", "FAQ", "<details", "HowTo"]):
        faq_section = (
            '<section style="padding:16px;background:#f8f9fa;margin:16px 0;border-radius:8px;">'
            '<h2 style="font-size:1.1em;margin-bottom:8px;">よくある質問</h2>'
            '<details style="margin:4px 0"><summary style="cursor:pointer">このツールは無料ですか？</summary>'
            '<p style="padding:8px 0;margin:0">はい、完全無料・登録不要でご利用いただけます。</p></details>'
            '<details style="margin:4px 0"><summary style="cursor:pointer">スマートフォンでも使えますか？</summary>'
            '<p style="padding:8px 0;margin:0">はい、モバイル対応しています。</p></details>'
            '<details style="margin:4px 0"><summary style="cursor:pointer">入力データはどこかに送信されますか？</summary>'
            '<p style="padding:8px 0;margin:0">いいえ、すべての処理はブラウザ内で完結します。</p></details>'
            '</section>'
        )
        if "</main>" in html:
            html = html.replace("</main>", faq_section + "\n</main>", 1)
        elif "</article>" in html:
            html = html.replace("</article>", faq_section + "\n</article>", 1)
        elif "</footer>" in html:
            html = html.replace("</footer>", faq_section + "\n</footer>", 1)
        else:
            html = html.replace("</body>", faq_section + "\n</body>", 1)
        if "よくある質問" in html:
            patched.add("M11")

    # ㊻ M12: 関連コンテンツセクション追加（nav/footer除外でAdSense安全）
    if "M12" in trivial:
        import re as _re_m12
        _html_no_nav_m12 = _re_m12.sub(
            r'<(?:nav|header|footer)[^>]*>.*?</(?:nav|header|footer)>',
            '', html, flags=_re_m12.IGNORECASE | _re_m12.DOTALL
        )
        _m12_existing = any(kw in _html_no_nav_m12 for kw in
                            ["関連コンテンツ", "関連記事", "コラム", "豆知識", "アドバイス", "解説", "ヒント"])
        if not _m12_existing:
            related_section = (
                '<section style="padding:16px;background:#f0f4ff;margin:16px 0;border-radius:8px;">'
                '<h2 style="font-size:1.1em;margin-bottom:8px;">関連コンテンツ</h2>'
                '<p style="margin:0">他の無料ツールも合わせてご活用ください。'
                '<a href="https://appadaycreator.com/" style="color:#4f46e5">ツール一覧を見る →</a></p>'
                '</section>'
            )
            if "</footer>" in html:
                html = html.replace("</footer>", related_section + "\n</footer>", 1)
            else:
                html = html.replace("</body>", related_section + "\n</body>", 1)
            if "関連コンテンツ" in html:
                patched.add("M12")

    if html != original:
        # ㊵ パッチ後HTML構造検証: 必須タグが揃っているか確認（破損なら元に戻す）
        _required_tags = ["<html", "</html>", "<head>", "</head>", "<body"]
        _broken_tag = next((t for t in _required_tags if t not in html.lower()), None)
        if _broken_tag:
            idx.write_text(original, encoding="utf-8")
            log(f"  ㊵ Pythonパッチ後HTML構造破損({_broken_tag}未検出) → 元に戻しました ({repo})")
            return set()
        idx.write_text(html, encoding="utf-8")
        log(f"  ㉖㉛㊳ Python直接パッチ: {sorted(patched)} ({repo})")

    return patched


def _inject_html_sections(pre_issues: list, repo: str) -> str:
    """㉗ 未実施施策に対応するHTMLセクションをプロンプトに直接注入する。
    ClaudeがRead toolを使わずに対象箇所を編集できるようにしてトークンを節約する（最大1800文字）。"""
    import re as _re
    idx = WORKSPACE / repo / "index.html"
    if not idx.exists():
        return ""

    html = idx.read_text(encoding="utf-8", errors="ignore")
    pending_m = {
        _re.match(r'\[(M\d+)\]', i).group(1)
        for i in pre_issues if _re.match(r'\[(M\d+)\]', i)
    }
    if not pending_m:
        return ""

    sections = []

    # M14/M15: <head>内容を注入（SEOメタ・スキーマ挿入ポイントの特定に最も有効）
    if pending_m & {"M14", "M15"}:
        head_m = _re.search(r'<head>(.*?)</head>', html, _re.IGNORECASE | _re.DOTALL)
        if head_m:
            head_content = head_m.group(1).strip()
            sections.append(f"現在の<head>内容:\n```html\n{head_content[:500]}\n```")

    # M11/M12: </main>前のHTMLを注入（FAQセクション挿入ポイント）
    if pending_m & {"M11", "M12"}:
        main_end = html.rfind("</main>")
        if main_end > 0:
            snippet = html[max(0, main_end - 300):main_end]
            sections.append(f"</main>前の現在のHTML:\n```html\n...{snippet}\n</main>\n```")

    # M13: </body>前のHTML（内部リンク/フッター挿入ポイント）
    if "M13" in pending_m:
        body_end = html.rfind("</body>")
        if body_end > 0:
            snippet = html[max(0, body_end - 200):body_end]
            sections.append(f"</body>前の現在のHTML:\n```html\n...{snippet}\n</body>\n```")

    if not sections:
        return ""

    total = "\n\n".join(sections)
    if len(total) > 1800:
        total = total[:1800] + "\n...(省略)"

    return (
        "\n\n【㉗ 対象HTMLセクション（Read tool不要・このHTMLを直接参照して編集すること）】\n"
        + total
    )


def _get_fail_cooldown(repo: str) -> float:
    """㉚ 連続失敗回数に応じた指数バックオフクールダウン時間（時間単位）を返す。
    fail_count: 0→24h / 1→48h / 2→96h / 3+→168h（1週間上限）"""
    count = _fail_counts.get(repo, 0)
    if count <= 0:
        return COOLDOWN_FAIL_HOURS       # 24h（通常）
    elif count == 1:
        return COOLDOWN_FAIL_HOURS * 2  # 48h
    elif count == 2:
        return COOLDOWN_FAIL_HOURS * 4  # 96h
    else:
        return COOLDOWN_FAIL_HOURS * 7  # 168h（1週間上限）


def _validate_and_fix_jsonld(idx: Path, bak_bytes: bytes | None) -> tuple[bool, str]:
    """㉝ JSON-LDの構文検証と自動修復を行う。
    不正なJSON-LDブロックを除去。HTML構造が壊れていればrollback。
    Returns: (ok: bool, detail_message: str)"""
    if not idx.exists():
        return True, ""
    import re as _re
    html = idx.read_text(encoding="utf-8", errors="ignore")

    # HTML構造チェック（必須タグの存在確認）
    for tag in ["<html", "</html>", "<head>", "</head>", "<body"]:
        if tag not in html.lower():
            if bak_bytes:
                idx.write_bytes(bak_bytes)
                return False, f"HTML構造破損({tag}未検出) → ロールバック済み"
            return False, f"HTML構造破損({tag}未検出)"

    # JSON-LDブロック検証・修復
    _ld_pattern = _re.compile(
        r'<script\s+type=["\']application/ld\+json["\']>(.*?)</script>',
        _re.DOTALL | _re.IGNORECASE
    )
    removed_count = 0

    def _fix_ld_block(m):
        nonlocal removed_count
        try:
            json.loads(m.group(1).strip())
            return m.group(0)  # 正常: そのまま
        except (json.JSONDecodeError, ValueError):
            removed_count += 1
            return ""  # 不正JSONブロックを除去

    new_html = _ld_pattern.sub(_fix_ld_block, html)
    if removed_count > 0:
        idx.write_text(new_html, encoding="utf-8")
        return True, f"不正JSON-LD {removed_count}ブロック除去"

    return True, ""


def _check_adsense_policy(idx: Path, bak_bytes: bytes | None) -> tuple[bool, str]:
    """㉞ AdSenseポリシー違反テンプレ（スケールコンテンツ）を検出してロールバックする。
    M11/M12で挿入される可能性のある汎用定型文を禁止フレーズリストで検査。
    Returns: (ok: bool, detail_message: str)"""
    _BANNED = [
        "ライフスタイルツールの活用ガイド",
        "お金・家計ツールの活用ガイド",
        "健康・フィットネスツールの活用ガイド",
        "AppADayCreator のツールの特徴",
        "AppADayCreatorのツールの特徴",
        "初回利用時にはまずフォームや入力欄に",
        "スマートフォンからのご利用でも",
        "すべて完全無料・登録不要でお使いいただけます",
        "家計管理・健康記録・育児サポート",
        "ぜひトップページから他のツールもご活用ください",
        "このツールの使い方は非常にシンプル",
        "まずは画面上のフォームや入力欄",
    ]
    if not idx.exists():
        return True, ""
    html = idx.read_text(encoding="utf-8", errors="ignore")
    for phrase in _BANNED:
        if phrase in html:
            if bak_bytes:
                idx.write_bytes(bak_bytes)
                return False, f"AdSense違反フレーズ検出 → ロールバック済み: 「{phrase}」"
            return False, f"AdSense違反フレーズ検出（rollbackなし）: 「{phrase}」"
    return True, ""


def _git_commit_and_push(repo: str, s_delta: int) -> bool:
    """㉘㉜ 改善後にgit commit+pushを自動実行する。
    ㉜安全ゲート: index.html/SPEC.md/manifest.jsonのみステージ。
    A8リンク削除・ファイル削除を検出した場合はpushを中止してTelegram通知する。
    並列ワーカー競合はロックで直列化。Returns: True=成功, False=失敗。"""
    if _git_lock is None:
        return False
    service_dir = WORKSPACE / repo
    with _git_lock:
        try:
            # 先行チェック: マージ競合ファイルがある場合は自動解決してから続行
            unmerged_r = subprocess.run(
                ["git", "ls-files", "--unmerged"],
                cwd=str(WORKSPACE), capture_output=True, text=True, timeout=10
            )
            if unmerged_r.stdout.strip():
                unmerged_files = list({
                    line.split("\t")[-1] for line in unmerged_r.stdout.strip().splitlines() if "\t" in line
                })
                resolved = []
                for cf in unmerged_files:
                    # checkout --ours で我々の版を採用し git add で競合解決済みとしてマーク
                    # ※ git restore --staged は解決をキャンセルしてしまうため呼ばない
                    r1 = subprocess.run(["git", "checkout", "--ours", "--", cf],
                                        cwd=str(WORKSPACE), capture_output=True, text=True, timeout=10)
                    r2 = subprocess.run(["git", "add", "-f", cf],
                                        cwd=str(WORKSPACE), capture_output=True, text=True, timeout=10)
                    if r1.returncode == 0 and r2.returncode == 0:
                        resolved.append(cf)
                    else:
                        log(f"  ㉘ 競合解決失敗 {cf}: checkout={r1.returncode} add={r2.returncode}")
                if resolved:
                    log(f"  ㉘ 先行: マージ競合を自動解決 ({len(resolved)}件): {', '.join(resolved[:3])}")
                still_r = subprocess.run(
                    ["git", "ls-files", "--unmerged"],
                    cwd=str(WORKSPACE), capture_output=True, text=True, timeout=10
                )
                if still_r.stdout.strip():
                    remaining = list({
                        line.split("\t")[-1] for line in still_r.stdout.strip().splitlines() if "\t" in line
                    })
                    msg = (f"⚠️ マージ競合を自動解決できず ({repo}) → commitスキップ\n" +
                           "\n".join(f"  {f}" for f in remaining[:5]))
                    log(f"  ㉘ {msg}")
                    send_telegram(msg)
                    return False

            # ㉜ 安全ゲート①: 許可ファイルのみ個別にadd（ディレクトリ丸ごとadd廃止）
            _safe_files = [
                service_dir / "index.html",
                service_dir / "SPEC.md",
                service_dir / "manifest.json",
            ]
            staged_any = False
            for _f in _safe_files:
                if _f.exists():
                    add_r = subprocess.run(
                        ["git", "add", "-f", str(_f)],
                        cwd=str(WORKSPACE), capture_output=True, text=True, timeout=30
                    )
                    if add_r.returncode == 0:
                        staged_any = True
            if not staged_any:
                log(f"  ㉘ {repo}: 対象ファイルなし → スキップ")
                return True

            # ステージングに変更があるか確認
            diff_r = subprocess.run(
                ["git", "diff", "--cached", "--name-only"],
                cwd=str(WORKSPACE), capture_output=True, text=True, timeout=30
            )
            if not diff_r.stdout.strip():
                log(f"  ㉘ {repo}: 変更なし → コミットスキップ")
                return True

            # ㊱ 安全ゲート②: HTMLサイズ回帰ガード（-30%以上縮小 or +300%以上膨張で中止）
            _idx_staged = service_dir / "index.html"
            if _idx_staged.exists():
                _head_r = subprocess.run(
                    ["git", "show", f"HEAD:{repo}/index.html"],
                    cwd=str(WORKSPACE), capture_output=True, timeout=15
                )
                if _head_r.returncode == 0 and len(_head_r.stdout) > 1000:
                    _head_size = len(_head_r.stdout)
                    _cur_size = _idx_staged.stat().st_size
                    _ratio = _cur_size / _head_size
                    if _ratio < 0.70 or _ratio > 4.00:
                        subprocess.run(
                            ["git", "restore", "--staged"] + [str(_f) for _f in _safe_files if _f.exists()],
                            cwd=str(WORKSPACE), capture_output=True, timeout=30
                        )
                        msg = (f"⚠️ ㊱ HTMLサイズ回帰検出 ({repo}): "
                               f"HEAD {_head_size:,}B → 現在 {_cur_size:,}B "
                               f"(比率={_ratio:.0%}) → push中止")
                        log(f"  {msg}")
                        send_telegram(msg)
                        return False

            # ㉜ 安全ゲート③: A8リンクの純損失を検出したらpush中止
            # 注意: diff行の "-" 行チェックではなく、ファイル実在で判定する
            # （_restore_missing_a8_pairs でリンクが末尾移動された場合の誤検知を防ぐ）
            diff_content_r = subprocess.run(
                ["git", "diff", "--cached"],
                cwd=str(WORKSPACE), capture_output=True, text=True, timeout=30
            )
            diff_content = diff_content_r.stdout
            _head_a8_r = subprocess.run(
                ["git", "show", f"HEAD:{repo}/index.html"],
                cwd=str(WORKSPACE), capture_output=True, text=True, timeout=15
            )
            _cur_idx = service_dir / "index.html"
            if _head_a8_r.returncode == 0 and _cur_idx.exists():
                import re as _re_a8g
                _head_mats = set(_re_a8g.findall(r'a8mat=([A-Z0-9+]+)', _head_a8_r.stdout))
                _cur_mats  = set(_re_a8g.findall(r'a8mat=([A-Z0-9+]+)', _cur_idx.read_text(encoding="utf-8", errors="ignore")))
                _lost_mats = _head_mats - _cur_mats
                if _lost_mats:
                    subprocess.run(["git", "restore", "--staged"] + [str(_f) for _f in _safe_files if _f.exists()],
                                    cwd=str(WORKSPACE), capture_output=True, timeout=30)
                    # ローカルファイルもHEADに戻す（汚染防止）
                    subprocess.run(["git", "restore", f"{repo}/index.html"],
                                    cwd=str(WORKSPACE), capture_output=True, timeout=30)
                    msg = f"⚠️ ㉜ git push中止: A8リンク純損失検出 ({repo}) 消滅mat={list(_lost_mats)[:2]}"
                    log(f"  {msg}")
                    send_telegram(msg)
                    return False

            # 削除チェックはカレントサービスのディレクトリのみ（他サービスの残留ステージングを誤検知しない）
            deleted_r = subprocess.run(
                ["git", "diff", "--cached", "--diff-filter=D", "--name-only", "--", f"{repo}/"],
                cwd=str(WORKSPACE), capture_output=True, text=True, timeout=30
            )
            if deleted_r.stdout.strip():
                subprocess.run(["git", "restore", "--staged"] + [str(_f) for _f in _safe_files if _f.exists()],
                                cwd=str(WORKSPACE), capture_output=True, timeout=30)
                msg = f"⚠️ ㉜ git push中止: ファイル削除検出 ({repo})\n{deleted_r.stdout.strip()[:120]}"
                log(f"  {msg}")
                send_telegram(msg)
                return False

            # ㊿ 安全ゲート④: JS重要関数・イベントハンドラの正味削除を検知
            _diff_lines = diff_content.splitlines()
            _removed_js = [l[1:] for l in _diff_lines if l.startswith("-") and not l.startswith("---")]
            _added_js   = [l[1:] for l in _diff_lines if l.startswith("+") and not l.startswith("+++")]
            _func_removed = sum(1 for l in _removed_js if "function " in l)
            _func_added   = sum(1 for l in _added_js   if "function " in l)
            _evt_removed  = sum(1 for l in _removed_js if "onclick=" in l or "addEventListener" in l)
            _evt_added    = sum(1 for l in _added_js   if "onclick=" in l or "addEventListener" in l)
            _net_func = _func_removed - _func_added   # 正=削除超過, 負=追加超過
            _net_evt  = _evt_removed  - _evt_added
            # 関数が増加している場合は大規模リファクタとみなし通過
            # 両方とも正味削除が大きい場合のみブロック
            if (_net_func >= 10 and _net_evt >= 10) or _net_func >= 20:
                subprocess.run(["git", "restore", "--staged"] + [str(_f) for _f in _safe_files if _f.exists()],
                                cwd=str(WORKSPACE), capture_output=True, timeout=30)
                msg = (f"⚠️ ㊿ JS機能削除検出 ({repo}): "
                       f"function 削除{_func_removed}→追加{_func_added}件, "
                       f"event 削除{_evt_removed}→追加{_evt_added}件")
                log(f"  {msg}")
                send_telegram(msg)
                return False

            commit_msg = f"improve: {repo} 自動改善 (+{s_delta}施策)"
            commit_r = subprocess.run(
                ["git", "commit", "-m", commit_msg],
                cwd=str(WORKSPACE), capture_output=True, text=True, timeout=30
            )
            if commit_r.returncode != 0:
                log(f"  ㉘ git commit失敗: {commit_r.stderr.strip()[:100]}")
                return False

            # push（競合時はrebase後最大3回リトライ）
            push_ok = False
            for _attempt in range(4):
                push_r = subprocess.run(
                    ["git", "push", "origin", "main"],
                    cwd=str(WORKSPACE), capture_output=True, text=True, timeout=60
                )
                if push_r.returncode == 0:
                    push_ok = True
                    break
                if _attempt < 3:
                    import time as _time
                    _time.sleep(2 ** _attempt)  # 1s, 2s, 4s
                    # unstaged変更をstashして rebase、その後pop
                    stash_r = subprocess.run(
                        ["git", "stash", "--include-untracked"],
                        cwd=str(WORKSPACE), capture_output=True, text=True, timeout=30
                    )
                    stashed = stash_r.returncode == 0 and "No local changes" not in stash_r.stdout
                    rebase_r = subprocess.run(
                        ["git", "pull", "--rebase", "origin", "main"],
                        cwd=str(WORKSPACE), capture_output=True, text=True, timeout=60
                    )
                    if rebase_r.returncode != 0:
                        # rebase失敗 → abort して stash drop
                        subprocess.run(["git", "rebase", "--abort"],
                                       cwd=str(WORKSPACE), capture_output=True, text=True, timeout=30)
                        if stashed:
                            subprocess.run(["git", "stash", "drop"],
                                           cwd=str(WORKSPACE), capture_output=True, text=True, timeout=10)
                        log(f"  ㉘ pull --rebase失敗→abort: {rebase_r.stderr.strip()[:80]}")
                        continue
                    if stashed:
                        pop_r = subprocess.run(
                            ["git", "stash", "pop"],
                            cwd=str(WORKSPACE), capture_output=True, text=True, timeout=30
                        )
                        if pop_r.returncode != 0:
                            # stash pop競合 → --ours（HEAD版）で自動解決
                            conf_r = subprocess.run(
                                ["git", "ls-files", "--unmerged"],
                                cwd=str(WORKSPACE), capture_output=True, text=True, timeout=10
                            )
                            if conf_r.stdout.strip():
                                conf_files = list({
                                    line.split("\t")[-1]
                                    for line in conf_r.stdout.strip().splitlines() if "\t" in line
                                })
                                for cf in conf_files:
                                    # checkout --ours で HEAD版採用 → git add で競合解決済みとしてマーク
                                    # ※ git restore --staged はステージを取り消すため呼ばない
                                    subprocess.run(["git", "checkout", "--ours", cf],
                                                   cwd=str(WORKSPACE), capture_output=True, text=True, timeout=10)
                                    subprocess.run(["git", "add", "-f", cf],
                                                   cwd=str(WORKSPACE), capture_output=True, text=True, timeout=10)
                                log(f"  ㉘ stash pop競合を自動解決 ({len(conf_files)}件): "
                                    f"{', '.join(conf_files[:3])}")
                            else:
                                subprocess.run(["git", "stash", "drop"],
                                               cwd=str(WORKSPACE), capture_output=True, text=True, timeout=10)
                                log(f"  ㉘ stash pop失敗→drop: {pop_r.stderr.strip()[:80]}")
            if not push_ok:
                log(f"  ㉘ git push失敗(3回試行): {push_r.stderr.strip()[:100]}")
                return False

            log(f"  ㉘㉜ git commit+push完了: {repo} (+{s_delta}施策改善)")
            return True
        except subprocess.TimeoutExpired:
            log(f"  ㉘ git操作タイムアウト: {repo}")
            return False
        except Exception as e:
            log(f"  ㉘ git操作エラー: {e}")
            return False


def _select_model_and_turns(pending_ids: set, skip_phase1: bool) -> tuple[str, int]:
    """施策の複雑度に応じてモデルIDとmax-turnsを返す。

    ルーティングロジック:
      - CLAUDE_IMPROVE_MODEL が明示指定されている場合: そのまま使用（ルーティングしない）
      - フェーズ1を実施する場合（pending_idsが空 = quick_scanで何も検出なし）:
            Sonnet / 35ターン（全コード分析が必要なため品質重視）
      - フェーズ1をスキップし複雑施策(M1/M3/M4等)が含まれる場合:
            Sonnet / 25ターン（JS/ロジック実装が必要）
      - フェーズ1をスキップし単純施策(M14/M15/M18等)のみの場合:
            Haiku / 12ターン（HTML属性・メタデータ追加のみ）
    ※ "Reached max turns" エラー検出時はリトライで turns×1.5+5（最大60）に自動拡張
    """
    if _MODEL_EXPLICITLY_SET:
        # 明示指定優先: max-turnsは複雑度に応じて調整するが、モデルは固定
        if not skip_phase1:
            turns = 35  # 25→35: フェーズ1(全分析+実装)は25ターンで上限到達が多発していたため拡張
        elif pending_ids & _COMPLEX_M:
            turns = 40  # 35→40: Haiku+複雑M(M2等)で35ターン使い切り失敗する問題を修正
        else:
            turns = 12
        return CLAUDE_MODEL, turns

    if not skip_phase1:
        # quick_scanで未実施施策なし → フェーズ1から全分析（Sonnet必須）
        # 25ターンでは分析+計画+実装+検証がギリギリで上限到達が多発 → 35に拡張
        return _MODEL_ALIASES["sonnet"], 35

    # フェーズ1スキップ: 複雑施策の有無で判定
    if pending_ids & _COMPLEX_M:
        return _MODEL_ALIASES["sonnet"], 25  # 20→25: 複雑施策実装で20ターン上限到達が発生
    else:
        # 単純な HTML/メタデータ施策のみ → Haiku で十分
        turns = 6 if len(pending_ids) == 1 else 12
        return _MODEL_ALIASES["haiku"], turns



def run_improve(service: dict, pre_issues: list[str], retry_hint: str = "", v_issues: list[str] | None = None, shot_paths: list[str] | None = None) -> tuple[bool, str]:
    """指定サービスに /improve_auto を実行。(成功フラグ, stdout) を返す。"""
    no = service["no"]
    repo = service["repo"]
    idx = WORKSPACE / repo / "index.html"

    # アフィリエイトリンクを事前に退避（改善後に消えていたら復元する）
    saved_af: list[dict] = []
    if idx.exists():
        saved_af = _extract_a8_pairs(idx.read_text(encoding="utf-8", errors="ignore"))

    # pending_ids を事前計算（コマンド構築・ガイドフィルタリングで共用）
    import re as _re2
    pending_ids = set()
    for _issue in pre_issues:
        _m = _re2.match(r'\[(M\d+)\]', _issue)
        if _m:
            pending_ids.add(_m.group(1))

    # ⑬ 1回の実行で実装する施策を上位3件に制限（多件一括は後半の品質低下と副作用リスクを高める）
    if len(pending_ids) > 3:
        _all_sorted = sorted(pending_ids, key=lambda x: int(x[1:]))
        pending_ids = set(_all_sorted[:3])
        _new_pre = []
        for _iss in pre_issues:
            _mm = _re2.match(r'\[(M\d+)\]', _iss)
            if not _mm or _mm.group(1) in pending_ids:
                _new_pre.append(_iss)
        pre_issues = _new_pre
        log(f"  施策上限: {len(_all_sorted)}件 → 上位3件に絞る {sorted(pending_ids, key=lambda x:int(x[1:]))}（残{_all_sorted[3:]}は次回）")

    # ㉖㉛ 自明施策（M13〜M20）をPythonで直接パッチ（Claudeを呼ばずに処理）
    _py_patched = _python_patch(repo, pending_ids, service_name=service["name"])
    if _py_patched:
        pending_ids -= _py_patched
        pre_issues = [i for i in pre_issues if not any(f"[{m}]" in i for m in _py_patched)]
        log(f"  ㉖ Python直接パッチ済み: {sorted(_py_patched)} → Claude対象除外")
        # 全施策がPythonパッチで完了した場合はClaudeをスキップ
        if not pending_ids:
            if saved_af:
                _restore_missing_a8_pairs(idx, saved_af, repo)
            impl_str = "\n".join(f"• {m} Python直接パッチ適用" for m in sorted(_py_patched))
            return True, f"✅ Python直接パッチ完了\n\n📋 実装内容:\n{impl_str}"

    # フェーズ1スキップ判定: quick_scanで未実施施策が検出済みならPhase1を省略して直接Phase2へ
    # ㉑ skip時は /improve_phase2_only を使用（Phase1説明文を丸ごと省いて~600トークン節約）
    _skip_phase1 = bool(pre_issues)
    # 深層レビューモード: quick_scanで何も検出されなかった = 定型施策済み → 品質・訴求力を独自視点で改善
    _deep_review_mode = not pre_issues
    # ㉙ Haiku単純施策ランか判定（guide/sectionHintを省略してさらにトークン節約）
    _is_simple_only = _skip_phase1 and bool(pending_ids) and not (pending_ids & _COMPLEX_M)

    if _skip_phase1:
        if _is_simple_only:
            # ㉙ 単純施策のみ: guideを完全省略（スニペットで代替するため不要）
            cmd = f"/improve_phase2_only {no} {repo}"
        else:
            _guide = _build_focused_guide(pending_ids)
            cmd = f"/improve_phase2_only {no} {repo}{_guide}"
    else:
        cmd = f"/improve_auto {no} {repo}{_PRIORITY_GUIDE}"

    # 施策チェックリスト: フェーズ1スキップ時は未実施のみ表示（✅行を省略してトークン削減）
    _ALL_MEASURES = [
        ("M1",  "診断/計算後の文脈CTAボタン設置"),
        ("M2",  "コア機能のUX改善（入力UI・バリデーション）"),
        ("M3",  "データ保存・履歴機能（localStorage）"),
        ("M4",  "グラフ・スコア・ゲージで結果可視化（Chart.js）"),
        ("M5",  "結果に連動したアフィリエイト商品推薦"),
        ("M6",  "目標設定・達成度トラッキング"),
        ("M7",  "比較・シミュレーション機能"),
        ("M8",  "ツールチップ・入力ガイダンス充実"),
        ("M9",  "結果シェア機能（Twitter/LINE/クリップボード）"),
        ("M10", "印刷・結果エクスポート機能"),
        ("M11", "使い方・活用例・FAQ充実"),
        ("M12", "関連コンテンツ・解説記事セクション"),
        ("M13", "内部リンク・他サービス誘導"),
        ("M14", "SEOスキーマ（FAQPage/HowTo）"),
        ("M15", "meta description・OGタグ最適化"),
        ("M16", "PWA化（manifest・インストール促進）"),
        ("M17", "収益導線最適化（CTAボタン化・AdSense）"),
        ("M18", "モバイル最適化・レスポンシブ改善"),
        ("M19", "パフォーマンス・不要コード除去"),
        ("M20", "アクセシビリティ（alt属性・aria属性）"),
    ]
    if _skip_phase1:
        # フェーズ2直接実装モード: 未実施施策のみ表示（✅行を省いてプロンプト削減）
        checklist_lines = [
            f"  {mid}: {desc} … ⬜ 未実施（実装してください）"
            for mid, desc in _ALL_MEASURES if mid in pending_ids
        ]
        cmd += "\n\n【フェーズ2直接実装対象（未実施施策のみ・M番号順）】\n"
        cmd += "\n".join(checklist_lines)
        cmd += "\n\n↑ ⬜未実施の施策を上位3件のみ実装してください（残りは次回の自動改善で対応）。"
    elif _deep_review_mode:
        # 深層品質レビューモード: 定型施策は全て実装済み → 以下5択から1つ必ず実装
        cmd += """

【深層改善モード】
定型チェックリスト（M1〜M20）は全て実装済みです。
index.htmlを Read で読み込んだ後、下記の「必ず実装できる改善5択」から最も効果が高いものを1つ選び、即座にindex.htmlをEditで実装してください。

⚠️ 絶対ルール: 分析・検討のみで終わらせてはいけません。必ずindex.htmlを実際に編集してください。
⚠️ px.a8.net アフィリエイトリンク・ビーコンimgは絶対に削除・変更しないこと。

【必ず実装できる改善5択（1つ選んで即実装）】

A. FAQ追加（確実に実装可能）
   このサービス固有の具体的なQ&Aを1〜2問、既存FAQの末尾に追加する。
   例: 「Q: {サービス名}を使うベストなタイミングは？ A: {具体的な状況と理由}」
   既存のFAQのHTML構造を維持したまま<div>や<dt><dd>で末尾に追記するだけ。

B. CTA文言強化（確実に実装可能）
   既存CTAボタンや誘導リンクを探し、文言を「行動語」に変更する。
   「こちら」→「今すぐ無料で試す」、「詳しくはこちら」→「詳細を確認する」等。
   1〜3箇所のテキスト変更のみ。

C. 使用例・活用シーン追記（確実に実装可能）
   「こんな方におすすめ」や「活用シーン」セクションが薄い場合、具体例を2〜3件追加する。
   箇条書き(<li>)で追記するだけ。

D. 数値・根拠の追加（確実に実装可能）
   説明文中で「適切な量」「効果的」等の曖昧な表現を、具体的な数値・根拠に置き換える。
   例: 「効果的な量」→「体重1kgあたり1.2〜2.0gが推奨（厚生労働省ガイドライン）」

E. h2/h3見出し改善（確実に実装可能）
   既存の見出しで抽象的・汎用的なものを、サービス固有のキーワードを含む具体的な表現に変更する。
   例: 「使い方」→「タンパク質摂取量の正しい計算方法」（サービス名に合わせて具体化）

↑ A〜Eのうち1つを選んでindex.htmlを実際に編集してください（選択理由の説明は不要・即実装）。"""
    else:
        # フェーズ1実施モード: 全施策チェックリスト表示（初期整備）
        checklist_lines = []
        for mid, desc in _ALL_MEASURES:
            status = "⬜ 未実施（実装してください）" if mid in pending_ids else "✅ 実装済み/該当なし"
            checklist_lines.append(f"  {mid}: {desc} … {status}")
        cmd += "\n\n【20施策 実装状況チェックリスト（M番号順=ユーザー価値×収益の優先度順）】\n"
        cmd += "\n".join(checklist_lines)
        cmd += "\n\n↑ ⬜未実施の施策をM番号順（上位優先）に実装してください。✅は変更不要。"

    # ㉙ Haiku単純施策ランではgsc_hint/section_hintを省略（スニペットで代替・トークン節約）
    if not _is_simple_only:
        gsc_hint = _build_gsc_hint(service)
        if gsc_hint:
            cmd += f"\n\n{gsc_hint}"

        psi_hint = _build_psi_hint(service)
        if psi_hint:
            cmd += f"\n\n{psi_hint}"

        section_hint = _build_section_hint(pre_issues)
        if section_hint:
            cmd += f"\n\n{section_hint}"

        # ㉗ Phase2スキップ時に対象HTMLセクションをプロンプト注入（Claude Read tool不要化）
        if _skip_phase1:
            _html_sections = _inject_html_sections(pre_issues, repo)
            if _html_sections:
                cmd += _html_sections

    if pre_issues and not _skip_phase1:
        # ㉓ skip_phase1=True 時はチェックリストに同内容が既掲載のため重複を省く（~100トークン節約）
        sorted_issues = sorted(pre_issues, key=lambda x: int(_re2.search(r'M(\d+)', x).group(1)) if _re2.search(r'M(\d+)', x) else 99)
        cmd += f"\n\n事前スキャン済み問題（優先度順）: {', '.join(sorted_issues)}"

    # ㉒ 単純施策のみ（Haiku実行予定）の場合: コードスニペットを直注入してHaikuの考察コストを省く
    if _is_simple_only:
        _snippets = _build_code_snippets(pending_ids, service["name"], repo)
        if _snippets:
            cmd += _snippets

    # スクリーンショット直接参照（Claudeが実際の見た目を確認しながら改善）
    _valid_shots = [p for p in (shot_paths or []) if Path(p).exists()]
    if _valid_shots:
        shot_list = "\n".join(f"  - {p}" for p in _valid_shots)
        cmd += (
            f"\n\n【📸 スクリーンショット確認】\n"
            f"以下のスクリーンショット画像をReadツールで読み込み、実際のUI・UXを目視確認してから改善を実装してください:\n"
            f"{shot_list}\n"
            f"（①デスクトップ上部 ②デスクトップ中段 ③モバイル の3視点）\n"
            f"スクショを見て気になる点を改善に活かすこと。"
        )

    if v_issues:
        cmd += "\n\n【🔴絶対実装: スクリーンショット解析による視覚的UI問題】\n"
        for vi in v_issues:
            cmd += f"  {vi}\n"
        cmd += (
            "↑ 上記は実際のスクリーンショットから発見された問題です。\n"
            "これらは必ず全て実装してください。「改善点なし」「対応不要」は禁止。\n"
            "改善できない問題は存在しません。index.htmlを直接編集して修正すること。"
        )

    if retry_hint:
        cmd += f"\n\n【リトライ指示】前回の改善後チェックで以下が未反映でした。これらを最優先で実装してください:\n{retry_hint}"
    if saved_af:
        cmd += (
            f"\n\n⚠️ このページには{len(saved_af)}件のA8.netアフィリエイトリンク（px.a8.net）が"
            f"設置済みです。HTMLを編集する際は必ずこれらをそのまま保持すること。削除禁止。"
        )
    pending_high = [i for i in pre_issues if _re2.match(r'\[M(1[0-3]|[1-9])\]', i)]
    _skill_name = "improve_phase2_only" if _skip_phase1 else "improve_auto"
    log(f"実行: /{_skill_name} {no} {repo} (未実施高優先: {pending_high or 'なし'}, 全:{len(pre_issues)}件, AF保護:{len(saved_af)}件)")

    # モデル・max-turnsをルーティング（施策の複雑度に応じて自動選択）
    _run_model, _max_turns = _select_model_and_turns(pending_ids, _skip_phase1)
    _model_short = "Sonnet" if "sonnet" in _run_model else ("Haiku" if "haiku" in _run_model else _run_model)
    _complex_pending = sorted(pending_ids & _COMPLEX_M, key=lambda x: int(x[1:]))
    _simple_pending  = sorted(pending_ids & _SIMPLE_M,  key=lambda x: int(x[1:]))

    # タイムアウトをmax-turnsに連動（Haiku/単純施策は短く設定してタイムアウト待ち損失を最小化）
    # ㊷ max-turns 6 → 180s / 12 → 300s / 20 → 600s / 35 → 1050s / 25+ → 900s
    _timeout_sec = (180 if _max_turns <= 6 else
                    (300 if _max_turns <= 12 else
                     (600 if _max_turns <= 20 else
                      (1050 if _max_turns <= 35 else TIMEOUT_SEC))))
    # リトライ前の待機時間もタイムアウトに比例させる（短いタイムアウトに長い待機は不要）
    _retry_sleep = 20 if _timeout_sec <= 180 else (30 if _timeout_sec <= 300 else 60)

    log(f"  ルーティング: {_model_short} / max-turns={_max_turns} / timeout={_timeout_sec}s"
        f" | 複雑={_complex_pending or []} 単純={_simple_pending or []}")

    _cmd_args = [str(CLAUDE_BIN), "--dangerously-skip-permissions", "-p", cmd,
                 "--model", _run_model,
                 "--output-format", "text",
                 "--max-turns", str(_max_turns)]

    for attempt in range(1, 3):  # 最大2回試行（初回 + 1リトライ）
        try:
            env = os.environ.copy()
            env["HOURLY_IMPROVE"] = "1"  # Telegram通知を/improve_auto側でスキップさせる
            result = subprocess.run(
                _cmd_args,
                cwd=str(WORKSPACE / repo),
                capture_output=True,
                text=True,
                timeout=_timeout_sec,
                env=env,
            )
            if result.returncode == 0:
                # アフィリエイトリンク保護チェック（消えていれば自動復元）
                if saved_af:
                    _restore_missing_a8_pairs(idx, saved_af, repo)
                log(f"✓ {repo}: 完了" + (f" (attempt={attempt})" if attempt > 1 else ""))
                return True, result.stdout
            else:
                stderr_snippet = result.stderr.strip()[:200]
                stdout_snippet = result.stdout.strip()[:300] if result.stdout else ""
                log(f"✗ {repo}: 失敗 (code={result.returncode}, attempt={attempt}){' ' + stderr_snippet if stderr_snippet else ''}")
                if stdout_snippet:
                    log(f"  失敗stdout: {stdout_snippet}")
                # 失敗stdoutをファイルに保存（デバッグ用）
                try:
                    Path(f"/tmp/fail_stdout_{repo}.txt").write_text(
                        result.stdout or "", encoding="utf-8"
                    )
                except Exception:
                    pass
                if attempt < 2:
                    # "Reached max turns" エラーは同じターン数でリトライしても必ず失敗する
                    # → ターン数を増やして即リトライ（待機不要）
                    if "Reached max turns" in (result.stdout or ""):
                        old_turns = _max_turns
                        # 1.5倍 + 5ターン、最大60ターンまで拡張
                        _max_turns = min(int(_max_turns * 1.5) + 5, 60)
                        _cmd_args = [str(CLAUDE_BIN), "--dangerously-skip-permissions",
                                     "-p", cmd,
                                     "--model", _run_model,
                                     "--output-format", "text",
                                     "--max-turns", str(_max_turns)]
                        log(f"  → ターン数上限到達を検出: {old_turns}→{_max_turns}ターンに拡張してリトライ")
                    else:
                        log(f"  → {_retry_sleep}秒後にリトライします...")
                        time.sleep(_retry_sleep)
        except subprocess.TimeoutExpired:
            log(f"✗ {repo}: タイムアウト({_timeout_sec}s, attempt={attempt})")
            if attempt < 2:
                time.sleep(30)
        except Exception as e:
            log(f"✗ {repo}: エラー: {e} (attempt={attempt})")
            if attempt < 2:
                time.sleep(30)

    return False, ""


SLEEP_BETWEEN = 60    # 改善完了後の次サービスまでの待機秒数（1分）
SLEEP_COOLDOWN = 3600 # 全サービスクールダウン中の待機秒数（1時間）


def _compute_optimal_workers() -> int:
    """Claude使用状況ログからセッション/週次の指標を見て安全な並列数を返す。

    環境変数 FORCE_WORKERS が設定されている場合は動的スロットルを無視して固定値を返す。
    （週次リセット直前など、ユーザーが意図的に並列上限を上げたい場合の緊急用）
    """
    _force = os.environ.get("FORCE_WORKERS")
    if not _force:
        # 環境変数未設定時（LaunchAgent以外で起動した場合など）はN_WORKERSを使用
        _force = str(N_WORKERS)
    if _force:
        try:
            return max(1, min(int(_force), N_WORKERS))
        except ValueError:
            pass
    # 設計方針:
    # - セッション(5h)・週次ともに常時監視し、週間ペースが均等になるよう制御。
    # - 上限95%で安全マージン確保。
    # - 最低1並列は維持（0にはしない）。
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


# 各M番号の検証ルール: (種別, 正規表現, 表示ラベル)
# 種別: "pos"=存在確認(あればOK) / "neg"=除去確認(なければOK)
# ㊲ マーカー中身検証ルール: 存在チェック通過後に実体を確認（空実装排除）
# (正規表現, 最低ヒット数, 説明ラベル)
_CONTENT_VERIFY_RULES: dict = {
    "M14": (r'"@type"\s*:\s*"Question"', 2, "Question≥2件"),
    "M4":  (r'new\s+Chart\s*\(', 1, "new Chart()呼び出し"),
    "M1":  (r'href\s*=\s*["\']https?://', 1, "CTAにURLあり"),
}

_VERIFY_RULES: dict = {
    "M1":  ("pos", r'(?:px\.a8\.net|affiliate-card|data-platform=)', "CTA"),
    "M2":  ("pos", r'placeholder\s*=\s*["\'][^"\']{3,}', "placeholder"),
    "M3":  ("pos", r'localStorage\.(setItem|getItem)', "localStorage"),
    "M4":  ("pos", r'(?:chart\.js|new\s+Chart\s*\(|<canvas\b)', "Chart.js"),
    "M5":  ("pos", r'(?:data-platform=|affiliate.*result|result.*affiliate)', "動的CTA"),
    "M6":  ("pos", r'(?:goal|target|progress-bar|達成|トラッキング)', "目標機能"),
    "M7":  ("pos", r'(?:compare|pattern|シミュレーション|scenario)', "比較機能"),
    "M8":  ("pos", r'(?:title\s*=\s*["\'][^"\']{5,}|tooltip|aria-label\s*=)', "tooltip"),
    "M9":  ("pos", r'(?:twitter\.com/intent/tweet|line\.me/R/share)', "SNSシェア"),
    "M10": ("pos", r'(?:window\.print\s*\(\s*\)|onclick=["\'][^"\']*print)', "印刷"),
    "M11": ("pos", r'(?:<details\b|よくある質問|使い方|HowTo)', "FAQ/使い方"),
    "M12": ("pos", r'(?:関連コンテンツ|関連サービス|解説記事|コラム)', "関連コンテンツ"),
    "M13": ("pos", r'href=["\']https://appadaycreator\.com/', "内部リンク"),
    "M14": ("pos", r'application/ld\+json', "スキーマ"),
    "M15": ("pos", r'(?:property=["\']og:title["\']|name=["\']description["\'])', "OGP/meta"),
    "M16": ("pos", r'rel=["\']manifest["\']', "PWA"),
    "M17": ("pos", r'(?:affiliate|data-platform=)', "アフィリエイトCTA"),
    "M18": ("pos", r'name=["\']viewport["\']', "viewport"),
    "M19_log": ("neg", r'console\.log\s*\(', "console.log除去"),
    "M20": ("pos", r'<img\b[^>]*\balt\s*=\s*["\']', "img alt"),
}


def check_improvement_markers(pre_issues: list, html: str) -> tuple:
    """pre_issuesのM番号に対応するマーカーをHTMLで確認する。
    ㊸ Returns (summary_str, failed_issues_list, failure_hints_list)
      summary_str       : "🔍 ✅A/B ❌C" 形式の1行サマリ
      failed_issues_list: 未反映だったpre_issuesのオリジナル文字列リスト
      failure_hints_list: リトライprompt用の詳細失敗理由リスト
    """
    import re as _re
    # ⑰ HTMLコメントを除去（Claudeがコメント内にコードを書いた場合の false positive を防ぐ）
    html = _re.sub(r'<!--.*?-->', '', html, flags=_re.DOTALL)
    passed_labels, failed_labels, failed_issues, failure_hints = [], [], [], []
    for issue in pre_issues:
        m = _re.match(r'\[M(\d+)\]', issue)
        if not m:
            continue
        code = f"M{m.group(1)}"
        rule = _VERIFY_RULES.get(code)
        if not rule:
            continue
        rtype, pattern, label = rule
        found = bool(_re.search(pattern, html, _re.IGNORECASE))
        ok = found if rtype == "pos" else not found
        # ㊲ 存在チェック通過後に中身の実体を確認（空実装排除）
        if ok and code in _CONTENT_VERIFY_RULES:
            c_pat, c_min, c_label = _CONTENT_VERIFY_RULES[code]
            c_count = len(_re.findall(c_pat, html, _re.IGNORECASE))
            if c_count < c_min:
                ok = False
                label = f"{label}(中身不足:{c_label})"
        if ok:
            passed_labels.append(label)
        else:
            failed_labels.append(label)
            failed_issues.append(issue)
            # ㊸ リトライprompt用の詳細失敗理由を記録
            if "(中身不足:" in label:
                failure_hints.append(f"{code} 失敗理由: {label} → 実体のある実装が必要です")
            else:
                failure_hints.append(f"{code} 失敗: HTMLにパターンが見つかりません（{label}）")

    if not passed_labels and not failed_labels:
        return "", [], []
    parts = []
    if passed_labels:
        parts.append("✅" + "/".join(passed_labels))
    if failed_labels:
        parts.append("❌" + "/".join(failed_labels))
    return "🔍 " + " ".join(parts), failed_issues, failure_hints


def verify_deployed_url(repo: str, timeout: int = 8) -> tuple:  # ⑱ 20s→8s（情報確認のみなので短縮）
    """改善後のデプロイURLに実際にHTTPリクエストして正常表示を確認する。
    Returns (ok: bool, detail: str, html: str)
    """
    import urllib.request, urllib.error as _ue
    url = f"https://appadaycreator.com/{repo}/"
    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "AppADayCreator-AutoVerify/1.0",
                     "Accept": "text/html,application/xhtml+xml"},
        )
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            status = resp.status
            content = resp.read(131072).decode("utf-8", errors="ignore")
        if status != 200:
            return False, f"HTTP {status}", ""
        if len(content) < 3000:
            return False, f"ページ内容が少なすぎます ({len(content):,}文字)", ""
        if "<html" not in content.lower():
            return False, "HTMLコンテンツが検出されません", ""
        for marker in ["500 Internal Server Error", "404 Not Found",
                       "502 Bad Gateway", "503 Service Unavailable",
                       "Whoops, looks like something went wrong"]:
            if marker in content:
                return False, f"エラーページ検出: {marker}", ""
        return True, f"HTTP {status}, {len(content):,}文字", content
    except _ue.HTTPError as e:
        return False, f"HTTP {e.code}: {e.reason}", ""
    except _ue.URLError as e:
        return False, f"URLエラー: {e.reason}", ""
    except Exception as e:
        return False, f"例外: {e}", ""


def _worker(worker_id: int, stop_event, sheets_factory):
    """並列ワーカー: サービスをクレームして改善を繰り返す。"""
    log(f"[W{worker_id}] ワーカー起動")
    _no_work_notified_at: float = 0.0  # 「作業なし」通知の最終送信時刻（6h制限）
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
                if worker_id == 0 and time.time() - _no_work_notified_at > 21600:
                    send_telegram("⚠️ hourly_improve: 改善対象サービスが見つかりません。\n全サービスが非公開・ディレクトリ未作成の可能性があります。")
                    _no_work_notified_at = time.time()
                time.sleep(SLEEP_COOLDOWN)
                continue

            # クールダウン除外ログ（W0のみ表示して重複を防ぐ）
            if worker_id == 0:
                now = datetime.now()
                skipped = [s["repo"] for s in candidates if s.get("cd_expiry") and now < s["cd_expiry"]]
                if skipped:
                    log(f"クールダウン除外: {skipped}")

            svc = claim_service(candidates)
            if not svc:
                # ㉔ スマートスリープ: 最短cd_expiry まで待機（固定300s廃止・無駄待ちを削減）
                now = datetime.now()
                min_wait = SLEEP_COOLDOWN
                for _c in candidates:
                    if _c["repo"] in _in_progress:
                        continue
                    cd = _c.get("cd_expiry")
                    if cd is None:
                        min_wait = 0  # cd_expiry未設定 = 即利用可能なはずだが_in_progressで除外
                        break
                    wait = max(0, int((cd - now).total_seconds()))
                    if wait < min_wait:
                        min_wait = wait
                _smart_sleep = max(10, min(min_wait, SLEEP_COOLDOWN))
                log(f"[W{worker_id}] 全候補がクールダウン中（{_smart_sleep}秒後に再試行）")
                if worker_id == 0 and time.time() - _no_work_notified_at > 21600:
                    send_telegram("⚠️ hourly_improve: 全サービスがクールダウン中のため作業対象がありません。\n全サービスが最近改善済みの可能性があります。")
                    _no_work_notified_at = time.time()
                time.sleep(_smart_sleep)
                continue

            log(f"[W{worker_id}] --- {svc['no']} {svc['name']} ({svc['repo']}) ---")
            pre_issues = quick_scan(svc["repo"])
            # ㊺ 連続失敗施策を一時スキップ（スタック防止: 同一M番号で2回連続失敗→72h除外）
            import re as _re_mk
            _now_dt = datetime.now()
            _filtered, _skipped_keys = [], []
            for _pi in pre_issues:
                _mm = _re_mk.match(r'\[(M\d+)\]', _pi)
                if _mm:
                    _key = f"{svc['repo']}:{_mm.group(1)}"
                    _until = _m_skip_until.get(_key)
                    if _until and _now_dt < _until:
                        _skipped_keys.append(_mm.group(1))
                        continue
                _filtered.append(_pi)
            if _skipped_keys:
                log(f"[W{worker_id}]   ㊺ スキップ施策除外: {_skipped_keys}（連続失敗72h制限中）")
            pre_issues = _filtered
            log(f"[W{worker_id}]   事前スキャン: {pre_issues if pre_issues else '検出なし'}")

            # ビジュアルスキャン: スクショ→Claude Haikuで視覚的UI問題を検出
            # _visual_lock で直列化（Playwright競合防止）
            _v_issues: list[str] = []
            _v_shots: list[str] = []
            with _visual_lock:
                _v_issues, _v_shots = _visual_scan(svc["repo"])
            if _v_issues:
                log(f"[W{worker_id}]   ビジュアルスキャン: {_v_issues}")
            else:
                log(f"[W{worker_id}]   ビジュアルスキャン: 問題なし or スキップ")
            if _v_shots:
                log(f"[W{worker_id}]   スクショ保存: {_v_shots}")

            # A) トラフィックゼロは改善しても効果薄→24hクールダウン
            zero_traffic = svc["combined"] == 0
            if zero_traffic:
                log(f"[W{worker_id}]   トラフィックゼロ: クールダウン24h")

            # トラフィックゼロでもV問題あり → Claudeで修正（スクショ優先）
            # トラフィックゼロかつV問題なし → スキップ
            _bak_bytes: bytes | None = None
            _bak_size: int = 0
            if zero_traffic and not _v_issues:
                ok, stdout, elapsed = True, "[skip: トラフィックゼロ・V問題なし]", 0
            else:
                # ⑪ 改善前バックアップ（破損時自動ロールバック用）
                _bak_idx = WORKSPACE / svc["repo"] / "index.html"
                if _bak_idx.exists():
                    _bak_bytes = _bak_idx.read_bytes()
                    _bak_size = len(_bak_bytes)

                t_start = time.time()
                ok, stdout = run_improve(svc, pre_issues, v_issues=_v_issues, shot_paths=_v_shots)
                elapsed = int(time.time() - t_start)

                # ⑪ 破損検知: ファイルサイズが60%未満またはHTMLタグ消失 → 自動ロールバック
                if ok and _bak_bytes:
                    _cur_idx = WORKSPACE / svc["repo"] / "index.html"
                    _rollback_reason = ""
                    if not _cur_idx.exists():
                        _rollback_reason = "index.html消失"
                    else:
                        _new_size = _cur_idx.stat().st_size
                        _head_check = _cur_idx.read_bytes()[:500].decode("utf-8", errors="ignore").lower()
                        if _new_size < _bak_size * 0.6:
                            _rollback_reason = f"サイズ異常({_new_size:,}B < {_bak_size:,}B×60%)"
                        elif "<html" not in _head_check:
                            _rollback_reason = "HTMLタグ消失"
                    if _rollback_reason:
                        _cur_idx.write_bytes(_bak_bytes)
                        log(f"[W{worker_id}]   ❌ 破損検知({_rollback_reason}) → 自動ロールバック完了")
                        send_telegram(
                            f"⚠️ {svc['name']} HTML破損検知 → 自動ロールバック\n"
                            f"原因: {_rollback_reason}\n"
                            f"🔗 https://appadaycreator.com/{svc['repo']}/"
                        )
                        ok = False

            # 無変化リトライ: Claudeが変更なしで完了した場合は強制リトライ
            if ok and _bak_bytes:
                _cur_idx_check = WORKSPACE / svc["repo"] / "index.html"
                if _cur_idx_check.exists() and _cur_idx_check.read_bytes() == _bak_bytes:
                    log(f"[W{worker_id}]   ⚠️ index.html無変化 → 強制リトライ（変更必須指示）")
                    _no_change_hint = (
                        "⚠️【重要・必須】直前の実行でindex.htmlに一切変更が加えられませんでした。\n"
                        "今回は必ずindex.htmlをEditツールで実際に編集してください。\n"
                        "以下のどれか1つを今すぐ実装すること（選択後に即Edit実行）:\n"
                        "① index.htmlを Readで読み込み → FAQの末尾に具体的なQ&Aを1問追加してEdit\n"
                        "② index.htmlを Readで読み込み → CTAボタンのテキストを行動語に変更してEdit\n"
                        "③ index.htmlを Readで読み込み → h2見出しを1箇所具体的な表現に変更してEdit\n"
                        "分析・検討のみで終わることは絶対に禁止。Edit toolを必ず使うこと。"
                    )
                    t_start_retry = time.time()
                    ok, stdout = run_improve(svc, pre_issues, retry_hint=_no_change_hint, v_issues=_v_issues, shot_paths=_v_shots)
                    elapsed += int(time.time() - t_start_retry)
                    log(f"[W{worker_id}]   リトライ完了 ok={ok} elapsed+={int(time.time()-t_start_retry)}s")

            # 改善後確認: ローカルファイル基準でマーカー検査（㉟ HTTP検証廃止・CDN遅延で無意味）
            v_detail = ""
            v_markers = ""
            _v_final_failed: list = list(pre_issues)  # ㉟ delta算出用（マーカー結果で更新）
            if ok:
                idx_path = WORKSPACE / svc["repo"] / "index.html"

                # ① ローカルindex.htmlでマーカー確認（CDNキャッシュの影響を受けない即時・正確な検査）
                if idx_path.exists():
                    # ㉝ JSON-LD構文検証・修復（不正ブロックを除去してから検査）
                    _jld_ok, _jld_msg = _validate_and_fix_jsonld(idx_path, _bak_bytes)
                    if not _jld_ok:
                        log(f"[W{worker_id}]   ❌ ㉝ {_jld_msg}")
                        ok = False
                    else:
                        if _jld_msg:
                            log(f"[W{worker_id}]   ㉝ {_jld_msg}")

                if ok and idx_path.exists():
                    local_html = idx_path.read_text(encoding="utf-8", errors="ignore")
                    v_markers, v_failed, v_fail_hints = check_improvement_markers(pre_issues, local_html)
                    _v_final_failed = v_failed  # ㉟ 初回検査結果をdelta算出に使用
                    log(f"[W{worker_id}]   ローカル確認: {v_markers or '(マーカーなし)'}")
                    initial_v_markers = v_markers

                    # マーカー未反映: 1回だけリトライ（ローカルファイル再検査）
                    if v_failed:
                        log(f"[W{worker_id}]   ❌ 未反映マーカー: {v_failed} → リトライ実行")
                        # ㊸ 失敗理由を含む詳細なリトライhint（Claudeがより正確に修正できるよう誘導）
                        _hint_detail = ("\n詳細:\n" + "\n".join(f"  • {h}" for h in v_fail_hints)) if v_fail_hints else ""
                        retry_hint = "前回改善後チェックで未反映だった施策: " + ", ".join(v_failed) + _hint_detail
                        ok_r, stdout_r = run_improve(svc, v_failed, retry_hint=retry_hint)
                        if ok_r:
                            # ⑲ リトライ後の破損検知（⑪の補完: 初回バックアップから復元）
                            if _bak_bytes and idx_path.exists():
                                _r_size = idx_path.stat().st_size
                                _r_head = idx_path.read_bytes()[:500].decode("utf-8", errors="ignore").lower()
                                if _r_size < _bak_size * 0.6 or "<html" not in _r_head:
                                    idx_path.write_bytes(_bak_bytes)
                                    log(f"[W{worker_id}]   ❌ リトライ後破損検知 → 自動ロールバック完了")
                                    send_telegram(
                                        f"⚠️ {svc['name']} リトライ後HTML破損 → 自動ロールバック\n"
                                        f"🔗 https://appadaycreator.com/{svc['repo']}/"
                                    )
                                    ok = False
                        if ok_r and ok:
                            stdout = stdout_r
                            local_html2 = idx_path.read_text(encoding="utf-8", errors="ignore")
                            v_markers, v_failed2, _ = check_improvement_markers(v_failed, local_html2)
                            if v_failed2:
                                _v_final_failed = v_failed2  # ㉟ 残存失敗をdelta算出に反映
                                log(f"[W{worker_id}]   ❌ リトライ後も未反映: {v_failed2} → 失敗扱い")
                                v_markers = f"{initial_v_markers} → 🔄リトライ → {v_markers}"
                                ok = False
                            else:
                                _v_final_failed = []  # ㉟ 全通過
                                log(f"[W{worker_id}]   ✅ リトライ後全チェック通過")
                                v_markers = f"{initial_v_markers} → 🔄リトライ → ✅全チェック通過"
                        else:
                            log(f"[W{worker_id}]   ❌ リトライ実行失敗 → 失敗扱い")
                            ok = False
                elif ok:
                    log(f"[W{worker_id}]   ⚠️ index.html未存在: マーカー確認スキップ")

                # ㉞ AdSenseポリシー違反テンプレ検出（ok=Trueかつ実改善のみ）
                if ok and not zero_traffic and idx_path.exists():
                    _pol_ok, _pol_msg = _check_adsense_policy(idx_path, _bak_bytes)
                    if not _pol_ok:
                        log(f"[W{worker_id}]   ❌ ㉞ {_pol_msg}")
                        send_telegram(
                            f"⚠️ {svc['name']} AdSense違反テンプレ検出 → ロールバック\n"
                            f"{_pol_msg}\n"
                            f"🔗 https://appadaycreator.com/{svc['repo']}/"
                        )
                        ok = False

                # ② HTTP到達確認は廃止（㉟: ㉘auto-push済み→CDN遅延で常に旧版を返すため無意味）

            # クールダウン期限計算（R列に書き込む）
            # ㉚ 失敗時は連続失敗回数に応じた指数バックオフ / 成功時はカウントリセット
            if ok:
                _fail_counts.pop(svc["repo"], None)  # 成功時は連続失敗カウントリセット
                # ㊺ 成功時: 対象施策の連続失敗カウントをリセット
                for _pi in pre_issues:
                    _mm2 = _re_mk.match(r'\[(M\d+)\]', _pi)
                    if _mm2:
                        _k2 = f"{svc['repo']}:{_mm2.group(1)}"
                        _m_fail_counts.pop(_k2, None)
                        _m_skip_until.pop(_k2, None)
                cd_hours = COOLDOWN_FAIL_HOURS if zero_traffic else COOLDOWN_SUCCESS_HOURS
            else:
                _fail_counts[svc["repo"]] = _fail_counts.get(svc["repo"], 0) + 1
                cd_hours = _get_fail_cooldown(svc["repo"])  # 指数バックオフ
                log(f"[W{worker_id}]   ㉚ 連続失敗{_fail_counts[svc['repo']]}回: クールダウン{cd_hours:.0f}h")
                # ㊺ 失敗時: リトライ後も未反映だった施策のカウントを加算
                _final_failed_issues = _v_final_failed if not zero_traffic else []
                for _pi in _final_failed_issues:
                    _mm2 = _re_mk.match(r'\[(M\d+)\]', _pi)
                    if _mm2:
                        _k2 = f"{svc['repo']}:{_mm2.group(1)}"
                        _m_fail_counts[_k2] = _m_fail_counts.get(_k2, 0) + 1
                        if _m_fail_counts[_k2] >= 2:
                            _m_skip_until[_k2] = datetime.now() + timedelta(hours=72)
                            log(f"[W{worker_id}]   ㊺ {_k2} 連続2回失敗 → 72hスキップ設定")
                            _m_fail_counts[_k2] = 0  # リセットして次回から再カウント
            cooldown_expiry = datetime.now() + timedelta(hours=cd_hours)

            if ok:
                # ⑳/㉟ S列delta算出: quick_scan再実行廃止→マーカー検査結果（_v_final_failed）から算出
                _s_delta = 1  # デフォルト
                if pre_issues:
                    _passed_count = len(pre_issues) - len(_v_final_failed)
                    _s_delta = max(1, _passed_count)
                    log(f"[W{worker_id}]   改善delta: {len(pre_issues)}件中{_passed_count}件通過 (S+{_s_delta})")

                asset_value = calc_ultra_strict_asset(svc["name"], svc["clicks7d"], svc.get("affil", ""))
                # トラフィックゼロのスキップ: S列増分なし・cooldownのみ設定
                _is_traffic_skip = zero_traffic and stdout.startswith("[skip:")
                try:
                    if _is_traffic_skip:
                        update_spreadsheet(sheets, svc["row"], svc["s_val"], asset_value, cooldown_expiry, update_progress=False)
                        log(f"[W{worker_id}]   シート更新(skip-zero): CD={cooldown_expiry.strftime(CD_FMT)}")
                    else:
                        update_spreadsheet(sheets, svc["row"], svc["s_val"], asset_value, cooldown_expiry, s_delta=_s_delta)
                        log(f"[W{worker_id}]   シート更新: S={svc['s_val']+_s_delta}, T={datetime.now().strftime(CD_FMT)}, AM={asset_value:,}円, CD={cooldown_expiry.strftime(CD_FMT)}")
                except Exception as e:
                    log(f"[W{worker_id}]   シート更新失敗: {e}")
                if not _is_traffic_skip:
                    write_update_log(sheets, svc, pre_issues, stdout, elapsed, _s_delta)
                    notify_indexnow(svc["repo"])
                    # ㉘ 改善後に自動git commit+push（GitHubPages自動デプロイ）
                    _commit_ok = _git_commit_and_push(svc["repo"], _s_delta)
                    if _commit_ok:
                        _send_improve_notify(
                            svc, stdout, worker_id,
                            verify_detail=v_detail, marker_results=v_markers,
                            pre_issues=pre_issues, elapsed=elapsed,
                            s_delta=_s_delta, asset_value=asset_value,
                            v_issues=_v_issues,
                        )
                    else:
                        # commit失敗: 変更はあるが push できなかった旨を通知
                        log(f"[W{worker_id}]   commit失敗のため通知スキップ（マージ競合通知済み）")
            else:
                try:
                    update_spreadsheet(sheets, svc["row"], svc["s_val"], 0, cooldown_expiry, update_progress=False)
                    log(f"[W{worker_id}]   クールダウン記録: CD={cooldown_expiry.strftime(CD_FMT)}")
                except Exception as e:
                    log(f"[W{worker_id}]   クールダウン記録失敗: {e}")
                log(f"[W{worker_id}]   {svc['name']}: 改善対象なし")
                # ㊼ Claude失敗でもPythonパッチ変更があれば即コミット（成果損失防止）
                if _bak_bytes:
                    _py_check_idx = WORKSPACE / svc["repo"] / "index.html"
                    if _py_check_idx.exists():
                        _py_check_bytes = _py_check_idx.read_bytes()
                        if _py_check_bytes != _bak_bytes:
                            _py_head_str = _py_check_bytes[:500].decode("utf-8", errors="ignore").lower()
                            _py_chk_size = len(_py_check_bytes)
                            if ("<html" in _py_head_str and
                                    len(_bak_bytes) * 0.7 <= _py_chk_size <= len(_bak_bytes) * 4.0):
                                log(f"[W{worker_id}]   ㊼ Claudeは失敗だがPythonパッチ変更あり → コミット実行")
                                _git_commit_and_push(svc["repo"], 1)

            _in_progress.discard(svc["repo"])

            # ㊻ キャッシュ内のcd_expiryを即時更新（重複処理防止）
            # update_spreadsheet後もTTLキャッシュが古い値を保持するため
            # 同一サービスを複数ワーカーが連続して処理してしまう問題を修正
            if "cooldown_expiry" in locals():
                with _cooldown_lock:
                    if _TOP_SVC_CACHE["data"] is not None:
                        for _c in _TOP_SVC_CACHE["data"]:
                            if _c["repo"] == svc["repo"]:
                                _c["cd_expiry"] = cooldown_expiry
                                break

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
    """1時間ごと（毎:00）に稼働状況をTelegramへ送信するスレッド。"""
    from datetime import timezone, timedelta
    time.sleep(5)  # 起動直後の初期化を待つ

    while not stop_event.is_set():
        # 次の :00 まで待機
        now = datetime.now()
        minutes_to_add = 60 - (now.minute % 60)
        next_tick = (now + timedelta(minutes=minutes_to_add)).replace(second=0, microsecond=0)
        wait_sec = (next_tick - now).total_seconds()
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

            svc_names_str = "\n   ".join(completed_services) if completed_services else "なし"
            # 実効並列数を計算
            min_w = N_WORKERS
            for key, rate in [
                ("five_hour",        _SESSION_RATE_PER_W),
                ("seven_day",        _WEEKLY_ALL_RATE_PER_W),
                ("seven_day_sonnet", _WEEKLY_SNT_RATE_PER_W),
            ]:
                m = data.get(key)
                if not m or m.get("utilization") is None:
                    continue
                pct = float(m["utilization"])
                resets_str = m.get("resets_at") or ""
                if not resets_str:
                    continue
                resets_at = datetime.fromisoformat(resets_str.replace("Z", "+00:00"))
                hours_left = max((resets_at - now_utc).total_seconds() / 3600, 0.1)
                safe_rate = max(95.0 - pct, 0.0) / hours_left
                w = min(N_WORKERS, max(1, int(safe_rate / rate + 1e-9)))
                min_w = min(min_w, w)
            optimal = max(1, min(min_w, N_WORKERS))

            msg = (
                f"🤖 hourly_claude_improve 稼働状況 {now_jst} JST\n\n"
                f"📦 直近1時間処理件数: {completed_1h}件\n   {svc_names_str}\n\n"
                f"⚡ 実効並列数: {optimal}/{N_WORKERS}"
            )
            send_telegram(msg)
        except Exception as e:
            log(f"稼働状況通知エラー: {e}")


def main():
    import os, signal, threading

    global _cooldown_lock, _git_lock, _visual_lock
    _cooldown_lock = threading.Lock()
    _git_lock      = threading.Lock()  # ㉘ git操作の直列化ロック
    _visual_lock   = threading.Lock()  # Playwright並列実行防止

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

    my_pid = str(os.getpid())

    def cleanup(sig, frame):
        log("シグナル受信: デーモン終了")
        stop_event.set()
        # 自分のPIDのときだけロックを削除（別インスタンスのロックは触らない）
        try:
            if LOCK_FILE.read_text().strip() == my_pid:
                LOCK_FILE.unlink(missing_ok=True)
        except Exception:
            pass
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
        setup_log_headers(sheets_init)

        # 稼働状況通知はclaude-usage-monitorに統合済み → スレッド無効
        # status_thread = threading.Thread(target=_send_hourly_status, args=(stop_event,), daemon=True)
        # status_thread.start()

        threads = [
            threading.Thread(target=_worker, args=(i, stop_event, sheets_factory), daemon=True)
            for i in range(N_WORKERS)
        ]
        for t in threads:
            t.start()
        for t in threads:
            t.join()
    finally:
        try:
            if LOCK_FILE.read_text().strip() == my_pid:
                LOCK_FILE.unlink(missing_ok=True)
        except Exception:
            pass


if __name__ == "__main__":
    main()
