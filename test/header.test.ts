const puppeteer = require('puppeteer');
test('lunch a browser', async ()=> {
    const browser = await puppeteer.lunch();
    const page = await browser.newPage();
    await page.goto('localhost:3000');

})