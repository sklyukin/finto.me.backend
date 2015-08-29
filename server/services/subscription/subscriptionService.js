import EmailService from '../email/emailService';
import loopback from 'loopback';
import _ from 'lodash';
import clone from 'clone';

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
              user, subscription, lastData,
              subscriptions: subscriptions.map(clone)
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
    return EmailService.send({
      html,
      to: user.email,
        subject: `Уведомление: ${lastData.title}`
    }).catch(err => console.error('emailNotification Error: ', err));
  }

  //after user informed, let's update state
  static _updateSubscriptionState(subscription) {
    let value = subscription.lastData().value;
    subscription.recalculateState(value);
    //seems a bug in strongloop, so we will remove manually
    delete subscription.__data.lastData;
    return subscription.save();
  }
}

export default SubscriptionService;
