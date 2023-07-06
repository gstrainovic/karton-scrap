import { PlaywrightCrawler, downloadListOfUrls, Dataset } from 'crawlee';
import { TimeSerie } from '../saveTimeSerie.js';
import { Data } from '../main.js';

export default async function scrapeKartonEu() {
    console.log('start scraping karton.eu on ' + new Date().toISOString());
    const start = Date.now();

    const url = "https://www.karton.eu/Unsere-Kartonagen/"
    const domain = "https://www.karton.eu/"

    const links = await getLinks(url, domain)

    // print the links
    console.log('Links:, ', links);

    const data = [] as Data[];

    const crawler = new PlaywrightCrawler({
        requestHandler: async ({ page , log }) => {
    
            await page.waitForSelector('h1');
            const titleAr = await page.$$eval('h1', (els) => {
                return els.map((el) => {
                    return el.textContent?.trim();
                }
                );
            });
            const title = titleAr[0] ?? '';
            log.info(`Title is ${title}`);
    
            const sku = await page.$eval('p.product-sku span', (el) => el.textContent) ?? '';
            log.info(`SKU is ${sku}`);

            const prices = await page.$$eval('p#bulk-price-table table tbody tr', (els) => {
                return els.map((el) => {
                    const quantity_string = el.querySelector('td:nth-child(1)')?.textContent?.trim() ?? '';
                    const quantity = parseInt(quantity_string);
                    const price_string = el.querySelector('div.td-2 span + div span')?.textContent?.trim() ?? '';
                    const price = parseFloat(price_string.replace(/[^0-9,]/g, '').replace(',', '.'));
                    return { quantity, price: price };
                });
            });
            log.info("Prices:", prices);
    
            
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
    
    
    await crawler.run(links.slice(0, 10));
    // await crawler.run(links);
    
    for (const item of data) {
        console.log(item);
    }
    
    const time = (Date.now() - start) / 1000 / 60;
    console.log(`scrap ecoon finished after ${time.toFixed(2)} minutes`);

}

async function getLinks(url: string, domain: string) {
    const links: string[] = [];

    const crawler = new PlaywrightCrawler({
        requestHandler: async ({ page }) => {
            const elements = await page.$$('a[href]');
            for (const element of elements) {
                const link = await element.getAttribute('href');
                if (link?.includes('x') && !link.includes('http')) {
                    const fullPathURL = domain + link;
                    links.push(fullPathURL);
                }
            }
        },
    });


    await crawler.run([url]);
    return links;
}