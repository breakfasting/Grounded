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
        interpolate: d3.geoInterpolate(...coords),
      };
    });
  }

  // eslint-disable-next-line class-methods-use-this
  draw(app, projection) {
    const graphics = new PIXI.Graphics();
    const path = d3.geoPath()
      .projection(projection)
      .context(graphics);

    const test1 = [25.325399398804, -80.274803161621];
    const test2 = [40.081902, -75.010597];

    // graphics.beginFill();
    graphics.lineStyle(1, 0xFF6666, 1);
    path({type: 'LineString', coordinates: [[0.1278, 51.5074], [-74.0059, 40.7128]]});
    // graphics.endFill();

    app.stage.addChild(graphics);
  }
}

export default Routes;
