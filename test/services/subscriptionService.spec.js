import SubscriptionService from
  '../../server/services/subscription/subscriptionService';
import EmailService from '../../server/services/email/emailService';
import app from '../../server/server';
import sinon from 'sinon';
import SUBSCRIPTIONS from '../fixtures/subscriptions';
import LASTDATAS from '../fixtures/lastDatas';

let should = require('chai').should();

describe('SubscriptionService.', () => {
  let Subscription = app.models.Subscription;
  let subscription1 = new Subscription(SUBSCRIPTIONS.subscription1);

  before(() => {
    sinon.stub(EmailService, 'send');
    sinon.stub(SubscriptionService, '_updateSubscriptionState');
  });

  it('notifySubscription', () => {
    should.exist(Subscription);
    should.exist(SUBSCRIPTIONS.subscription1);
    return SubscriptionService.notifySubscription(subscription1,
        LASTDATAS.MICEX)
      .then(() => {
        EmailService.send.calledOnce.should.equal(true);
        SubscriptionService._updateSubscriptionState.called.should.equal(true);
      });
  });
});
