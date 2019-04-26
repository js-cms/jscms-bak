const modelman = require('modelman');
const mongoose = require('mongoose');

function parseProto(proto, name) {
  let model = new modelman.Model({
    name: name || undefined,
    displayName: name || undefined
  });
  model.assign(proto);
  let mongooseSchema = model.to.mongoose(mongoose.Types)
  return mongooseSchema;
}

module.exports = parseProto;
