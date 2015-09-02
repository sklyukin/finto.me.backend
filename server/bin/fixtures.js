import _ from 'lodash';
import app from '../server';
import fs from 'fs';

let dataSource = app.dataSources.mongo;

function pathToFixtures() {
  switch (process.env.NODE_ENV) {
    case 'test':
      return '../../test/fixtures';
    default:
      return './fixtures';
  }
}
const PATH = __dirname + '/' + pathToFixtures();

function simpleLoad(SingleModelName, pluralModelName) {
  console.log(`Starting uploading ${pluralModelName}`);
  let path = `${PATH}/${pluralModelName}.json`;
  if (!fs.existsSync(path)) {
    return Promise.resolve();
  }

  const MODELS = require(path);
  let values = _.values(MODELS);
  let Model = app.models[SingleModelName];
  return Model.destroyAll().then(() => {
    let promises = values.map(data => Model.create(data));
    return Promise.all(promises)
      .then(() => console.log(`${pluralModelName}' fixtures are loaded`))
      .catch((err) => console.log(`Error: ${err}`));
  });
}

dataSource.automigrate(['user', 'userIdentity', 'Subscriptions', 'LastData' ], () => {
  simpleLoad('user', 'users')
    .then(() => simpleLoad('userIdentity', 'userIdentities'))
    .then(() => simpleLoad('Subscription', 'subscriptions'))
    .then(() => simpleLoad('LastData', 'lastDatas'))
    .then(() => {
      process.exit();
    });
});
