import Config from './config.js';
import Secrets from './secrets.js';
import { InfluxDB } from '@influxdata/influxdb-client';
import ExcelJS from 'exceljs';

type ExportRecord = {
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

class Export {
  protected getQuery(measurement: string) {
    return '';
  }
  protected prefix = '';
  protected headers: string[] = [];

  protected measurements = ['ecoon.de', 'www.karton.eu']

  protected client = new InfluxDB({
    url: Config.Influx.Url,
    token: Secrets.Influx.token,
  });

  protected queryAPI = this.client.getQueryApi(Config.Influx.Org);

  async export() {
    this.measurements.forEach(async measurement => {

      const result = await this.queryAPI.collectRows(this.getQuery(measurement));

      // Create a new workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Sheet1');

      // Add headers to the worksheet
      worksheet.addRow(this.headers);

      // Add data to the worksheet
      for await (const record of result) {
        const row: any[] = [
          new Date((record as ExportRecord)._time).toISOString(),
          (record as ExportRecord).sku,
          (record as ExportRecord).quantity,
          (record as ExportRecord).price,
          (record as ExportRecord).pcsPalette,
          (record as ExportRecord).title,
          (record as ExportRecord).url
        ];
        worksheet.addRow(row);
      }

      // Save the Excel file named with date, time (minutes and seconds)
      const filename = `./data/export-${this.prefix}-${measurement}-${new Date().toISOString().slice(0, 16).replace(/:/g, "-")}.xlsx`;
      await workbook.xlsx.writeFile(filename);
    });

  }
}

export class ExportDiff extends Export {
  protected override getQuery(measurement: string) {
    return `from(bucket: "${Config.Influx.Bucket}")
    |> range(start: -365d)
    |> filter(fn: (r) => r["_measurement"] == "${measurement}")
    |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
    |> group(columns: ["sku", "quantity"])
    |> difference(columns: ["price"])
    |> filter(fn: (r) => r.price > 0)`
  }
  protected override prefix = 'diffs';
  protected override headers = ['Datum', 'Artikelnummer', 'Anzahl', 'Preisunterschied', 'Stück pro Palette', 'Titel', 'Link'];
}


export class ExportAll extends Export {
  protected override getQuery(measurement: string) {
    return `from(bucket: "${Config.Influx.Bucket}")
        |> range(start: -300m)
        |> filter(fn: (r) => r["_measurement"] == "${measurement}")
        |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")`;
  }
  protected override prefix = 'alle';
  protected override headers = ['Datum', 'Artikelnummer', 'Anzahl', 'Preis', 'Stück pro Palette', 'Titel', 'Link'];
}
