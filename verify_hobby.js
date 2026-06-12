const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('=== 1. ページロード ===');
    await page.goto('http://127.0.0.1:8765/', { waitUntil: 'domcontentloaded' });
    const title = await page.title();
    console.log('タイトル:', title);
    
    // アフィリエイトリンク確認
    const html = await page.content();
    const a8Count = (html.match(/px\.a8\.net/g) || []).length;
    const amazonCount = (html.match(/amazon\.co\.jp/g) || []).length;
    console.log(`A8.net リンク: ${a8Count}件`);
    console.log(`Amazon リンク: ${amazonCount}件`);
    
    // ページ全体スクリーンショット
    await page.screenshot({ path: '/tmp/hobby-hero.png' });
    console.log('スクリーンショット保存: /tmp/hobby-hero.png');
    
    // 診断フロー開始
    console.log('\n=== 2. 診断フロー ===');
    for (let i = 1; i <= 8; i++) {
      const buttons = await page.locator('.option-btn');
      const count = await buttons.count();
      if (count > 0) {
        await buttons.first().click();
        await page.waitForTimeout(500);
        console.log(`Q${i} 回答完了`);
      } else {
        console.log(`Q${i} でボタン見つからず`);
        break;
      }
    }
    
    // 結果画面待機
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/tmp/hobby-result.png' });
    console.log('結果画面スクリーンショット: /tmp/hobby-result.png');
    
    // 結果画面内容確認
    const resultTitle = await page.locator('h2, h3').first().textContent();
    console.log('結果タイトル:', resultTitle);
    
    const chartCount = await page.locator('canvas').count();
    console.log(`グラフ数: ${chartCount}`);
    
    // アフィリエイト表示確認
    const affiliateVisible = await page.locator('#affiliate-section').isVisible().catch(() => false);
    console.log(`アフィリエイトセクション: ${affiliateVisible}`);
    
  } finally {
    await browser.close();
  }
})();
