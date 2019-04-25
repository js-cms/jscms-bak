const fs = require('fs-extra');

module.exports = function requireJSON(path) {
  try {
    return fs.readJSONSync(path);
  } catch(e) {
    return {};
  }
}
