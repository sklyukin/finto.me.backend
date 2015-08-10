import EmailService from '../services/emailService';

class SubscriptionService {
  static notifySubscription(subscription, lastData) {
    let value = lastData.value;
    EmailService.send({
      to: 'stas.msu@gmail.com',
      subject: 'Finance Alert',
      html: `Hey! <b>${subscription.dataId}</b> reached <b>${value}</b>!`
    });

    subscription.state.lastInformedValue = value;
    let percent = subscription.options.percentChange;
    if (percent) {
      percent = percent / 100;
      subscription.state.minValue = value * (1 - percent);
      subscription.state.maxValue = value * (1 + percent);
    }
    return subscription.save();
  }
}

export default SubscriptionService;
