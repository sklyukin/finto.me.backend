import timestampBehavior from '../behaviors/timestamps.js'

module.exports = (User) => {
   User.observe('before save', timestampBehavior);
};
