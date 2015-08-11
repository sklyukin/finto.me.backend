import EmailService from './emailService';

class SubscriptionService {
  static notifySubscription(subscription, lastData) {
    return subscription.user.getAsync()
      .then((user) => {
        let value = lastData.value;
        if (user.email) {
          EmailService.send({
            to: user.email,
            subject: 'Finance Alert',
            html: `<b>${lastData.title}</b> достиг <b>${value}</b>!`
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
      });
  }
}

export default SubscriptionService;
