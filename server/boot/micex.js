import micexService from '../services/micexService';
export default (server) => {
  micexService.getConstansts()
    .then((engineAndMarkets) => {
      console.log(engineAndMarkets);
    })
}
