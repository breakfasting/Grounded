import * as PIXI from 'pixi.js';
import * as pako from 'pako';
import * as d3 from 'd3';

class Airports {
  constructor() {
    this.loader = PIXI.Loader.shared;
    const text = pako.ungzip(this.loader.resources.airports.data, { to: 'string' });
    this.list = this.processAirports(d3.csvParse(text));
    // console.log(this.list);
    // debugger
  }

  // eslint-disable-next-line class-methods-use-this
  processAirports(list) {
    return list.map(({
      lat, lon, country, ...data
    }, i) => ({
      ...data,
      index: i,
      coords: [lon, lat].map(parseFloat),
      country,
      // continent:
    }));
  }

  draw(app, projection) {
    const graphics = new PIXI.Graphics();
    graphics.lineStyle();
    graphics.beginFill(0xA45341, 1);
    const markerWidth = 4;
    // debugger;
    this.list.forEach((airport) => {
      const p = projection([airport.coords[0], airport.coords[1]]);
      const x = p[0] - markerWidth / 2;
      const y = p[1] - markerWidth / 2;
      graphics.drawRect(x, y, markerWidth, markerWidth);
    });
    app.stage.addChild(graphics);
  }
}

export default Airports;
