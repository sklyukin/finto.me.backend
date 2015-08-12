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
          let value = lastData.value;
          if (user.email) {
            SubscriptionService.emailNotification({
              user, subscription, lastData, subscriptions
            });
          }
          subscription.state.lastInformedValue = value;
          let percent = subscription.options.percentChange;
          if (percent) {
            percent = percent / 100;
            subscription.state.minValue = value * (1 - percent);
            subscription.state.maxValue = value * (1 + percent);
          }
          return subscription.save();
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
}

export default SubscriptionService;
