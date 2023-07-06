import { PlaywrightCrawler, downloadListOfUrls , Dataset} from 'crawlee';
import { TimeSerie } from './saveTimeSerie.js';

const start = Date.now();

export type Data = {
    title: string
    prices: { quantity: number; price: number }[];
    sku: string;
    pcsPalette: number;
    url: string;
}

const data = [] as Data[];

const crawler = new PlaywrightCrawler({
    requestHandler: async ({ page , log }) => {

        await page.waitForSelector('h2.product_title.entry-title');
        const titleAr = await page.$$eval('h2.product_title.entry-title', (els) => {
            return els.map((el) => {
                return el.textContent?.trim();
            }
            );
        });
        const title = titleAr[0] ?? '';
        log.info(`Title is ${title}`);

        const prices = await page.$$eval('div#bulk-price-table table tbody tr', (els) => {
            return els.map((el) => {
                const quantity_string = el.querySelector('td:nth-child(1)')?.textContent?.trim() ?? '';
                const quantity = parseInt(quantity_string);
                const price_string = el.querySelector('div.td-2 span + div span')?.textContent?.trim() ?? '';
                const price = parseFloat(price_string.replace(/[^0-9,]/g, '').replace(',', '.'));
                return { quantity, price: price };
            });
        });
        log.info("Prices:", prices);

        const sku = await page.$eval('span.sku_wrapper span.sku', (el) => el.textContent) ?? '';
        log.info(`SKU is ${sku}`);
        
        try {
            const table = await page.$('table.shop_attributes');
            const tableText = await table?.textContent();
            const pcsPalette_string = tableText?.match(/Palette\s*\d+/g)?.[0] ?? '';
            const pcsPalette = +pcsPalette_string.replace(/[^0-9]/g, '');
            log.info(`pcsPalette is ${pcsPalette}`);
            const tempData = { title, prices, sku, pcsPalette, url: page.url() };
            data.push(tempData);
            await TimeSerie.save(tempData);
            await Dataset.pushData(tempData);
          } catch (error) {
            log.warning(`Warning: ${error}`);
            const tempData = { title, prices, sku, pcsPalette: 0, url: page.url() };
            data.push(tempData);
            await TimeSerie.save(tempData);
            await Dataset.pushData(tempData);
          }

    },
});

const url =  "https://ecoon.de/product-sitemap.xml"
const listOfUrls = await downloadListOfUrls({ url: url });

const newListOfUrls = listOfUrls.filter((url) => {
    return url.includes('ecoon.de/produkt')
});
console.log(newListOfUrls);

// const top10Urls = newListOfUrls.slice(0, 10);

await crawler.run(newListOfUrls);

for (const item of data) {
    console.log(item);
}

const time = (Date.now() - start) / 1000 / 60;
console.log(`Time: ${time.toFixed(2)} minutes`);
