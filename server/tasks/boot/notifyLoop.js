import SubscriptionService from
  '../../services/subscription/subscriptionService';
import EmailService from '../../services/email/emailService';
import co from 'co';

export default (app) => {
  let LastData = app.models.LastData;
  let Subscription = app.models.Subscription;
  requestAndProceedLastData();

  function requestAndProceedLastData() {
    co(function*(){
      let hourAgo = new Date(new Date() - 60 * 60 * 1000);
      try {
	console.log('notifyLoop start');
	let lastDatas = yield LastData.find({where: {updated: {gt: hourAgo}}});
	let stack = yield filterNotActualDataIds(lastDatas);
	yield proceedDataOneByOnePromise(stack);
	console.log('all notifyLoop data proceeded');
      }
      catch(error){
	console.log('notifyLoop error occured');
	console.error(error);
      }
      let delay = 1 * 60 * 1000;
      setTimeout(requestAndProceedLastData, delay);
    });
  }
  
  function filterNotActualDataIds(lastDatas){
    // works efficently when users number much less than securities number
    return co(function*(){
      console.log('recently updated securities', lastDatas.length);
      let collection = Subscription.dataSource.connector.collection('Subscription');
      let dataIds = yield collection.distinct('dataId');
      console.log('recently updated securities after unused filter', dataIds.length);
      return dataIds;
    });
  }

  function proceedDataOneByOnePromise(stack) {
    console.log('starting proceeding stack', stack.length);
    return new Promise((resolve, reject) => {
      proceedDataOneByOne(stack, resolve);
    });
  }

  /* we will use one by one, to be able correctly aggregate emails
  /* (info) per one user
  */
  function proceedDataOneByOne(stack, cb) {
    co(function*(){
      if (!stack.length) return cb();
      if (stack.length%100===0)
	console.log('left to proceed for notifications', stack.length);
      let dataId = stack.pop();
      // maybe data was already updated, so let's use most actual data
      let lastData = yield LastData.findById(dataId)
      yield proceedSubscriptionsForData(lastData)
      setTimeout(() => { proceedDataOneByOne(stack, cb); });
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
          let promises = [];
          for (let subscription of subscriptions) {
            console.log('Subscription', subscription);
            promises.push(SubscriptionService.notifySubscription(subscription,
              lastData));
          }
          return Promise.all(promises);
        }
        return null;
      })
      .catch((error) => {
        console.log('we have an error');
        console.log(error);
      });
  }
};
