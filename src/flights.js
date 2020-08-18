import * as pako from 'pako';
import * as d3 from 'd3';
import crossfilter from 'crossfilter2';

class Flights {
  constructor() {
    this.csData = crossfilter();
  }

  static load(loader) {
    for (let i = 1; i <= 18; i += 1) {
      loader.add(`flights${i}`, `dist/assets/flights_week_${i}.csv.gz`, { xhrType: 'arraybuffer' });
    }
  }

  initFlights(loader) {
    for (let i = 1; i <= 18; i += 1) {
      const rawData = pako.ungzip(loader.resources[`flights${i}`].data, { to: 'string' });
      const data = d3.csvParse(rawData, (row) => ({
        day: Math.floor(parseFloat(row.disembark) / 24),
        route: parseInt(row.route, 10),
      }));

      this.csData.add(data);
      console.log('added', i)
    }

    this.csData.dimTime = this.csData.dimension((d) => d.day);
    this.csData.dimRoute = this.csData.dimension((d) => d.route);

    this.csData.timesByHour = this.csData.dimTime.group();
    this.csData.flightByRoute = this.csData.dimRoute.group();
  }
}

export default Flights;
