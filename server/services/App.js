let loopback = require('loopback'),
  app = require('../../server/server');

class App {
  static isWebRequest() {
    return loopback.getCurrentContext() ? true : false;
  }

  static getCurrentUser() {
    let User = app.models.User;
    let context = loopback.getCurrentContext();
    if (!context) {
      //so it is console app.
      return Promise.resolve(null);
    }
    let userId = context.get('accessToken').userId;
    if (!userId) {
      return Promise.resolve(null);
    }
    return User.findById(userId);
  }
}

export default App;
