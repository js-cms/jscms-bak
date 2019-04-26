const mongoose = require('mongoose');

function dbConnect(uri) {
  // let { dbUser, dbPass, dbHost, dbPort, dbName } = config;
  // let dbType = 'mongodb';
  // let parameter = 'authSource=admin';
  // let uri = `${dbType}://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}?${parameter}`;
  return mongoose.connect(uri, {
    useNewUrlParser: true
  });
}

module.exports = dbConnect;
