import { InfluxDB, Point } from '@influxdata/influxdb-client';
import Config from './config.js';
import Secrets from './secrets.js';

export type Data = {
    title: string
    prices: { quantity: number; price: number }[];
    sku: string;
    pcsPalette: number;
    url: string;
}

export class TimeSerie {
    static async save(
        item: Data,
    ) {

        const client = new InfluxDB({
            url: Config.Influx.Url,
            token: Secrets.Influx.token,
        });

        const org = Config.Influx.Org;
        const bucket = Config.Influx.Bucket;
        const writeAPI = client.getWriteApi(org, bucket, 'ns');

            for (const price of item.prices) {
                const domain = new URL(item.url).hostname;
                const point = new Point(domain)
                
                point.tag('sku', item.sku);
                point.tag('title', item.title);
                point.tag('url', item.url);

                point.intField('pcsPalette', item.pcsPalette);
                point.floatField('price', price.price);
                point.intField('quantity', price.quantity);
                writeAPI.writePoint(point)
            }
            
        try {
            await writeAPI.close()
            // console.log('saved' + item.sku + ' to influxdb')
        } catch (e) {
            console.error(e)
        }

    }
}