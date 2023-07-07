import scrapeEcoon from './scraper/ecoon.js';
import scrapeKartonEu from './scraper/karton-eu.js';

export type Data = {
    title: string
    prices: { quantity: number; price: number }[];
    sku: string;
    pcsPalette: number;
    url: string;
}

await scrapeKartonEu();
await scrapeEcoon();
