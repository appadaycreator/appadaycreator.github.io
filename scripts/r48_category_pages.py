#!/usr/bin/env python3
"""R48-③ カテゴリハブページ4件新規作成"""
import os, glob, re

EXCLUDES = {'blog','lp','tb-corp','dn-corp','cb-office','tk-hp','medibook','takegawa-yoyaku','sc-seclab','scripts','assets'}

def get_service_meta(dir_name):
    path = f'{dir_name}/index.html'
    if not os.path.exists(path):
        return None
    try:
        with open(path, encoding='utf-8') as f:
            content = f.read()
        title_m = re.search(r'<title>([^<|]+)', content)
        desc_m = re.search(r'<meta name="description" content="([^"]{10,120})', content)
        title = title_m.group(1).strip() if title_m else dir_name
        desc = desc_m.group(1).strip() if desc_m else ''
        return {'dir': dir_name, 'title': title, 'desc': desc}
    except:
        return None

# Category definitions - same logic as before but more specific
CATEGORY_KEYWORDS = {
    'finance': ['finance','tax','calculator','loan','insurance','nisa','ideco','debt','salary','investment','stock','money','cost','budget','price','income','credit','point','asset','subsidy','pension','furusato','housing','lease','budget','allowance','subscription','freelance-tax','side-business','affiliate','savings'],
    'health': ['health','medical','pain','muscle','allergy','baby','child','diet','sleep','calorie','vitamin','skin','uv','eye','dental','hospital','cold','pregnancy','stretch','fitness','period','posture'],
    'career': ['career','job','work','skill','resume','interview','salary-neg','reskill','shindanshi','side-job','side-business','freelance','okr','engineer','mba','portfolio'],
    'game': ['game','quest','rpg','puzzle','adventure','typing','sudoku','nanpure','block','maze','trivia','quiz','codebreaker','memory','cellular'],
}

categories = {k: [] for k in CATEGORY_KEYWORDS}
for d in sorted(glob.glob('*/index.html')):
    dir_name = d.split('/')[0]
    if dir_name in EXCLUDES:
        continue
    meta = get_service_meta(dir_name)
    if not meta:
        continue
    for cat, keywords in CATEGORY_KEYWORDS.items():
        if any(k in dir_name for k in keywords):
            categories[cat].append(meta)
            break

for cat, items in categories.items():
    print(f'{cat}: {len(items)} services')

