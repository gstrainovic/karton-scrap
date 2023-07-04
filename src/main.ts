import { PlaywrightCrawler, downloadListOfUrls , Dataset} from 'crawlee';
import { DOMParser } from 'xmldom';

// import  { XMLparseURLs } from './links/getLinks';
// import { urls } from './config';

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
            console.log(pcsPalette);
            data.push({ title, prices, sku, pcsPalette, url: page.url() });
          } catch (error) {
            log.warning(`Warning: ${error}`);
            data.push({ title, prices, sku, pcsPalette: '', url: page.url() });
          }

    },
});

const url =  "https://ecoon.de/product-sitemap.xml" //urls[0];
const listOfUrls = await downloadListOfUrls({ url: url });

// remove all urls which are not include ecoon.de
const newListOfUrls = listOfUrls.filter((url) => {
    return url.includes('ecoon.de/produkt')
});
console.log(newListOfUrls);

// top 10 urls
const top10Urls = newListOfUrls.slice(0, 10);

// await crawler.run(['https://ecoon.de/produkt/graspapierkarton-550-x-300-x-550-350-300-mm-2-wellig/']);
// await crawler.run(['https://ecoon.de/produkt/safepac-soft-polstermatten-380-x-380-mm/']);
await crawler.run(top10Urls);


for (const item of data) {
    console.log(item);
}

await Dataset.pushData(data);


// import { PlaywrightCrawler } from 'crawlee';

type SitemapIndex = {
    Locations: string[];
  };
  
  type Sitemap = {
    Locations: string[];
  };
  
  // function getLinks(url: string): Promise<string[]> {
  //   // if the url is xml, parse it
  //   if (url.includes('.xml')) {
  //     return XMLparseURLs(url);
  //   }
  
  //   const domain = getDomain(url);
  //   const links: string[] = [];
  
  //   const crawler = new PlaywrightCrawler();
  //   crawler.on('link', (link) => {
  //     // the link must be a link without a domain and contain 'x'
  //     if (link.includes('x') && !link.includes('http')) {
  //       const fullPathURL = domain + link;
  //       links.push(fullPathURL);
  //     }
  //   });
  
  //   return crawler.crawl(url).then(() => links);
  // }
  
//   function getDomain(url: string): string {
//     const splitted = url.split('/');
//     return `${splitted[0]}//${splitted[2]}/`;
//   }