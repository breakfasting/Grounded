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
    this.graphics = new PIXI.Graphics();
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
  draw(app, projection, flights) {
    // console.log('drawing')
    this.graphics.clear();
    // const graphics = new PIXI.Graphics();
    const path = d3.geoPath()
      .projection(projection)
      .context(this.graphics);

    const test1 = [25.325399398804, -80.274803161621];
    const test2 = [40.081902, -75.010597];
    const sample = this.list;

    // sample.forEach((route) => {
    //   path({ type: 'LineString', coordinates: route.coords });
    // });

    flights.forEach((flight) => {
      this.graphics.lineStyle(3, 0xFF6666, Math.min(0.05 * flight.value, 1));
      path({ type: 'LineString', coordinates: this.list[flight.key].coords });
    });
    // graphics.beginFill();
    // graphics.endFill();

    // app.stage.addChild(this.graphics);
  }
}

export default Routes;
