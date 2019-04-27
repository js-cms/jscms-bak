const mongoose = require('mongoose');

function dbConnect(uri) {
  return mongoose.connect(uri, {
    useNewUrlParser: true
  });
}

module.exports = dbConnect;