CAT_CONFIG = {
    'finance': {
        'title': '家計・税金・投資ツール一覧',
        'subtitle': '節税・資産形成・家計管理に役立つ無料ツール',
        'desc': '所得税計算・NISA/iDeCoシミュレーション・住宅ローン・保険診断など、お金に関する無料ツールを集めました。',
        'color': '#059669',
        'bg': '#ecfdf5',
        'border': '#a7f3d0',
        'icon': '💰',
        'expert_text': '''<h3 style="font-size:1.05rem;font-weight:700;color:#065f46;margin:1.25rem 0 .6rem">お金のツールを選ぶポイント</h3>
<p style="font-size:.9rem;line-height:1.8;color:#374151;margin:0 0 1rem">家計・税金・投資のツールは目的に合わせて使い分けることが重要です。まず<strong>日常的な家計管理</strong>には収支記録・予算管理ツール、<strong>節税対策</strong>にはiDeCo・ふるさと納税・各種控除の計算ツールが役立ちます。<strong>長期資産形成</strong>には複利計算・NISA/iDeCoシミュレーター、<strong>大きな買い物</strong>には住宅ローン・自動車ローンの返済試算ツールが参考になります。税金計算ツールを使う際は最新の税制（毎年改正）に対応しているか確認し、結果はあくまで概算として参考にし、正確な数字は税理士・税務署に確認することをお勧めします。</p>
<p style="font-size:.9rem;line-height:1.8;color:#374151;margin:0">2024年から<strong>新しいNISA制度</strong>（年間投資上限360万円・無期限非課税）が開始され、より多くの方の長期投資が加速しています。また2024年定額減税（所得税3万円・住民税1万円）も実施され、家計への影響把握に計算ツールの需要が高まっています。</p>''',
        'authority': '<p style="font-size:.82rem;color:#6b7280;margin:1rem 0 0">情報参照: <a href="https://www.nta.go.jp/" target="_blank" rel="noopener" style="color:#059669">国税庁</a> | <a href="https://www.fsa.go.jp/" target="_blank" rel="noopener" style="color:#059669">金融庁</a> | <a href="https://www.mhlw.go.jp/" target="_blank" rel="noopener" style="color:#059669">厚生労働省</a></p>',
    },
    'health': {
        'title': '健康・医療・育児チェックツール一覧',
        'subtitle': '健康管理・症状確認・育児サポートの無料ツール',
        'desc': '風邪チェック・カロリー計算・育児マイルストーン・アレルギー確認など、健康・育児に役立つ無料ツールを集めました。',
        'color': '#0891b2',
        'bg': '#ecfeff',
        'border': '#a5f3fc',
        'icon': '🏥',
        'expert_text': '''<h3 style="font-size:1.05rem;font-weight:700;color:#164e63;margin:1.25rem 0 .6rem">健康ツールの正しい使い方</h3>
<p style="font-size:.9rem;line-height:1.8;color:#374151;margin:0 0 1rem">健康・医療に関するオンラインツールは、<strong>生活習慣の改善・早期気づき・情報収集</strong>を目的として活用するものであり、医師による診断・治療の代替にはなりません。症状チェックツールで気になる結果が出た場合は、必ず医療機関を受診してください。カロリー計算や体重管理ツールは目安として活用し、急激な制限食はかえって健康を損なうリスクがあります。<strong>育児関連ツール</strong>は一般的な発育の目安を提供しますが、成長には個人差があります。かかりつけ小児科医の指導を優先してください。</p>
<p style="font-size:.9rem;line-height:1.8;color:#374151;margin:0">2025年度の健康診断推奨項目や、乳幼児健診の標準スケジュールなど最新ガイドラインに基づく情報は、各省庁の公式サイトでご確認ください。</p>''',
        'authority': '<p style="font-size:.82rem;color:#6b7280;margin:1rem 0 0">情報参照: <a href="https://www.mhlw.go.jp/" target="_blank" rel="noopener" style="color:#0891b2">厚生労働省</a> | <a href="https://www.cfa.go.jp/" target="_blank" rel="noopener" style="color:#0891b2">こども家庭庁</a></p>',
    },
    'career': {
        'title': 'キャリア・副業・スキルアップツール一覧',
        'subtitle': '転職・副業・資格取得・年収アップを支援する無料ツール',
        'desc': '年収交渉アドバイス・副業適性診断・スキルアップロードマップ・面接対策など、キャリア形成に役立つ無料ツールを集めました。',
        'color': '#7c3aed',
        'bg': '#f5f3ff',
        'border': '#ddd6fe',
        'icon': '💼',
        'expert_text': '''<h3 style="font-size:1.05rem;font-weight:700;color:#4c1d95;margin:1.25rem 0 .6rem">キャリアツールの活用ガイド</h3>
<p style="font-size:.9rem;line-height:1.8;color:#374151;margin:0 0 1rem">キャリア関連ツールは<strong>自己分析・市場調査・スキルギャップ把握</strong>を効率化します。転職活動では求人票の年収は目安であり、実際のオファーはスキル・経験・交渉力によって変動します。年収交渉アドバイザーや業界別年収比較ツールで<strong>市場相場</strong>を事前に把握することが交渉の第一歩です。副業を検討している方には、副業適性診断や副業税金計算ツールで確定申告の必要性（年間20万円超の副業所得）を事前に確認することをお勧めします。<strong>リスキリング</strong>（職業訓練給付・リスキリング支援助成）を活用する場合は厚生労働省の制度を確認してください。</p>
<p style="font-size:.9rem;line-height:1.8;color:#374151;margin:0">2024〜2025年はAIエンジニア・データサイエンティスト・DX推進人材の求人が特に増加しています。スキルアップロードマップで優先的に習得すべきスキルを把握することが重要です。</p>''',
        'authority': '<p style="font-size:.82rem;color:#6b7280;margin:1rem 0 0">情報参照: <a href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/index.html" target="_blank" rel="noopener" style="color:#7c3aed">厚生労働省 雇用・労働</a> | <a href="https://www.cas.go.jp/jp/seisaku/reskilling/index.html" target="_blank" rel="noopener" style="color:#7c3aed">内閣官房 リスキリング</a></p>',
    },
    'game': {
        'title': '学習ゲーム・パズル・脳トレツール一覧',
        'subtitle': 'タイピング・数独・RPG形式で楽しく学べる無料ゲーム',
        'desc': 'タイピング練習・数独・化学クイズ・RPGなど、楽しみながら学べる脳トレ・学習ゲームを集めました。完全無料・登録不要。',
        'color': '#d97706',
        'bg': '#fffbeb',
        'border': '#fde68a',
        'icon': '🎮',
        'expert_text': '''<h3 style="font-size:1.05rem;font-weight:700;color:#92400e;margin:1.25rem 0 .6rem">学習ゲームの効果と活用法</h3>
<p style="font-size:.9rem;line-height:1.8;color:#374151;margin:0 0 1rem">ゲーム形式の学習（ゲーミフィケーション）は、<strong>達成感・継続性・動機づけ</strong>の面で通常の暗記学習より効果的とされています。特にタイピング練習は1日10分の継続が最も効率的で、正確さを重視してから速度を上げるのがコツです。数独・論理パズルは前頭前野を活性化し、集中力と論理的思考力の維持に役立つと言われています。RPG形式の学習ゲームは長編ストーリーへの没入感が学習モチベーションを高め、化学・英語・プログラミングなどの専門的な内容も継続しやすくなります。<strong>短時間の集中プレイ</strong>（1セッション15〜20分）が記憶定着に効果的です。</p>
<p style="font-size:.9rem;line-height:1.8;color:#374151;margin:0">スマートフォンでもPCでも同じURLでプレイできるレスポンシブ対応のゲームばかりです。通勤・休憩時間など隙間時間の活用にもお役立てください。</p>''',
        'authority': '',
    },
}

