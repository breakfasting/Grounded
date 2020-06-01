import * as PIXI from 'pixi.js';
import * as pako from 'pako';

class Airports {
  constructor() {
    this.loader = PIXI.Loader.shared;
    this.list = pako.ungzip(this.loader.resources.airports.data, { to: 'string' });
    // debugger
  }

  // unzip(data) {
  //   this.loader.resources.data
  // }
}

export default Airports;
