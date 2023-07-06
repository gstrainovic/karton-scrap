- install influxdata
- run influxdb
- create bucket
- save the token to secrets.toml
- start build/run.sh

# shopw the scraps
from(bucket: "scrap")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["_measurement"] == "ecoon.de")
  |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")