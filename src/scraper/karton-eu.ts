import { PlaywrightCrawler } from 'crawlee';
import { Data, TimeSerie } from '../save-time-serie.js';
import { Scraper } from './scraper.js';

export default class KartonEuScraper extends Scraper {
  override crawler = new PlaywrightCrawler({
    requestHandler: async ({ page }) => {
      await page.waitForSelector('h1');
      const titleAr = await page.$$eval('h1', (els) => {
        return els.map((el) => {
          return el.textContent?.trim();
        });
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
        const tempData: Data = { title, prices, sku, pcsPalette, url: page.url() };
        await TimeSerie.save(tempData);
      } catch (error) {
        const tempData: Data = { title, prices, sku, pcsPalette: 0, url: page.url() };
        await TimeSerie.save(tempData);
      }
    },
  });

  protected override async getLinks() {
    const url = 'https://www.karton.eu/Unsere-Kartonagen/';
    const domain = 'https://www.karton.eu/';

    const links: string[] = [];

    const getLinksCrawler = new PlaywrightCrawler({
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

    await getLinksCrawler.run([url]);

    return links;

  }

    
}