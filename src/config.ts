export default class Config {
    static urls = [
        "https://ecoon.de/product-sitemap.xml/",
        "https://www.karton.eu/Unsere-Kartonagen/",
    ]

    static Exportieren = {
        Alle : false,
        Teil : true
    }
    
    static Influx = {
        Url : "http://localhost:8086",
        Org : "packster",
        Bucket : "scrap"
    }
}