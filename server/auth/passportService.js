let loopback = require('loopback');
let url = require('url');
let FacebookStrategy = require('passport-facebook').Strategy;

export default function(app) {
  // Create an instance of PassportConfigurator with the app instance
  let PassportConfigurator =
    require('loopback-component-passport').PassportConfigurator;
  let passportConfigurator = new PassportConfigurator(app);


  // Load the provider configurations
  var config = {};
  try {
    config = require('../providers.json');
  } catch (err) {
    console.error('Please configure your passport strategy in' +
      '`providers.json`.');
    console.error('Copy `providers.json.template` to `providers.json` and  ' +
      'replace the clientID/clientSecret values with your own.');
    process.exit(1);
  }
  // Initialize passport
  let passport = passportConfigurator.init();

  // Set up related models
  passportConfigurator.setupModels({
    userModel: app.models.user,
    userIdentityModel: app.models.userIdentity,
    userCredentialModel: app.models.userCredential
  });
  // Configure passport strategies for third party auth providers
  for (var strategy in config) {
    var opts = config[strategy];
    opts.session = opts.session !== false;
    /* We can create a customCallback to set params on the callback url.
    // This will be called when the path is registered using
    // app.get("/callback/path", opts.customCallback);
    // inside passportConfigurator.configureProvider();
    // res, req, and next are passed in via express.*/
    opts.customCallback = customCallbackWrapper({strategy, opts, passport, app});

    passportConfigurator.configureProvider(strategy, opts);
  }
}

function customCallbackWrapper({strategy, opts, passport, app}) {
  const WEB_APP_URL = app.get('webApp').url;

  return (req, res, next) => {
    // Note that we have to only use variables that are in scope
    // right now, like opts.
    passport.authenticate(
      strategy, {
        session: false
      },
      //See http://passportjs.org/guide/authenticate/
      // err, user, and info are passed to this by passport
      function(err, user, info) {
        if (err) {
          return next(err);
        }
        if (!user) {
          // TODO - we might want to add some params here too for failures.
          return res.redirect(opts.failureRedirect);
        }
        // Add the tokens to the callback as params.
        var redirect = url.parse(WEB_APP_URL, true);

        // this is needed or query is ignored. See url module docs.
        delete redirect.search;

        redirect.query = {
          'access_token': info.accessToken.id,
          // Note the .toString here is necessary.
          'userId': user.id.toString()
        };
        // Put the url back together. It should now have params set.
        redirect = url.format(redirect);
        return res.redirect(redirect);
      }
    )(req, res, next);
  };
}
