import EmailService from '../email/emailService';
import {SmsRuService} from '../../services/sms/SmsRuService';
import loopback from 'loopback';
import _ from 'lodash';
import clone from 'clone';

let app = require('../../server');
let Twilio = app.models.Twilio;

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

            let subscriptionsToUpdate = [];
            switch (subscription.type) {
              case "sms":
                if (user.phone) {
                  SubscriptionService.smsNotification({user, subscription, lastData});
                }
                subscriptionsToUpdate = [subscription];
                break;
              case "email":
                let emailSubscriptions =  subscriptions.filter(subscription => subscription.type === 'email');
                if (user.email) {
                  SubscriptionService.emailNotification({
                    user, subscription, lastData,
                    subscriptions: emailSubscriptions.map(clone)
                  });
                }
                subscriptionsToUpdate = emailSubscriptions;
                break;
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
      user,
      subject: `Уведомление: ${lastData.title}`
    }).catch(err => console.error('emailNotification Error: ', err));
  }

  static smsNotification({user, subscription, lastData}) {
    return SmsRuService.send(user.phone, `${lastData.title} ${lastData.value}`);
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
