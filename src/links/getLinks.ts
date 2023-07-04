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

function getDomain(url: string): string {
  const splitted = url.split('/');
  return `${splitted[0]}//${splitted[2]}/`;
}