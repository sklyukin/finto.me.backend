import App from '../../server/services/App.js';

module.exports = (Subscription) => {
  Subscription.prototype.recalculateState = recalculateState;
  Subscription.observe('before save', calculateFieldsForNew);
  /*e.g. in case percentChange option has change, or just first
   * time Subscription was added, we need to calculate minValue / maxValue
   * 'after save' is used for simplicity - instance available always
   */
  Subscription.observe('after save', recalculateStateForAPI);

  //update state to last informed value
  function recalculateState(value) {
    let changed = false;
    if (value !== this.state.lastInformedValue) {
      this.state.lastInformedValue = value;
      this.state.lastInformedDate = new Date();
      changed = true;
    }
    let percent = this.options.percentChange;
    //preventing spam, should be removed here in future
    percent = percent > 0.2 ? percent : 0.2;
    percent = percent / 100;

    let minValue = value - percent * Math.abs(value);
    let maxValue = value + percent * Math.abs(value);

    let minDiff = Math.abs(minValue - this.state.minValue);
    let maxDiff = Math.abs(maxValue - this.state.maxValue);

    if (minDiff > 10 * Number.EPSILON) {
      this.state.minValue = minValue;
      changed = true;
    }

    if (maxDiff > 10 * Number.EPSILON) {
      this.state.maxValue = maxValue;
      changed = true;
    }
    return changed;
  }

  function calculateFieldsForNew(ctx, next) {
    if (!ctx.isNewInstance) {
      return next();
    }
    let instance = ctx.instance;
    instance.state = instance.state || {};
    instance.options = instance.options || {};
    instance.options.percentChange = instance.options.percentChange || 1;


    if (!App.isWebRequest()) {
      return next();
    }
    App.getCurrentUser()
      .then((user) => {
        instance.userId = user.id;
        next();
      });
  }

  function recalculateStateForAPI(ctx, next) {
    if (!App.isWebRequest()) {
      return next();
    }
    let instance = ctx.instance;
    let state = instance.state;
    if (state.lastInformedValue !== undefined) {
      updateIfNeccessary(state.lastInformedValue);
      return;
    }

    //if we never informed user (new subscription) - let's use latest value
    let LastData = Subscription.app.models.LastData;
    LastData.findById(instance.dataId)
      .then((lastData) => {
        updateIfNeccessary(lastData.value);
        return;
      });

    function updateIfNeccessary(value) {
      let changed = instance.recalculateState(value);
      if (changed) {
        instance.save().then(() => {
          next();
        });
      } else {
        next();
      }
    }
  }
};
