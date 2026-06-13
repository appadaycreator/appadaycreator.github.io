/**
 * Google Consent Mode v2 管理スクリプト
 * - 初回訪問時にバナーを表示し同意/拒否を取得
 * - 決定済みの場合は即時に gtag consent update を発火
 * - 旧キー (cookie-consent=1) は "granted" として後方互換で引き継ぐ
 */
(function () {
  var NEW_KEY = 'cookie-consent-v2';
  var OLD_KEY = 'cookie-consent';

  function gtag() {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(arguments);
  }

  function applyConsent(state) {
    var g = state === 'granted' ? 'granted' : 'denied';
    gtag('consent', 'update', {
      analytics_storage: g,
      ad_storage: g,
      ad_user_data: g,
      ad_personalization: g,
    });
  }

  function saveAndApply(state) {
    try { localStorage.setItem(NEW_KEY, state); } catch (e) {}
    if (state === 'granted') {
      try { localStorage.setItem(OLD_KEY, '1'); } catch (e) {}
    }
    applyConsent(state);
    removeBanner();
  }

  function removeBanner() {
    var el = document.getElementById('consent-banner-v2');
    if (el) el.parentNode.removeChild(el);
  }

  /* グローバル公開（既存バナーのボタンからも呼べるように） */
  window.grantConsent = function () { saveAndApply('granted'); };
  window.denyConsent  = function () { saveAndApply('denied'); };

  /* 既存の同意状態を確認 */
  var stored;
  try {
    stored = localStorage.getItem(NEW_KEY);
    if (!stored && localStorage.getItem(OLD_KEY) === '1') stored = 'granted';
  } catch (e) {}

  if (stored) {
    applyConsent(stored);
    return; /* バナー不要 */
  }

  /* バナーを動的に生成・表示 */
  function showBanner() {
    if (document.getElementById('consent-banner-v2')) return;
    var d = document.createElement('div');
    d.id = 'consent-banner-v2';
    d.setAttribute('role', 'dialog');
    d.setAttribute('aria-label', 'Cookie同意バナー');
    d.style.cssText = [
      'position:fixed', 'bottom:0', 'left:0', 'right:0',
      'background:#1e293b', 'color:#f1f5f9',
      'padding:12px 16px 12px 20px',
      'display:flex', 'align-items:center', 'gap:12px',
      'z-index:999999', 'font-family:sans-serif', 'font-size:13px',
      'flex-wrap:wrap', 'box-shadow:0 -2px 12px rgba(0,0,0,.35)'
    ].join(';');

    /* プライバシーポリシーへの相対→絶対パス変換 */
    var ppHref = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
      ? '/privacy-policy.html'
      : 'https://appadaycreator.com/privacy-policy.html';

    d.innerHTML =
      '<span style="flex:1;min-width:220px;line-height:1.5">' +
        '当サイトはアクセス解析・広告配信のためCookieを使用します。' +
        '<a href="' + ppHref + '" style="color:#93c5fd;margin-left:4px;white-space:nowrap">詳細</a>' +
      '</span>' +
      '<button id="consent-accept-v2" style="background:#3b82f6;color:#fff;border:none;' +
        'padding:8px 20px;border-radius:6px;font-size:13px;font-weight:700;cursor:pointer;' +
        'white-space:nowrap;min-height:36px;flex-shrink:0">同意する</button>' +
      '<button id="consent-deny-v2" style="background:transparent;color:#94a3b8;' +
        'border:1px solid #475569;padding:8px 16px;border-radius:6px;font-size:13px;' +
        'cursor:pointer;white-space:nowrap;min-height:36px;flex-shrink:0">拒否する</button>';

    document.body.appendChild(d);
    document.getElementById('consent-accept-v2').addEventListener('click', function () { saveAndApply('granted'); });
    document.getElementById('consent-deny-v2').addEventListener('click',  function () { saveAndApply('denied'); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showBanner);
  } else {
    showBanner();
  }
})();
