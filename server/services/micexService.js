import Micex from 'micex.api';
import _ from 'lodash';

let ENGINES;
let ENGINE_AND_MARKETS = {};
let MICEX_CONSTANTS = null;

class MicexService {
  /* jshint -W106 */
  static requestLastMarketdata() {
    let securities = {};
    let promises = MICEX_CONSTANTS.markets.map((row) => {
      let engine = row.trade_engine_name;
      let market = row.market_name;
        //we skip REPO market, as it intersect with shares
      if (market === 'ccp'){
        return Promise.resolve();
      }
      return Micex.securitiesMarketdata(engine, market)
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
    });
    /* jshint +W106 */
    return Promise.all(promises)
      .then(() => securities);
  }

  static getConstansts() {
    if (MICEX_CONSTANTS) return Promise.resolve(MICEX_CONSTANTS);
    return Micex.index()
      .then((constants) => MICEX_CONSTANTS = constants);
  }

}

export default MicexService;
