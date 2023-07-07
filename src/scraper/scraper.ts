import { PlaywrightCrawler } from "crawlee";

export type Data = {
    title: string
    prices: { quantity: number; price: number }[];
    sku: string;
    pcsPalette: number;
    url: string;
}

interface IScraper {
    crawler: PlaywrightCrawler;
    scrape(): Promise<void>;
  }

export class Scraper implements IScraper {
    protected async getLinks() {return [""]}
    crawler = new PlaywrightCrawler();
    async scrape(
      urls = undefined,
      top10 = false
      ): Promise<void> {
        
      console.log('start scraping karton.eu on ' + new Date().toISOString());
      const start = Date.now();
  
      const links_temp = urls ?? await this.getLinks();
      const links = top10 ? links_temp.slice(0, 10) : links_temp;
  
      console.log('number of urls to scrape: ' + links.length);
  
      await this.crawler.run(links);
  
      const time = (Date.now() - start) / 1000 / 60;
      console.log(`scrap ecoon finished after ${time.toFixed(2)} minutes`);
    }
  }