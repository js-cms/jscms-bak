const fs = require('fs-extra');
const chalk = require('chalk');
const bcrypt = require('bcryptjs');

const requireJSON = require('../util/requireJSON');
const requireModel = require('../util/requireModel');
const log = require('./log');
const DB_DIR = __dirname + '/../data/';

let config = {};

function getHandler(modelName) {
  return {
    'User': function(data) {
      data[0].email = config.superEmail;
      data[0].password = bcrypt.hashSync(config.superPassword, 10);
      return data;
    }
  }[modelName];
}

function readData(mongoose, projectFolderPath) {
  let jsonsArray = fs.readdirSync(DB_DIR);
  let store = [];
  jsonsArray.forEach((fileName) => {
    let data = requireJSON(DB_DIR + fileName);
    let mongooseSchema = requireModel(projectFolderPath + '/app/model/proto/' + data.name.toLowerCase() + '.js', data.name.toLowerCase());
    let mongooseModel = mongoose.model(data.name, new mongoose.Schema(mongooseSchema));
    let handler = getHandler(data.name);
    store.push({
      name: data.name,
      data: handler ? handler(data.data) : data.data,
      model: mongooseModel
    });
  });
  return store;
}

async function initData(mongoose, projectFolderPath, _config) {
  config = _config;
  let store = readData(mongoose, projectFolderPath);
  for (let index = 0; index < store.length; index++) {
    const item = store[index];
    const name = item.name;
    const data = item.data;
    await item.model.insertMany(data);
    log('info', `The initialization data of '${chalk.blue(name)}' is inserted.`, 4);
  }
}

module.exports = initData;
