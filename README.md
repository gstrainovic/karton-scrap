- install influxdata
- insall nodejs
- run influxdb
- create bucket
- save the token to src/secrets.ts
- npm run start:dev

# show all scraps
from(bucket: "scrap")
|> range(start: v.timeRangeStart, stop: v.timeRangeStop)
|> filter(fn: (r) => r["_measurement"] == "ecoon.de")
|> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")

# show the scraps from past 24m
from(bucket: "scrap")
|> range(start: -24m, stop: v.timeRangeStop)
|> filter(fn: (r) => r["_measurement"] == "ecoon.de")
|> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")

# find differences
from(bucket: "scrap")
|> range(start: -365d)
|> filter(fn: (r) => r._measurement == "www.karton.eu")
|> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
|> group(columns: ["sku", "quantity"])
|> difference(columns: ["price"])
|> filter(fn: (r) => r.price > 0)


    