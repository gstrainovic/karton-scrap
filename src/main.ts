import exportAll from './export-all.js';
import scrapeEcoon from './scraper/ecoon.js';
import scrapeKartonEu from './scraper/karton-eu.js';

export type Data = {
    title: string
    prices: { quantity: number; price: number }[];
    sku: string;
    pcsPalette: number;
    url: string;
}

export type ExportRecord = {
    result: string,
    table: number,
    _start: string,
    _stop: string,
    _time: string,
    _measurement: string,
    sku: string,
    title: string,
    url: string,
    pcsPalette: number,
    price: number,
    quantity: number
}

await scrapeKartonEu();
await scrapeEcoon();
await exportAll();
