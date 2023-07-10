import { ExportAll, ExportDiff } from './export.js';
import EcoonScraper from './scraper/ecoon.js';
import KartonEuScraper from './scraper/karton-eu.js';

const kartonEuScraper = new KartonEuScraper()
await kartonEuScraper.scrape(undefined, true);

const ecoonScraper = new EcoonScraper();
await ecoonScraper.scrape(undefined, true);

const exportAll = new ExportAll();
await exportAll.export();

const exportDiff = new ExportDiff();
await exportDiff.export();

