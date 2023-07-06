import { PlaywrightCrawler, downloadListOfUrls , Dataset} from 'crawlee';
import { TimeSerie } from './saveTimeSerie.js';
import scrapeEcoon from './scraper/ecoon.js';
import scrapeKartonEu from './scraper/karton-eu.js';


const start = Date.now();

export type Data = {
    title: string
    prices: { quantity: number; price: number }[];
    sku: string;
    pcsPalette: number;
    url: string;
}

scrapeKartonEu();
// scrapeEcoon();
