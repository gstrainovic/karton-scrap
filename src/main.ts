import { PlaywrightCrawler, downloadListOfUrls , Dataset} from 'crawlee';
import { DOMParser } from 'xmldom';

type Data = {
    title: string
    prices: { quantity: string; price: string }[];
    sku: string;
    pcsPalette: string;
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
                const quantity = el.querySelector('td:nth-child(1)')?.textContent?.trim() ?? '';
                const price = el.querySelector('div.td-2 span + div span')?.textContent?.trim() ?? '';
                return { quantity, price: price };
            });
        });
        log.info("Prices:", prices);

        // await page.waitForSelector('span.sku_wrapper span.sku');
        const sku = await page.$eval('span.sku_wrapper span.sku', (el) => el.textContent) ?? '';
        log.info(`SKU is ${sku}`);
        
        try {
            await page.waitForSelector('tr.woocommerce-product-attributes-item--attribute_mengepalette td.woocommerce-product-attributes-item__value p', { timeout: 1 });
            const pcsPalette = await page.$eval('tr.woocommerce-product-attributes-item--attribute_mengepalette td.woocommerce-product-attributes-item__value p', (el) => el.textContent?.trim() ?? '');
            log.info(`pcsPalette is ${pcsPalette}`);
            data.push({ title, prices, sku, pcsPalette, url: page.url() });
          } catch (error) {
            log.warning(`Warning: ${error}`);
            data.push({ title, prices, sku, pcsPalette: '', url: page.url() });
          }

    },
});

const url =  "https://ecoon.de/product-sitemap.xml" //urls[0];
const listOfUrls = await downloadListOfUrls({ url: url });

const newListOfUrls = listOfUrls.filter((url) => {
    return url.includes('ecoon.de/produkt')
});
console.log(newListOfUrls);

// // top 10 urls
// const top10Urls = newListOfUrls.slice(0, 10);

const start = Date.now();
await crawler.run(newListOfUrls);

await Dataset.pushData(data);

for (const item of data) {
    console.log(item);
}

// console.log(`Time: ${Date.now() - start}ms`);
// time in minutes and seconds
const time = (Date.now() - start) / 1000 / 60;
console.log(`Time: ${time.toFixed(2)} minutes`);


type SitemapIndex = {
    Locations: string[];
  };
  
  type Sitemap = {
    Locations: string[];
  };
  