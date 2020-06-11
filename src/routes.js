import * as PIXI from 'pixi.js';
import * as pako from 'pako';
import * as d3 from 'd3';

class Routes {
  constructor(airports) {
    this.loader = PIXI.Loader.shared;
    const text = pako.ungzip(this.loader.resources.routes.data, { to: 'string' });
    this.airports = airports;
    this.avgFlightSpeedKph = 850;
    this.routeTypeMap = {
      domestic: 1,
      international: 2,
      intercontinental: 3,
    };
    this.list = this.processRoutes(d3.csvParse(text));
    console.log(this.list);
  }

  processRoutes(list) {
    console.log(this.airports);
    return list.map(({
      distance, key, from, to,
    }, i) => {
      const embark = this.airports[from];
      const disembark = this.airports[to];
      const coords = [embark.coords, disembark.coords];
      let type = this.routeTypeMap.domestic;
      if (embark.country !== disembark.country) {
        type = this.routeTypeMap.international;
      }
      // if (embark.continent !== disembark.continent) {
      //   type = this.routeTypeMap.intercontinental;
      // } else if (embark.country !== disembark.country) {
      //   type = this.routeTypeMap.international;
      // }
      const dist = parseInt(distance, 10);
      const time = dist / this.avgFlightSpeedKph;
      return {
        id: key,
        index: i,
        time,
        type,
        coords,
        from,
        to,
        distance: dist,
        // interpolate: d3.geoInterpolate(...coords),
      };
    });
  }

  draw(app, projection) {
    const graphics = new PIXI.Graphics();
    graphics.lineStyle();
    graphics.beginFill(0xA45341, 1);
    const markerWidth = 4;
    // debugger;
    this.list.forEach((airport) => {
      const p = projection([airport.lon, airport.lat]);
      const x = p[0] - markerWidth / 2;
      const y = p[1] - markerWidth / 2;
      graphics.drawRect(x, y, markerWidth, markerWidth);
    });
    app.stage.addChild(graphics);
  }
}

export default Routes;
