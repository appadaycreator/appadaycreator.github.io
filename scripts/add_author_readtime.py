#!/usr/bin/env python3
"""
既存ブログ記事に著者プロフィール（④）と読了時間バッジ（⑦）を追加
"""
import os
import re

BLOG_DIR = "/Users/masayukitokunaga/workspace/30service/blog"

AUTHOR_BLOCK = """
        <div style="background:#f8f9ff;border:1px solid #e0e7ff;border-radius:.75rem;padding:1.25rem 1.5rem;margin:2rem 0;display:flex;align-items:flex-start;gap:1rem">
          <div style="background:#4f46e5;color:#fff;border-radius:50%;width:48px;height:48px;display:flex;align-items:center;justify-content:center;font-size:1.25rem;flex-shrink:0">📝</div>
          <div>
            <p style="margin:0 0 .25rem;font-weight:700;color:#111827;font-size:.95rem">AppADayCreator 編集部</p>
            <p style="margin:0;color:#4b5563;font-size:.85rem">マネー・投資・キャリア・育児に関する実用的な情報を発信するメディアです。読者の日常の意思決定に役立つ情報を、分かりやすく正確にお届けすることを心がけています。</p>
          </div>
        </div>"""

READING_TIMES = {
    "fire-calculation-guide": "約8分",
    "kids-activity-guide": "約7分",
    "housing-loan-guide": "約9分",
    "sidejob-tax-guide": "約8分",
    "nisa-ideco-guide": "約9分",
    "insurance-guide": "約7分",
    "furusato-tax-guide": "約8分",
    "household-budget-guide": "約7分",
    "career-change-guide": "約8分",
    "retirement-fund-guide": "約8分",
}

def update_article(filepath, slug):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    changed = False

    # ④ 著者プロフィールを </article> 直前に追加（まだない場合）
    if 'AppADayCreator 編集部' not in content:
        content = content.replace('    </article>', AUTHOR_BLOCK + '\n    </article>', 1)
        changed = True

    # ⑦ 読了時間を meta 行（カテゴリ・日付行）に追加
    reading_time = READING_TIMES.get(slug)
    if reading_time and f'⏱ {reading_time}' not in content:
        # パターン: 2026年X月X日</p> の直前に読了時間を追加
        content = re.sub(
            r'(2026年\d+月\d+日)(</p>)',
            r'\1 &nbsp;|&nbsp; ⏱ ' + reading_time + r'\2',
            content,
            count=1
        )
        changed = True

    if changed:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✅ 更新: {slug}")
    else:
        print(f"  SKIP (already updated): {slug}")

    return changed

def main():
    updated = 0
    for slug, reading_time in READING_TIMES.items():
        filepath = os.path.join(BLOG_DIR, slug, 'index.html')
        if os.path.exists(filepath):
            if update_article(filepath, slug):
                updated += 1
        else:
            print(f"  NOT FOUND: {slug}")
    print(f"\n合計 {updated} 件更新しました")

if __name__ == "__main__":
    main()
