#!/usr/bin/env python3
"""
GA4 カスタムディメンション登録スクリプト

b2b_cta_click イベントのパラメータをGA4に登録し、
レポートで「(not set)」にならないようにする。

初回:  python3 register_ga4_custom_dimensions.py --auth
通常:  python3 register_ga4_custom_dimensions.py
"""

import argparse
import json
from pathlib import Path

from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

SCRIPT_DIR = Path(__file__).parent
TOKEN_FILE = SCRIPT_DIR / "token_ga4_edit.json"
CREDENTIALS_FILE = SCRIPT_DIR / "credentials.json"

# analytics.edit スコープが必要（readonly とは別トークン）
SCOPES = ["https://www.googleapis.com/auth/analytics.edit"]

PROPERTY_ID = "491837707"

# 登録するカスタムディメンション（b2b_cta_click のパラメータ）
CUSTOM_DIMENSIONS = [
    {
        "parameterName": "cta_position",
        "displayName": "CTA Position",
        "scope": "EVENT",
        "description": "b2b_cta_click: hero_primary / hero_secondary / lp_bottom / footer 等",
    },
    {
        "parameterName": "tool_category",
        "displayName": "Tool Category",
        "scope": "EVENT",
        "description": "b2b_cta_click: ai_automation / etc",
    },
    {
        "parameterName": "source_page",
        "displayName": "Source Page",
        "scope": "EVENT",
        "description": "b2b_cta_click: クリック元のpathname",
    },
    {
        "parameterName": "destination",
        "displayName": "Destination",
        "scope": "EVENT",
        "description": "b2b_cta_click: クリック先URL",
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


def list_existing(service) -> set:
    """既登録のparameterNameセットを返す"""
    existing = set()
    try:
        resp = service.properties().customDimensions().list(
            parent=f"properties/{PROPERTY_ID}"
        ).execute()
        for dim in resp.get("customDimensions", []):
            existing.add(dim.get("parameterName"))
    except HttpError as e:
        print(f"リスト取得エラー: {e}")
    return existing


def register_dimensions(service, existing: set):
    results = {"registered": [], "skipped": [], "error": []}
    for dim in CUSTOM_DIMENSIONS:
        name = dim["parameterName"]
        if name in existing:
            print(f"  SKIP（既登録）: {name}")
            results["skipped"].append(name)
            continue
        try:
            service.properties().customDimensions().create(
                parent=f"properties/{PROPERTY_ID}",
                body=dim,
            ).execute()
            print(f"  ✓ 登録成功: {name} ({dim['displayName']})")
            results["registered"].append(name)
        except HttpError as e:
            print(f"  ✗ 登録エラー: {name} → {e}")
            results["error"].append(name)
    return results


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--auth", action="store_true", help="ブラウザ認証を強制実行")
    args = parser.parse_args()

    print("GA4 カスタムディメンション登録")
    print(f"プロパティ: {PROPERTY_ID}")
    print()

    creds = get_credentials(force_auth=args.auth)
    service = build("analyticsadmin", "v1beta", credentials=creds)

    print("既登録ディメンション確認中...")
    existing = list_existing(service)
    print(f"  既登録数: {len(existing)}件")
    print()

    print("登録処理:")
    results = register_dimensions(service, existing)

    print()
    print("=== 完了 ===")
    print(f"  新規登録: {len(results['registered'])}件 {results['registered']}")
    print(f"  スキップ: {len(results['skipped'])}件 {results['skipped']}")
    print(f"  エラー  : {len(results['error'])}件 {results['error']}")

    if results["registered"]:
        print()
        print("注意: GA4の反映には数時間〜24時間かかります。")
        print("      登録後はGA4管理画面 → カスタム定義 で確認してください。")


if __name__ == "__main__":
    main()
