import { PlaywrightCrawler, downloadListOfUrls , Dataset} from 'crawlee';
import { TimeSerie } from '../save-time-serie.js';
import { Data } from '../main.js';

export default async function scrapeEcoon() {
    console.log('start scraping ecoon on ' + new Date().toISOString());
    const start = Date.now();
    
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
    
            const prices = await page.$$eval('div#bulk-price-table table tbody tr', (els) => {
                return els.map((el) => {
                    const quantity_string = el.querySelector('td:nth-child(1)')?.textContent?.trim() ?? '';
                    const quantity = parseInt(quantity_string);
                    const price_string = el.querySelector('div.td-2 span + div span')?.textContent?.trim() ?? '';
                    const price = parseFloat(price_string.replace(/[^0-9,]/g, '').replace(',', '.'));
                    return { quantity, price: price };
                });
            });
    
            const sku = await page.$eval('span.sku_wrapper span.sku', (el) => el.textContent) ?? '';
            
            try {
                const table = await page.$('table.shop_attributes');
                const tableText = await table?.textContent();
                const pcsPalette_string = tableText?.match(/Palette\s*\d+/g)?.[0] ?? '';
                const pcsPalette = +pcsPalette_string.replace(/[^0-9]/g, '');
                const tempData : Data = { title, prices, sku, pcsPalette, url: page.url() };
                await TimeSerie.save(tempData);
              } catch (error) {
                const tempData : Data = { title, prices, sku, pcsPalette: 0, url: page.url() };
                await TimeSerie.save(tempData);
              }
    
        },
    });
    
    const url =  "https://ecoon.de/product-sitemap.xml"
    const listOfUrls = await downloadListOfUrls({ url: url });
    
    const newListOfUrls = listOfUrls.filter((url) => {
        return url.includes('ecoon.de/produkt')
    });
    console.log('number of urls to scrape: ' + newListOfUrls.length);
    
    await crawler.run(newListOfUrls.slice(0, 10));
    // await crawler.run(newListOfUrls);
    
    const time = (Date.now() - start) / 1000 / 60;
    console.log(`scrap ecoon finished after ${time.toFixed(2)} minutes`);
}


