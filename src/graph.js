import * as PIXI from 'pixi.js';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import Airports from './airports';
import Routes from './routes';

class Graph {
  constructor() {
    const canvas = document.getElementById('mycanvas');
    this.app = new PIXI.Application({
      view: canvas,
      width: window.innerWidth,
      height: window.innerHeight,
    });
    this.loader = PIXI.Loader.shared;

    this.extent = [[0, 0], [window.innerWidth, window.innerHeight]];
    this.graphics = new PIXI.Graphics();

    this.projection = d3.geoNaturalEarth1();
    // this.projection = d3.geoOrthographic();
    this.pathGenerator = d3.geoPath()
      .projection(this.projection)
      .context(this.graphics);
  }

  load() {
    this.loader.add('airports', 'dist/assets/airports.csv.gz', { xhrType: 'arraybuffer' });
    this.loader.add('routes', 'dist/assets/routes.csv.gz', { xhrType: 'arraybuffer' });
    this.loader.on('progress', (loader) => {
      console.log(`${loader.progress}% loaded`);
    })
      .load(() => {
        this.draw();
        this.airports = new Airports();
        this.routes = new Routes(this.airports.list);
      });
  }

  draw() {
    d3.json('https://unpkg.com/world-atlas@1.1.4/world/110m.json')
      .then((data) => {
        this.countries = feature(data, data.objects.countries);
        // console.log(this.countries);


        this.projection.fitExtent(this.extent, this.countries);

        this.graphics.beginFill(0xf7f7f7, 1);
        this.graphics.lineStyle(1, 0xcccccc, 1);
        this.pathGenerator(this.countries);
        this.graphics.endFill();

        this.app.stage.addChild(this.graphics);
        this.airports.draw(this.app, this.projection);
      });
  }
}

export default Graph;
