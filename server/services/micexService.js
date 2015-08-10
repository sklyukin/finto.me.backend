import Micex from 'micex.api';
import _ from 'lodash';

let ENGINES;
let ENGINE_AND_MARKETS = {};

class MicexService {
  static requestLastMarketdata() {
    let securities = {};
    let promises = [];
    for (let engine in ENGINE_AND_MARKETS) {
      let markets = ENGINE_AND_MARKETS[engine];
      for (let market of ENGINE_AND_MARKETS[engine]) {
        let promise = Micex.securitiesMarketdata(engine, market)
          .then((securitiesMarketdata) => {
            for (let security of Object.values(securitiesMarketdata)) {
              let id = security.node.id;
              /* we can have same securites from multiple markets, so let's
               * select with max volume
               */
              if (!securities[id] ||
                (securities[id].node.volume < security.node.volume)) {
                securities[id] = security;
              }
            }
          });
        promises.push(promise);
      }
    }
    return Promise.all(promises)
      .then(() => securities);
  }

  static getEngines() {
    return ENGINES;
  }

  static _fillMarketsForEngine(engine) {
    return Micex.markets(engine)
      .then(marketsDefinition => {
        let markets = marketsDefinition.map(market => market.NAME);
        ENGINE_AND_MARKETS[engine] = markets;
      });
  }

  static getConstansts() {
    return Micex.engines()
      .then((engines) => {
        ENGINES = engines;
        let promises = [];
        for (var engine of engines) {
          promises.push(MicexService._fillMarketsForEngine(engine.name));
        }
        return Promise.all(promises);
      })
      .then(() => {
        return ENGINE_AND_MARKETS;
      });
  }

}

export default MicexService;
