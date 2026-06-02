"""
テーブルの<th>/<td>スタイル不統一を修正するスクリプト

対象パターン: 同一<tr>内で最初の<th>のみstyle付き、他はなし
修正内容:
  - 全<th>に同じpadding/borderスタイルを適用
  - 全<td>（2列目以降）に同じpadding/borderスタイルを適用
  - tableを overflow-x:auto div でラップ（未ラップの場合）
"""

import re
import sys
from pathlib import Path

WORKSPACE = Path(__file__).parent.parent

TARGET_FILES = [
    "bmi-body-tracker/index.html",
    "engineer-career-roadmap/index.html",
    "fridge-tracker/index.html",
    "morning-routine-planner/index.html",
    "personal-color-finder/index.html",
    "reskilling-advisor/index.html",
    "stock-portfolio-tracker/index.html",
]


def fix_table_row(m: re.Match) -> str:
    """<tr>内の<th>/<td>スタイルを統一する"""
    row_html = m.group(0)

    # <th style="...">第1セル → そのスタイルを抽出
    th_style_match = re.search(r'<th\s+style="([^"]+)">', row_html)
    if th_style_match:
        th_style = th_style_match.group(1)
        # 全<th>にスタイルを適用（既にstyleがあるものはスキップ、ないものに付与）
        row_html = re.sub(r'<th>(?=[^<])', f'<th style="{th_style}">', row_html)

    # <td style="...">第1セル → そのスタイルを抽出
    td_style_match = re.search(r'<td\s+style="([^"]+)">', row_html)
    if td_style_match:
        td_style = td_style_match.group(1)
        row_html = re.sub(r'<td>(?=[^<])', f'<td style="{td_style}">', row_html)

    return row_html


def wrap_table_overflow(html: str) -> str:
    """overflowラップのない<table>をdivで囲む"""
    # 既にoverflow-x:autoで囲まれているものはスキップ
    def maybe_wrap(m: re.Match) -> str:
        table_html = m.group(0)
        # 直前がoverflow-x:auto div かどうかチェック（簡易）
        start = m.start()
        prefix = html[max(0, start-80):start]
        if "overflow-x" in prefix or "overflow-x" in table_html[:50]:
            return table_html
        return f'<div style="overflow-x:auto">{table_html}</div>'

    return re.sub(r'<table[^>]*>.*?</table>', maybe_wrap, html, flags=re.DOTALL)


def fix_file(path: Path) -> bool:
    original = path.read_text(encoding="utf-8")
    html = original

    # 行内の<th>/<td>スタイル統一
    # <tr>タグ単位でパターンマッチして修正
    html = re.sub(
        r'<tr[^>]*>(?:\s*<t[hd][^>]*>[^<]*</t[hd]>\s*)+</tr>',
        fix_table_row,
        html,
        flags=re.DOTALL,
    )

    # overflow-x:auto ラップ（インラインstyleテーブルのみ対象）
    # style属性を持つtableのみラップ（class-based tableは除外）
    def wrap_styled_table(m: re.Match) -> str:
        table_html = m.group(0)
        start = m.start()
        prefix = html[max(0, start-100):start]
        if "overflow-x" in prefix:
            return table_html
        return f'<div style="overflow-x:auto">{table_html}</div>'

    html = re.sub(
        r'<table\s+style=[^>]+>.*?</table>',
        wrap_styled_table,
        html,
        flags=re.DOTALL,
    )

    if html == original:
        return False

    path.write_text(html, encoding="utf-8")
    return True


def main():
    fixed = []
    skipped = []
    for rel in TARGET_FILES:
        path = WORKSPACE / rel
        if not path.exists():
            print(f"  SKIP (not found): {rel}")
            continue
        if fix_file(path):
            fixed.append(rel)
            print(f"  FIXED: {rel}")
        else:
            skipped.append(rel)
            print(f"  NO CHANGE: {rel}")

    print(f"\n完了: {len(fixed)}件修正 / {len(skipped)}件変更なし")
    return fixed


if __name__ == "__main__":
    main()
