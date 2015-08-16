import SubscriptionService from
  '../../services/subscription/subscriptionService';
import EmailService from '../../services/email/emailService';

export default (app) => {
  let LastData = app.models.LastData;
  let Subscription = app.models.Subscription;
  requestAndProceedLastData();

  function requestAndProceedLastData() {
    LastData.find()
      .then((lastDatas) => {
        let stack = lastDatas;
        return proceedDataOneByOnePromise(stack);
      })
      .then(() => {
        console.log('all notifyLoop data proceeded');
        setTimeout(requestAndProceedLastData, 60 * 1000);
      });
  }



  function proceedDataOneByOnePromise(stack) {
    return new Promise((resolve, reject) => {
      proceedDataOneByOne(stack, resolve);
    });
  }

  /* we will use one by one, to be able correctly aggregate emails
  /* (info) per one user
  */
  function proceedDataOneByOne(stack, cb) {
    if (!stack.length) return cb();
    let lastData = stack.pop();
    // maybe data was already updated, so let's use most actual data
    LastData.findById(lastData.dataId)
      .then((lastData) => {
        proceedSubscriptionsForData(lastData)
          .then(() => {
            setTimeout(() => {
              proceedDataOneByOne(stack, cb);
            });
          });
      });
  }


  function proceedSubscriptionsForData(lastData) {
    let value = lastData.value;
    return Subscription.find({
        where: {
          dataId: lastData.dataId,
          or: [{
            'state.maxValue': {
              'lte': value
            }
          }, {
            'state.minValue': {
              'gte': value
            }
          }]
        }
      })
      .then((subscriptions) => {
        if (subscriptions.length) {
          console.log(`Found ${subscriptions.length} subscriptions`);
          for (let subscription of subscriptions) {
            console.log('Subscription', subscription);
            return SubscriptionService.notifySubscription(subscription,
              lastData);
          }
        }
        return null;
      })
      .catch((error) => {
        console.log('we have an error');
        console.log(error);
      });
  }
};
