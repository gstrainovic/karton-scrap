import EcoonScraper from "../scraper/ecoon";

describe("EcoonScraper", () => {
    test("delete the bucket", async () => {
      // run this cli command: influx bucket delete --name 



    // scrape this url: https://ecoon.de/produkt/graspapierkarton-600-x-450-x-100-mm-2-wellig/
    // and check if the data is correct
    test("scrape", async () => {
      const scraper = new EcoonScraper();
      const data = await scraper.scrape(["https://ecoon.de/produkt/graspapierkarton-600-x-450-x-100-mm-2-wellig/"]);
    });
  });