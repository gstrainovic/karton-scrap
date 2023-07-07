import { ExportAll, ExportDiff } from './export.js';
import EcoonScraper from './scraper/ecoon.js';
import KartonEuScraper from './scraper/karton-eu.js';

const kartonEuScraper = new KartonEuScraper();
await kartonEuScraper.scrape();

const ecoonScraper = new EcoonScraper();
await ecoonScraper.scrape();

const exportAll = new ExportAll();
await exportAll.export();

const exportDiff = new ExportDiff();
await exportDiff.export();

