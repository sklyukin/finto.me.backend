// In node.js env, polyfill might be already loaded (from any npm package),
// that's why we do this check.
if (!global._babelPolyfill) {
  require('babel/register');
}
var loopback = require('loopback');
var boot = require('loopback-boot');

var app = module.exports = loopback();
app.set('view engine', 'jade');

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    console.log('Web server listening at: %s', app.get('url'));
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module) {
    app.start();
    var path = __dirname + '/tasks';
    console.log('will load path', path);
    boot(app, path, function(err) {
      if (err) throw err;
    });
  }
});
