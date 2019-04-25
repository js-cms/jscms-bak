const modelman = require('modelman');
const mongoose = require('mongoose');

function requireModel(modelPath, name) {
  let model = new modelman.Model({
    name: name || undefined,
    displayName: name || undefined
  });
  let proto = require(modelPath);
  model.assign(proto);
  let mongooseSchema = model.to.mongoose(mongoose.Types)
  return mongooseSchema;
}

module.exports = requireModel;
