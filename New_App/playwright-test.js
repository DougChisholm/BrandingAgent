const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const pages = [
  { file: 'index.html', name: 'index' },
  { file: 'vehicle-lookup.html', name: 'vehicle-lookup' },
  { file: 'vehicle-details.html', name: 'vehicle-details' },
  { file: 'your-details.html', name: 'your-details' },
  { file: 'your-cover.html', name: 'your-cover' },
  { file: 'price-presentation.html', name: 'price-presentation' },
  { file: 'extras.html', name: 'extras' },
  { file: 'review.html', name: 'review' },
  { file: 'payment.html', name: 'payment' },
  { file: 'confirmation.html', name: 'confirmation' }
];

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const screenshotDir = '/home/runner/work/BrandingAgent/BrandingAgent/New_App/screenshots';
  fs.mkdirSync(screenshotDir, { recursive: true });

  for (const p of pages) {
    const filePath = path.join('/home/runner/work/BrandingAgent/BrandingAgent/New_App', p.file);
    const page = await context.newPage();
    await page.goto(`file://${filePath}`);
    await page.waitForTimeout(500);
    const screenshotPath = path.join(screenshotDir, `${p.name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`✅ Screenshot saved: ${screenshotPath}`);
    await page.close();
  }

  await browser.close();
  console.log('\n✅ All pages screenshot successfully!');
})();
