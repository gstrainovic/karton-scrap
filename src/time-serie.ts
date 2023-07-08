import { InfluxDB } from "@influxdata/influxdb-client";
import Config from "./config";
import Secrets from "./secrets";

export function deleteBucket() {
    const client = new InfluxDB({
        url: Config.Influx.Url,
        token: Secrets.Influx.token,
    });

    const org = Config.Influx.Org;
    const bucket = Config.Influx.Bucket;

    const deleteAPI = client.getDeleteApi(org);
}