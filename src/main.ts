import { PlaywrightCrawler } from 'crawlee';

const crawler = new PlaywrightCrawler({
    requestHandler: async ({ page }) => {
        await page.waitForSelector('h2.product_title.entry-title');
        const actorTexts = await page.$$eval('h2.product_title.entry-title', (els) => {
            return els.map((el) => el.textContent);
        });
        actorTexts.forEach((text, i) => {
            console.log(`H2_${i + 1}: ${text}\n`);
        });

        await page.waitForSelector('div#bulk-price-table table tbody tr');
        const prices = await page.$$eval('div#bulk-price-table table tbody tr', (els) => {
            return els.map((el) => {
                const quantity = el.querySelector('td:nth-child(1)')?.textContent?.trim();
                const price = el.querySelector('div.td-2 span + div span')?.textContent?.trim();
                return { quantity, price: price };
            });
        });
        console.log(prices);

        // extract the sku from html like this: <span class="sku_wrapper">Artikelnummer: <span class="sku">24043</span></span>
        await page.waitForSelector('span.sku_wrapper span.sku');
        const sku = await page.$eval('span.sku_wrapper span.sku', (el) => el.textContent);
        console.log(`SKU: ${sku}`);

    },
});

await crawler.run(['https://ecoon.de/produkt/graspapierkarton-550-x-300-x-550-350-300-mm-2-wellig/']);