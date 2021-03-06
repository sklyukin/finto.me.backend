import MicexService from '../../services/micexService';

export default (app) => {
  MicexService.getConstansts()
    .then(regularRequestData);

  function regularRequestData() {
    requestAndSaveData().then(() => {
      let delayMinutes = 1;
      setTimeout(regularRequestData, delayMinutes * 60 * 1000);
    });
  }

  function requestAndSaveData() {
    return MicexService.requestLastMarketdata()
      .then((data) => {
        let LastData = app.models.LastData;
        let values = Object.values(data);
        console.log('Micex data received, length: ', values.length);
        let lastDatas = values.map((security) => {
          return new LastData({
            dataId: security.node.id,
            value: security.node.last,
            title: security.node.friendlyTitle,
            data: security
          });
        });
        console.log('starting saving Micex data');
        let promises = lastDatas.map(lastData => LastData.upsert(lastData));
        return Promise.all(promises);
      })
      .then(() => {
        let time = new Date();
        console.log(`${time} Micex data saved`);
      })
      .catch((error) => {
        console.log('Micex update error occured');
        console.error(error);
      });
  }
};