CONSENT_V2 = '<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag(\'consent\',\'default\',{\'analytics_storage\':\'denied\',\'ad_storage\':\'denied\',\'ad_user_data\':\'denied\',\'ad_personalization\':\'denied\',\'wait_for_update\':500});(function(){try{var k=\'cookie-consent-v2\',o=\'cookie-consent\';var c=localStorage.getItem(k);if(!c&&localStorage.getItem(o)===\'1\')c=\'granted\';if(c){var s=c===\'granted\'?\'granted\':\'denied\';gtag(\'consent\',\'update\',{\'analytics_storage\':s,\'ad_storage\':s,\'ad_user_data\':s,\'ad_personalization\':s});}}catch(e){}})();</script>'

def build_service_cards(items):
    cards = []
    for item in items:
        title = item['title'][:40] + ('…' if len(item['title']) > 40 else '')
        desc = item['desc'][:70] + ('…' if len(item['desc']) > 70 else '') if item['desc'] else ''
        desc_html = f'<span class="svc-desc">{desc}</span>' if desc else ''
        cards.append(f'<a href="https://appadaycreator.com/{item["dir"]}/" class="svc-card"><span class="svc-title">{title}</span>{desc_html}</a>')
    return '\n'.join(cards)

def generate_page(cat, config, items):
    color = config['color']
    bg = config['bg']
    border = config['border']
    cards_html = build_service_cards(items)
    count = len(items)

    return f'''<!DOCTYPE html>
<html lang="ja">
<head>
<!-- Consent Mode v2 -->
{CONSENT_V2}
<!-- End Consent Mode v2 -->
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){{w[l]=w[l]||[];w[l].push({{"gtm.start":new Date().getTime(),event:"gtm.js"}});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!="dataLayer"?"&l="+l:"";j.async=true;j.src="https://www.googletagmanager.com/gtm.js?id="+i+dl;f.parentNode.insertBefore(j,f);}})(window,document,"script","dataLayer","GTM-TXQGZRF9");</script>
<!-- End Google Tag Manager -->
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{config["title"]} | AppADayCreator</title>
<meta name="description" content="{config["desc"]}">
<meta name="author" content="AppADayCreator">
<link rel="canonical" href="https://appadaycreator.com/{cat}/">
<meta property="og:title" content="{config["title"]} | AppADayCreator">
<meta property="og:description" content="{config["desc"]}">
<meta property="og:type" content="website">
<meta property="og:locale" content="ja_JP">
<meta property="og:image" content="https://appadaycreator.com/assets/ogp-default.png">
<meta property="og:site_name" content="AppADayCreator">
<meta name="twitter:card" content="summary">
<script type="application/ld+json">{{"@context":"https://schema.org","@type":"CollectionPage","name":"{config["title"]}","description":"{config["desc"]}","url":"https://appadaycreator.com/{cat}/","publisher":{{"@type":"Organization","name":"AppADayCreator","url":"https://appadaycreator.com"}}}}</script>
<style>
*,*::before,*::after{{box-sizing:border-box;margin:0;padding:0}}
body{{font-family:'Noto Sans JP',sans-serif;background:#f9fafb;color:#111827;line-height:1.7}}
a{{color:{color};text-decoration:none}}
a:hover{{text-decoration:underline}}
.wrap{{max-width:960px;margin:0 auto;padding:0 16px}}
header{{background:{color};color:#fff;padding:.85rem 0}}
header .wrap{{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.4rem}}
header .site{{font-size:.82rem;opacity:.9}}
.hero{{background:linear-gradient(135deg,{color} 0%,{color}cc 100%);color:#fff;padding:2.25rem 0 2.75rem;text-align:center}}
.hero h1{{font-size:1.6rem;font-weight:900;margin-bottom:.6rem}}
.hero p{{font-size:.95rem;opacity:.92;max-width:580px;margin:0 auto}}
.badge{{display:inline-block;background:rgba(255,255,255,.2);padding:3px 12px;border-radius:20px;font-size:.78rem;font-weight:700;margin-bottom:.75rem}}
.section{{padding:2rem 0}}
h2{{font-size:1.2rem;font-weight:800;color:{color};margin-bottom:1.25rem;padding-bottom:.5rem;border-bottom:2px solid {border}}}
.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:.75rem;margin-bottom:2rem}}
.svc-card{{background:#fff;border:1px solid {border};border-radius:10px;padding:.9rem 1rem;display:block;transition:box-shadow .2s,border-color .2s}}
.svc-card:hover{{box-shadow:0 4px 12px rgba(0,0,0,.08);border-color:{color};text-decoration:none}}
.svc-title{{display:block;font-size:.9rem;font-weight:700;color:#1f2937}}
.svc-desc{{display:block;font-size:.78rem;color:#6b7280;margin-top:.3rem;line-height:1.5}}
.info-box{{background:{bg};border:1px solid {border};border-radius:12px;padding:1.5rem 1.75rem;margin:2rem 0}}
.info-box h3{{font-size:1rem;font-weight:700;margin-bottom:.75rem}}
footer{{background:#1f2937;color:#9ca3af;padding:1.5rem 0;margin-top:3rem;font-size:.83rem;text-align:center}}
footer a{{color:#9ca3af}}
@media(max-width:560px){{.hero h1{{font-size:1.3rem}}.grid{{grid-template-columns:1fr}}}}
</style>
</head>
<body>
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TXQGZRF9" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<header>
<div class="wrap">
  <a href="https://appadaycreator.com/" class="site">🏠 AppADayCreator</a>
  <a href="https://appadaycreator.com/" style="color:#fff;font-size:.82rem;opacity:.8">← トップに戻る</a>
</div>
</header>
<div class="hero">
<div class="wrap">
  <div class="badge">{config["icon"]} {count}件のツール</div>
  <h1>{config["title"]}</h1>
  <p>{config["subtitle"]}</p>
</div>
</div>
<div class="wrap">
<div class="section">
<div class="info-box">
{config["expert_text"]}
{config["authority"]}
</div>
<h2>{config["icon"]} ツール一覧（全{count}件）</h2>
<div class="grid">
{cards_html}
</div>
<div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:1.25rem 1.5rem;margin-top:1.5rem">
<p style="font-size:.88rem;color:#374151;margin:0">すべてのツールは<strong>登録不要・完全無料</strong>でご利用いただけます。スマートフォン・タブレット・PC対応。計算結果は概算であり、重要な判断には専門家へのご相談をお勧めします。</p>
</div>
</div>
</div><!-- /wrap -->
<div id="cookie-banner" style="position:fixed;bottom:0;left:0;right:0;background:#1e293b;color:#f1f5f9;padding:1rem 1.5rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.75rem;z-index:9999;font-size:.85rem;box-shadow:0 -2px 10px rgba(0,0,0,.3)">
<div>当サイトはCookieおよびGoogle Analyticsを使用しています。<a href="/privacy-policy.html" style="color:#60a5fa;text-decoration:underline">プライバシーポリシー</a>をご確認ください。</div>
<button onclick="document.getElementById('cookie-banner').style.display='none';localStorage.setItem('cookie-consent','1');if(typeof gtag!=='undefined')gtag('consent','update',{{'ad_storage':'granted','analytics_storage':'granted','ad_user_data':'granted','ad_personalization':'granted'}});" style="background:#3b82f6;color:#fff;border:none;padding:.5rem 1.25rem;border-radius:.375rem;font-size:.85rem;font-weight:600;cursor:pointer;white-space:nowrap">同意して閉じる</button>
</div>
<script>if(localStorage.getItem('cookie-consent'))document.getElementById('cookie-banner').style.display='none'</script>
<div style="text-align:center;font-size:11px;color:#9ca3af;padding:6px 0 4px;background:#f8fafc;border-top:1px solid #e5e7eb;">
  運営: <a href="https://appadaycreator.com/" style="color:#9ca3af;text-decoration:none;">AppADayCreator</a> | <a href="https://tech-and-brace.co.jp/" rel="noopener" style="color:#9ca3af;text-decoration:none;">株式会社Tech&amp;Brace</a>
</div>
<footer>
<div class="wrap">
  <p><a href="https://appadaycreator.com/">AppADayCreator</a> | <a href="https://appadaycreator.com/privacy-policy.html">プライバシーポリシー</a> | <a href="https://appadaycreator.com/terms.html">利用規約</a></p>
</div>
</footer>
</body>
</html>'''

# Generate pages
os.makedirs('finance', exist_ok=True)
os.makedirs('health', exist_ok=True)
os.makedirs('career', exist_ok=True)
os.makedirs('game', exist_ok=True)

for cat, config in CAT_CONFIG.items():
    items = categories[cat]
    if not items:
        print(f'WARNING: {cat} has no items!')
        continue
    html = generate_page(cat, config, items)
    out_path = f'{cat}/index.html'
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(html)
    # Verify text length
    import re
    total = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL)
    total = re.sub(r'<style[^>]*>.*?</style>', '', total, flags=re.DOTALL)
    total = re.sub('<[^>]+>', '', total)
    total = re.sub(r'\s+', ' ', total).strip()
    print(f'Created {out_path}: {len(items)} services, {len(total)} chars of text')

print('\nDone!')
