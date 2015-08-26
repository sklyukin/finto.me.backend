import app from '../../server/server';
import SUBSCRIPTIONS from '../fixtures/subscriptions';
import LASTDATAS from '../fixtures/lastDatas';

let should = require('chai').should();

describe('Subscription', () => {
  let Subscription = app.models.Subscription;
  let subscription1 = new Subscription(SUBSCRIPTIONS.subscription1);

  it('recalculateState', () => {
    subscription1.recalculateState(10);
    let percentChange = subscription1.options.percentChange;
    let maxValue = 10 * (1 + percentChange / 100);
    let diff = Math.abs(subscription1.state.maxValue - maxValue);
    //so they should be equal
    diff.should.lt(0.0001);
  });
});
