import App from '../../server/services/App.js';

module.exports = (Subscription) => {
  Subscription.observe('before save', calculateFieldsForNew);

  function calculateFieldsForNew(ctx, next) {
    console.log('calculateFieldsForNew called');
    if (!ctx.isNewInstance || !App.isWebRequest()) {
      return next();
    }
    if (!ctx.instance.options) {
      ctx.instance.options = {};
    }

    if (!ctx.instance.options.percentChange) {
      ctx.instance.options.percentChange = 1;
    }
    App.getCurrentUser()
      .then((user) => {
        ctx.instance.userId = user.id;
        next();
      });
  }
};
