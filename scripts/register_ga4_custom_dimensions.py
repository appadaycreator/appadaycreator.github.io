#!/usr/bin/env python3
"""
GA4 カスタムディメンション登録スクリプト

b2b_cta_click イベントのパラメータをGA4に登録し、
レポートで「(not set)」にならないようにする。

初回:  python3 register_ga4_custom_dimensions.py --auth
通常:  python3 register_ga4_custom_dimensions.py
"""

import argparse
from pathlib import Path

from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from google.analytics import admin

SCRIPT_DIR = Path(__file__).parent
TOKEN_FILE = SCRIPT_DIR / "token_ga4_edit.json"
CREDENTIALS_FILE = SCRIPT_DIR / "credentials.json"

SCOPES = ["https://www.googleapis.com/auth/analytics.edit"]

PROPERTY_ID = "491837707"

CUSTOM_DIMENSIONS = [
    {
        "parameter_name": "cta_position",
        "display_name": "CTA Position",
        "scope": "EVENT",
        "description": "b2b_cta_click: hero_primary / hero_secondary / lp_bottom / footer",
    },
    {
        "parameter_name": "tool_category",
        "display_name": "Tool Category",
        "scope": "EVENT",
        "description": "b2b_cta_click: ai_automation など",
    },
    {
        "parameter_name": "source_page",
        "display_name": "Source Page",
        "scope": "EVENT",
        "description": "b2b_cta_click: クリック元 pathname",
    },
    {
        "parameter_name": "destination",
        "display_name": "Destination",
        "scope": "EVENT",
        "description": "b2b_cta_click: クリック先 URL",
    },
]


def get_credentials(force_auth: bool = False) -> Credentials:
    creds = None
    if not force_auth and TOKEN_FILE.exists():
        creds = Credentials.from_authorized_user_file(str(TOKEN_FILE), SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(str(CREDENTIALS_FILE), SCOPES)
            creds = flow.run_local_server(port=0)
        TOKEN_FILE.write_text(creds.to_json())
        print(f"トークン保存: {TOKEN_FILE}")
    return creds


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--auth", action="store_true", help="ブラウザ認証を強制実行")
    args = parser.parse_args()

    print(f"GA4 カスタムディメンション登録 (プロパティ: {PROPERTY_ID})")

    creds = get_credentials(force_auth=args.auth)

    client = admin.AnalyticsAdminServiceClient(credentials=creds)
    parent = f"properties/{PROPERTY_ID}"

    # 既登録を確認
    existing = {
        d.parameter_name
        for d in client.list_custom_dimensions(parent=parent)
    }
    print(f"既登録: {len(existing)}件 {sorted(existing)}\n")

    results = {"registered": [], "skipped": [], "error": []}
    for dim in CUSTOM_DIMENSIONS:
        name = dim["parameter_name"]
        if name in existing:
            print(f"  SKIP（既登録）: {name}")
            results["skipped"].append(name)
            continue
        try:
            client.create_custom_dimension(parent=parent, custom_dimension=admin.CustomDimension(**dim))
            print(f"  ✓ 登録成功: {name}")
            results["registered"].append(name)
        except Exception as e:
            print(f"  ✗ エラー: {name} → {e}")
            results["error"].append(name)

    print(f"\n=== 完了 ===")
    print(f"  新規登録: {len(results['registered'])}件 {results['registered']}")
    print(f"  スキップ: {len(results['skipped'])}件 {results['skipped']}")
    print(f"  エラー  : {len(results['error'])}件 {results['error']}")

    if results["registered"]:
        print("\n注意: GA4への反映は数時間〜24時間かかります。")


if __name__ == "__main__":
    main()
