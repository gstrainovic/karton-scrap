import Config from './config.js';
import Secrets from './secrets.js';
import { InfluxDB } from '@influxdata/influxdb-client';
import ExcelJS from 'exceljs';

export default async function exportAll() {

  const client = new InfluxDB({
    url: Config.Influx.Url,
    token: Secrets.Influx.token,
  });
  const queryAPI = client.getQueryApi(Config.Influx.Org);

  // get a list of measurements in the bucket
  const measurements : string[] = ['ecoon.de', 'www.karton.eu'];

  measurements.forEach(async measurement => {
      const query = `from(bucket: "${Config.Influx.Bucket}")
        |> range(start: -300m)
        |> filter(fn: (r) => r["_measurement"] == "${measurement}")
        |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")`;
    
      const result = await queryAPI.collectRows(query);
    
      // Create a new workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Sheet1');
    
      // Add headers to the worksheet
      worksheet.addRow(['Datum', 'Artikelnummer', 'Anzahl', 'Preis', 'Stück pro Palette', 'Titel', 'Link']);
    
      type Record = {
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
    
      // Add data to the worksheet
      for await (const record of result) {
        const row: any[] = [
          new Date((record as Record)._time).toISOString(),
          (record as Record).sku,
          (record as Record).quantity,
          (record as Record).price,
          (record as Record).pcsPalette,
          (record as Record).title,
          (record as Record).url
        ];
        worksheet.addRow(row);
      }
    
      // Save the Excel file named with date, time (minutes and seconds)
      const filename = `./data/export-alle-${measurement}-${new Date().toISOString().slice(0, 16).replace(/:/g, "-")}.xlsx`;
      await workbook.xlsx.writeFile(filename);
  });



}