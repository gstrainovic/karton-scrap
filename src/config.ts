export default class Config {
    static Exportieren = {
        Alle : true,
        Letzte: true,
        Teil : true
    }
    
    static Influx = {
        Url : "http://localhost:8086",
        Org : "packster",
        Bucket : "scrap"
    }
}