import { PlaywrightCrawler } from 'crawlee';

type Data = {
    title: string
    prices: { quantity: string; price: string }[];
    sku: string;
    pcsPalette: string;
}

const data = [] as Data[];

const crawler = new PlaywrightCrawler({
    requestHandler: async ({ page }) => {
        await page.waitForSelector('h2.product_title.entry-title');
        const titleAr = await page.$$eval('h2.product_title.entry-title', (els) => {
            return els.map((el) => {
                return el.textContent?.trim();
            }
            );
        });
        const title = titleAr[0] ?? '';

        await page.waitForSelector('div#bulk-price-table table tbody tr');
        const prices = await page.$$eval('div#bulk-price-table table tbody tr', (els) => {
            return els.map((el) => {
                const quantity = el.querySelector('td:nth-child(1)')?.textContent?.trim() ?? '';
                const price = el.querySelector('div.td-2 span + div span')?.textContent?.trim() ?? '';
                return { quantity, price: price };
            });
        });

        await page.waitForSelector('span.sku_wrapper span.sku');
        const sku = await page.$eval('span.sku_wrapper span.sku', (el) => el.textContent) ?? '';

        await page.waitForSelector('tr.woocommerce-product-attributes-item--attribute_mengepalette td.woocommerce-product-attributes-item__value p');
        const pcsPalette =
            await page.$eval('tr.woocommerce-product-attributes-item--attribute_mengepalette td.woocommerce-product-attributes-item__value p',
                (el) => el.textContent?.trim() ?? '');

        data.push({ title, prices, sku, pcsPalette });

    },
});

await crawler.run(['https://ecoon.de/produkt/graspapierkarton-550-x-300-x-550-350-300-mm-2-wellig/']);

console.log(data);