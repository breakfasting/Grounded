import * as PIXI from 'pixi.js';
import * as pako from 'pako';
import * as d3 from 'd3';

class Routes {
  constructor() {
    this.loader = PIXI.Loader.shared;
    const text = pako.ungzip(this.loader.resources.routes.data, { to: 'string' });
    this.list = d3.csvParse(text);
    console.log(this.list);
    // debugger
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
