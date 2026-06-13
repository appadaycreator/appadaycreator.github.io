#!/usr/bin/env python3
"""R48-② 残り6ページへのConsent Mode V2追加"""
import re, os

TARGETS = ['cold-prevention-checker', 'contact', 'privacy', 'nail-design-advisor', 'start', 'couple-anniversary-counter']

CONSENT_V2 = """<!-- Consent Mode v2 -->
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{'analytics_storage':'denied','ad_storage':'denied','ad_user_data':'denied','ad_personalization':'denied','wait_for_update':500});(function(){try{var k='cookie-consent-v2',o='cookie-consent';var c=localStorage.getItem(k);if(!c&&localStorage.getItem(o)==='1')c='granted';if(c){var s=c==='granted'?'granted':'denied';gtag('consent','update',{'analytics_storage':s,'ad_storage':s,'ad_user_data':s,'ad_personalization':s});}}catch(e){}})();</script>
<!-- End Consent Mode v2 -->
"""

NEW_BUTTON = 'onclick="document.getElementById(\'cookie-banner\').style.display=\'none\';localStorage.setItem(\'cookie-consent\',\'1\');if(typeof gtag!==\'undefined\')gtag(\'consent\',\'update\',{\'ad_storage\':\'granted\',\'analytics_storage\':\'granted\',\'ad_user_data\':\'granted\',\'ad_personalization\':\'granted\'});"'

results = []
for dir_name in TARGETS:
    path = f'{dir_name}/index.html'
    if not os.path.exists(path):
        results.append(f'SKIP {dir_name}: not found')
        continue
    with open(path, encoding='utf-8') as f:
        content = f.read()
    if 'ad_storage' in content:
        results.append(f'SKIP {dir_name}: already has Consent V2')
        continue

    # Insert after <head>
    new_content = re.sub(r'(<head>)', r'\1\n' + CONSENT_V2, content, count=1)

    # Update cookie banner button
    OLD_BTN1 = "onclick=\"document.getElementById('cookie-banner').style.display='none';localStorage.setItem('cookie-consent','1')\""
    OLD_BTN2 = "onclick=\"document.getElementById('cookie-banner').style.display='none';window.grantConsent && window.grantConsent()\""
    if OLD_BTN1 in new_content:
        new_content = new_content.replace(OLD_BTN1, NEW_BUTTON)
    elif OLD_BTN2 in new_content:
        new_content = new_content.replace(OLD_BTN2, NEW_BUTTON)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    results.append(f'OK {dir_name}')

for r in results:
    print(r)
print(f'\nDone: {sum(1 for r in results if r.startswith("OK"))} updated')
