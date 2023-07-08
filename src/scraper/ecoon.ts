import { PlaywrightCrawler, downloadListOfUrls , Dataset} from 'crawlee';
import { Data, TimeSerie } from '../save-time-serie.js';
import { Scraper } from './scraper.js';

export default class EcoonScraper extends Scraper {
    override crawler = new PlaywrightCrawler({
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
    
    protected override async getLinks() {
        const url =  "https://ecoon.de/product-sitemap.xml"
        const listOfUrls = await downloadListOfUrls({ url: url });
        
        const newListOfUrls = listOfUrls.filter((url) => {
            return url.includes('ecoon.de/produkt')
        });
        return newListOfUrls;
    }

}




