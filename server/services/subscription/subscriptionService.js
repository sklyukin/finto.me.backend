import EmailService from '../emailService';

import loopback from 'loopback';

let app = require('../../server');

class SubscriptionService {
  static notifySubscription(subscription, lastData) {
    return subscription.user.getAsync()
      .then((user) =>
        user.subscriptions.getAsync({
          include: 'lastData'
        })
        .then((subscriptions) => {
          subscriptions = subscriptions.filter(
            s => s.lastData() && s.lastData().value);
          if (user.email) {
            SubscriptionService.emailNotification({
              user, subscription, lastData, subscriptions
            });
          }
          let promises = subscriptions.map(
            SubscriptionService._updateSubscriptionState);
          return Promise.all(promises);
        })
      );
  }

  static emailNotification({
    user, subscription, lastData, subscriptions
  }) {
    let render = loopback.template(`${__dirname}/email/notification.ejs`);
    let html = render({
      subscriptions, user
    });
    EmailService.send({
      to: user.email,
      subject: `Уведомление: ${lastData.title}`,
      html: html
    });
  }

  //after user informed, let's update state
  static _updateSubscriptionState(subscription) {
    console.log('expected to be called');
    let value = subscription.lastData().value;
    subscription.state.lastInformedValue = value;
    subscription.state.lastInformedDate = new Date();
    let percent = subscription.options.percentChange;
    percent = percent ? percent : 1;
    //preventing spam, should be removed here in future
    percent = percent > 0.2 ? percent : 0.2;
    percent = percent / 100;
    subscription.state.minValue = value * (1 - percent);
    subscription.state.maxValue = value * (1 + percent);
    return subscription.save();
  }
}

export default SubscriptionService;
