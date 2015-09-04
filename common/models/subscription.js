import App from '../../server/services/App.js';

module.exports = (Subscription) => {
  Subscription.prototype.recalculateState = recalculateState;
  Subscription.prototype.recalculateAndUpdateState = recalculateAndUpdateState;
  Subscription.observe('before save', calculateFieldsForNew);
  /*e.g. in case percentChange option has change, or just first
   * time Subscription was added, we need to calculate minValue / maxValue
   * 'after save' is used for simplicity - instance available always
   */
  Subscription.observe('after save', recalculateAndUpdateStateForAPI);

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
    percent = percent > 0.1 ? percent : 0.1;
    percent = percent / 100;

    let minValue = value - percent * Math.abs(value);
    let maxValue = value + percent * Math.abs(value);

    if (this.state.minValue) {
      let minDiff = Math.abs(minValue - this.state.minValue);
      if (minDiff > 10 * Number.EPSILON) {
        this.state.minValue = minValue;
        changed = true;
      }
    } else {
      this.state.minValue = minValue;
      changed = true;
    }

    if (this.state.maxValue) {
      let maxDiff = Math.abs(maxValue - this.state.maxValue);
      if (maxDiff > 10 * Number.EPSILON) {
        this.state.maxValue = maxValue;
        changed = true;
      }
    } else {
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

  function recalculateAndUpdateStateForAPI(ctx) {
    if (!App.isWebRequest()) {
      return Promise.resolve();
    }
    return ctx.instance.recalculateAndUpdateState();
  }

  function recalculateAndUpdateState() {
    let subscription = this;
    let state = this.state;
    if (state.lastInformedValue !== undefined) {
      return updateIfNecessary(state.lastInformedValue);
    }

    //if we never informed user (new subscription) - let's use latest value
    let LastData = Subscription.app.models.LastData;
    return LastData.findById(this.dataId)
      .then((lastData) => updateIfNecessary(lastData.value));

    function updateIfNecessary(value) {
      let changed = subscription.recalculateState(value);
      return (changed) ? subscription.save() : Promise.resolve();
    }
  }
};
