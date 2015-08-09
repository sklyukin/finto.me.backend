import timestampBehavior from '../behaviors/timestamps.js'

module.exports = (NotifyBaseModel) => {
  NotifyBaseModel.observe('before save', timestampBehavior);
};
