import micexService from '../services/micexService';

export default (server) => {
  micexService.getConstansts()
    .then((engineAndMarkets) => {
      micexService.requestLastMarketdata()
        .then( (data) => {
            console.log('data received, lenght: ', Object.values(data).length);
            console.log('USD QUOTE', data.USD000UTSTOM.node.last);
        });
    })
}
