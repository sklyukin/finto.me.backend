let path = require('path'),
  _ = require('lodash');

let app = require(path.resolve(__dirname, '../server'));

let dataSource = app.dataSources.mongo;


function simpleLoad(SingleModelName, pluralModelName) {
  console.log(`Starting uploading ${pluralModelName}`);
  const MODELS = require(`./fixtures/${pluralModelName}`);
  let Model = app.models[SingleModelName];
  let values = _.values(MODELS);
  let promises = values.map(data => {
    return Model.create(data);
  });
  return Promise.all(promises)
    .then(() => console.log(`${pluralModelName}' fixtures are loaded`))
    .catch((err) => console.log(`Error: ${err}`));
}

dataSource.automigrate('Everything', () => {
  simpleLoad('User', 'users')
    .then(() => simpleLoad('Subscription', 'subscriptions'));
});
