
import app from '../../server/server';
import MicexService from '../../server/services/micexService';

let should = require('chai').should();

describe('MicexService', () => {
  before( () => MicexService.getConstansts());

  it('Should requestLastMarketdata', function() {
    this.timeout(20000);
    return MicexService.requestLastMarketdata()
      .then( (securities) => {
        let rows = Object.values(securities);
        rows.should.have.length.least(100);
      });
  });
});
