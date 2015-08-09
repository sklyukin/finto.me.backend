import Micex from 'micex.api';

let ENGINES;
let ENGINE_AND_MARKETS = {};

class micexService {
  static requestLastMarketdata() {}


  static getEngines() {
    return ENGINES;
  }

  static _fillMarketsForEngine(engine) {
    return Micex.markets(engine)
      .then(markets => ENGINE_AND_MARKETS[engine] = markets);
  }

  static getConstansts() {
    return Micex.engines()
      .then((engines) => {
        ENGINES = engines
        let promises = [];
        for (var engine of engines) {
          promises.push(micexService._fillMarketsForEngine(engine.name));
        }
        return Promise.all(promises);
      })
      .then(() => {
        return ENGINE_AND_MARKETS;
      });
  }
}

export default micexService;
