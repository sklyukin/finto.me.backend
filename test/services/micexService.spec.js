
import app from '../../server/server';
import MicexService from '../../server/services/micexService';

let should = require('chai').should();

describe('MicexService', () => {
  before(() => {
    return MicexService.getConstansts();
  });

  it('Should requestLastMarketdata', function() {
    this.timeout(6000);
    return MicexService.requestLastMarketdata();
  });
});
