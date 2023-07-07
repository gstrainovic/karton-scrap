import { PlaywrightCrawler, downloadListOfUrls, Dataset } from 'crawlee';
import { TimeSerie } from '../save-time-serie.js';
import { Data } from '../main.js';

export default async function scrapeKartonEu() {
    console.log('start scraping karton.eu on ' + new Date().toISOString());
    const start = Date.now();

    const url = "https://www.karton.eu/Unsere-Kartonagen/"
    const domain = "https://www.karton.eu/"

    const links = await getLinks(url, domain)

    const crawler = new PlaywrightCrawler({
        requestHandler: async ({ page }) => {
    
            await page.waitForSelector('h1');
            const titleAr = await page.$$eval('h1', (els) => {
                return els.map((el) => {
                    return el.textContent?.trim();
                }
                );
            });
            const title = titleAr[0] ?? '';
    
            const sku = await page.$eval('p.product-sku span', (el) => el.textContent) ?? '';

            const prices = await page.$$eval('.bulk-price tbody tr', (rows) => {
                return rows.map((row) => {
                  const quantity = parseInt(row.querySelector('td:first-child')?.textContent ?? '0');
                  const priceExclVat = parseFloat(row.querySelector('td:nth-child(3)')?.textContent?.replace(',', '.') ?? '0');
                  return { quantity: quantity, price: priceExclVat };
                });
              });

            try {
                const pcsPaletteStr = await page.$eval('#cUNNummer', (el) => el.textContent?.match(/\d+/)?.join('')) ?? '0';
                const pcsPalette = parseInt(pcsPaletteStr);
                const tempData = { title, prices, sku, pcsPalette, url: page.url() };
                await TimeSerie.save(tempData);
            } catch (error) {
                const tempData = { title, prices, sku, pcsPalette: 0, url: page.url() };
                await TimeSerie.save(tempData);
            }

        },
    });
    
    console.log('number of urls to scrape: ' + links.length);

    // await crawler.run(links.slice(0, 10));
    await crawler.run(links);
    
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