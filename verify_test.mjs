import puppeteer from 'puppeteer';

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    console.log('📊 Verification: personal-color-finder\n');

    console.log('Step 1: Loading page...');
    await page.goto('http://localhost:8080/index.html', { waitUntil: 'networkidle2', timeout: 15000 });
    console.log('  ✓ Page loaded\n');

    console.log('Step 2: Answering 15 questions...');
    for (let i = 0; i < 15; i++) {
      const buttons = await page.$$('.option-btn');
      if (buttons.length > 0) {
        await buttons[0].click();
        await page.evaluate(() => new Promise(r => setTimeout(r, 100)));
      }
    }
    console.log('  ✓ All questions answered\n');

    console.log('Step 3: Submitting diagnosis...');
    await page.click('#next-btn');
    await page.evaluate(() => new Promise(r => setTimeout(r, 2000)));
    const resultTitle = await page.$eval('#result-title', el => el.textContent);
    console.log(`  ✓ Results shown: "${resultTitle}"\n`);

    console.log('🎯 Checking Implemented Features:\n');
    const checks = {
      'M4 Color Chart (colorChart)': '#colorChart',
      'M4 Bone Chart (boneChart)': '#boneChart',
      'M9 LINE Share': 'button[onclick*="shareLINE"]',
      'M9 Facebook Share': 'button[onclick*="shareFacebook"]',
      'M9 Twitter Share': 'button[onclick*="shareTwitter"]',
      'M10 PDF Download': 'button[onclick*="downloadPDF"]',
      'M3 History Container': '#history-container',
      'M8 Hint Buttons': '.hint-btn',
      'M18 Breadcrumb': 'nav[aria-label*="パンくずリスト"]',
    };

    for (const [feature, selector] of Object.entries(checks)) {
      const exists = await page.$(selector) != null;
      console.log(`  ${exists ? '✅' : '❌'} ${feature}`);
    }

    console.log('\n📋 Schema & Metadata:\n');
    const ogTitle = await page.$eval('meta[property="og:title"]', el => el.content).catch(() => '');
    const ogDesc = await page.$eval('meta[property="og:description"]', el => el.content).catch(() => '');
    const metaDesc = await page.$eval('meta[name="description"]', el => el.content).catch(() => '');

    const schemas = await page.$$('script[type="application/ld+json"]');
    let hasFAQ = false, hasSchema = false;
    for (const schema of schemas) {
      const content = await page.evaluate(el => el.textContent, schema);
      if (content.includes('FAQPage')) hasFAQ = true;
      if (content.includes('SoftwareApplication')) hasSchema = true;
    }

    console.log(`  ${hasFAQ ? '✅' : '❌'} M14 FAQ Schema (FAQPage)`);
    console.log(`  ${hasSchema ? '✅' : '❌'} WebApplication Schema`);
    console.log(`  ℹ️  OGP Title: ${ogTitle.length} chars`);
    console.log(`  ℹ️  Meta desc: ${metaDesc.length} chars (optimal: 120-160)`);

    console.log('\n📱 Mobile Responsiveness (M18):\n');
    await page.setViewport({ width: 375, height: 812 });
    const mobileBtns = await page.$$('.option-btn');
    const firstBtn = mobileBtns[0];
    const btnHeight = await page.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return computed.minHeight || computed.height;
    }, firstBtn);
    console.log(`  ℹ️  Button height on mobile: ${btnHeight}`);

    console.log('\n💰 Affiliate Links (Revenue):\n');
    const a8Links = await page.$$('a[href*="px.a8.net"]');
    const amazonLinks = await page.$$('a[href*="amazon.co.jp"]');
    console.log(`  ${a8Links.length >= 10 ? '✅' : '⚠️'} A8.net: ${a8Links.length}/10 links`);
    console.log(`  ℹ️  Amazon links: ${amazonLinks.length}`);

    console.log('\n✅ Verification Complete!\n');

    if (browser) await browser.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (browser) await browser.close();
    process.exit(1);
  }
})();
