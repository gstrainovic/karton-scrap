import { InfluxDB, Point } from '@influxdata/influxdb-client';
import { Data } from './main.js';
import Config from './config.js';
import Secrets from './secrets.js';

export class TimeSerie {
    static save(
        returnArray: Data[],
    ) {

        const client = new InfluxDB({
            url: Config.Influx.Url,
            token: Secrets.Influx.token,
        });

        const org = Config.Influx.Org;
        const bucket = Config.Influx.Bucket;
        const writeAPI = client.getWriteApi(org, bucket);

        for (const item of returnArray) {
            for (const price of item.prices) {
                const domain = new URL(item.url).hostname;
                const point = new Point(domain)

                point.tag('sku', item.sku);
                point.tag('title', item.title);
                point.intField('pcsPalette', item.pcsPalette);

                point.floatField('price', price.price);
                point.intField('quantity', price.quantity);
                point.timestamp(new Date());

                writeAPI.writePoint(point);
            }
        }

        writeAPI.close();
    }
}