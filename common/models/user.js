import timestampBehavior from '../behaviors/timestamps.js';
import App from '../../server/services/App.js';

module.exports = (user) => {
  user.observe('before save', timestampBehavior);
  user.observe('after save', addDefaultSubscriptions);

  function addDefaultSubscriptions(ctx) {
    //as passwortjs not web request by this check, let's add NODE_ENV
    if (!ctx.isNewInstance || (!App.isWebRequest() && (process.env.NODE_ENV == 'test'))) {
      return Promise.resolve();
    }
    let Subscription = user.app.models.Subscription;

    let defaultSubscriptions = [
      {dataId: 'USD000UTSTOM'},
      {dataId: 'RTSI'},
      {dataId: 'MICEXINDEXCF'},
      {dataId: 'SBER'}
    ];

    let userId = ctx.instance.id;
    let promises = defaultSubscriptions.map((data) => {
      data.userId = userId;
      return Subscription.create(data).then((subscription) => {
        return subscription.recalculateAndUpdateState();
      })
    });
    return Promise.all(promises);
  }
};
