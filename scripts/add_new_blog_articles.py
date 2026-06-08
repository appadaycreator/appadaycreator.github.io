#!/usr/bin/env python3
"""
ブログ記事管理シートに新規5記事を追加
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from update_metrics import SPREADSHEET_ID, get_credentials
from googleapiclient.discovery import build

BLOG_SHEET = "ブログ記事管理"

NEW_ARTICLES = [
    [11, "stock-investment-beginner", "株式投資入門：初心者が最初に知るべき基礎知識と始め方", "📈 投資", "2026-06-08", "2026-06-08", "https://appadaycreator.com/blog/stock-investment-beginner/", "", "", "", "", "", ""],
    [12, "credit-card-guide",         "クレジットカード活用術：ポイント還元率の比較と賢い使い方",  "💰 マネー",   "2026-06-08", "2026-06-08", "https://appadaycreator.com/blog/credit-card-guide/",          "", "", "", "", "", ""],
    [13, "kakuteishinkoku-guide",      "確定申告完全ガイド：会社員・副業・フリーランスの申告方法と節税", "🏯 税金", "2026-06-08", "2026-06-08", "https://appadaycreator.com/blog/kakuteishinkoku-guide/",       "", "", "", "", "", ""],
    [14, "childcare-cost-guide",       "子育て費用の全体像：出産から大学卒業まで総額シミュレーション", "👶 育児",  "2026-06-08", "2026-06-08", "https://appadaycreator.com/blog/childcare-cost-guide/",        "", "", "", "", "", ""],
    [15, "asset-management-beginner",  "資産運用入門：初心者が最初にやるべき3ステップ",             "📈 投資",    "2026-06-08", "2026-06-08", "https://appadaycreator.com/blog/asset-management-beginner/",   "", "", "", "", "", ""],
]

def main():
    creds = get_credentials()
    service = build("sheets", "v4", credentials=creds)
    sheets = service.spreadsheets()

    rows = [list(map(str, r)) for r in NEW_ARTICLES]

    # No.11〜15 → 行インデックス12〜16（ヘッダー行=1, No.1=2, ..., No.10=11, No.11=12）
    result = sheets.values().append(
        spreadsheetId=SPREADSHEET_ID,
        range=f"{BLOG_SHEET}!A12",
        valueInputOption="USER_ENTERED",
        insertDataOption="INSERT_ROWS",
        body={"values": rows}
    ).execute()

    updated_range = result.get("updates", {}).get("updatedRange", "")
    print(f"✅ {len(NEW_ARTICLES)}件追加しました → {updated_range}")
    print(f"   URL: https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}")

if __name__ == "__main__":
    main()
