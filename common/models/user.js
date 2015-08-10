import timestampBehavior from '../behaviors/timestamps.js';

module.exports = (user) => {
   user.observe('before save', timestampBehavior);
};
