import { PlaywrightCrawler, downloadListOfUrls , Dataset} from 'crawlee';
import { TimeSerie } from './saveTimeSerie.js';

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

        // await page.waitForSelector('div#bulk-price-table table tbody tr');
        const prices = await page.$$eval('div#bulk-price-table table tbody tr', (els) => {
            return els.map((el) => {
                const quantity_string = el.querySelector('td:nth-child(1)')?.textContent?.trim() ?? '';
                const quantity = parseInt(quantity_string);
                const price_string = el.querySelector('div.td-2 span + div span')?.textContent?.trim() ?? '';
                // remove all non-numeric characters and replace comma with dot and parse to float
                const price = parseFloat(price_string.replace(/[^0-9,]/g, '').replace(',', '.'));
                return { quantity, price: price };
            });
        });
        log.info("Prices:", prices);

        // await page.waitForSelector('span.sku_wrapper span.sku');
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
            TimeSerie.save(data);
          } catch (error) {
            log.warning(`Warning: ${error}`);
            const tempData = { title, prices, sku, pcsPalette: 0, url: page.url() };
            data.push(tempData);
            TimeSerie.save(data);
          }

    },
});

const url =  "https://ecoon.de/product-sitemap.xml" //urls[0];
const listOfUrls = await downloadListOfUrls({ url: url });

const newListOfUrls = listOfUrls.filter((url) => {
    return url.includes('ecoon.de/produkt')
});
console.log(newListOfUrls);

// top 10 urls
const top10Urls = newListOfUrls.slice(0, 10);

const start = Date.now();
await crawler.run(top10Urls);

await Dataset.pushData(data);


for (const item of data) {
    console.log(item);
}



// console.log(`Time: ${Date.now() - start}ms`);
// time in minutes and seconds
const time = (Date.now() - start) / 1000 / 60;
console.log(`Time: ${time.toFixed(2)} minutes`);
