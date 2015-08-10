import SubscriptionService from '../../server/services/subscriptionService';
import EmailService from '../../server/services/emailService';
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
    sinon.stub(subscription1, 'save');
  });

  it('notifySubscription', () => {
    should.exist(Subscription);
    should.exist(SUBSCRIPTIONS.subscription1);
    SubscriptionService.notifySubscription(subscription1, LASTDATAS.MICEX);
    EmailService.send.calledOnce.should.equal(true);
    subscription1.save.calledOnce.should.equal(true);
  });
});
