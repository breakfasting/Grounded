import * as PIXI from 'pixi.js';
import * as pako from 'pako';
import * as d3 from 'd3';
import crossfilter from 'crossfilter2';
import { feature } from 'topojson-client';
import Airports from './airports';
import Routes from './routes';
import Flights from './flights';
import timeSeriesChart from './timeSeriesChart';

class Graph {
  constructor() {
    const canvas = document.getElementById('mycanvas');
    this.app = new PIXI.Application({
      view: canvas,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0xDDDDDD,
    });
    this.loader = PIXI.Loader.shared;

    this.extent = [[0, 0], [window.innerWidth, window.innerHeight]];
    this.graphics = new PIXI.Graphics();

    this.projection = d3.geoNaturalEarth1();
    // this.projection = d3.geoOrthographic();
    this.pathGenerator = d3.geoPath()
      .projection(this.projection)
      .context(this.graphics);

    this.chartTimeline = timeSeriesChart()
      .width(1500)
      .x((d) => d.key)
      .y((d) => d.value);

    this.chartTimeline.onBrushed((selected) => {
      this.flights.csData.dimTime.filter(selected);
      // console.log(this.csData.flightByRoute.all())
      this.draw();
    });
  }

  load() {
    this.loader.add('airports', 'dist/assets/airports.csv.gz', { xhrType: 'arraybuffer' });
    this.loader.add('routes', 'dist/assets/routes.csv.gz', { xhrType: 'arraybuffer' });
    // this.loader.add('flights', 'dist/assets/flights_week_16.csv.gz', { xhrType: 'arraybuffer' });
    Flights.load(this.loader);
    this.loader.on('progress', (loader) => {
      console.log(`${loader.progress}% loaded`);
    })
      .load(() => {
        this.airports = new Airports();
        this.routes = new Routes(this.airports.list);
        // this.flights = pako.ungzip(this.loader.resources.flights1.data, { to: 'string' });

        // const flights = d3.csvParse(this.flights);
        // const mappedFlights = flights.map((ele) => ({
        //   day: Math.floor(parseFloat(ele.disembark) / 24),
        //   route: parseInt(ele.route, 10),
        // }));

        // this.csData = crossfilter(mappedFlights);
        this.flights = new Flights();
        

        this.drawMap();
      });
  }

  drawMap() {
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
        this.flights.initFlights(this.loader);
        d3.select('#timeline')
          .datum(this.flights.csData.timesByHour.all())
          .call(this.chartTimeline);

        this.app.stage.addChild(this.routes.graphics);
        this.draw();
      });
  }

  draw() {
    this.routes.draw(this.app, this.projection, this.flights.csData.flightByRoute.all());
  }
}

export default Graph;
