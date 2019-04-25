const fs = require('fs-extra');

let FILE_PACKAGE, FILE_CONFIG_DB, config;

function rwVar(string, keysObject) {
  for (const key in keysObject) {
    if (keysObject.hasOwnProperty(key)) {
      const defalutValue = keysObject[key];
      string = string.replace(`const ${key} = '${defalutValue}';`, `const ${key} = '${config[key]}';`);
    }
  }
  return string;
}

function owPackageJson() {
  let packageJson = JSON.parse(fs.readFileSync(FILE_PACKAGE, 'utf-8')); 
  packageJson.name = config.appName;
  packageJson.description = config.appDesc;
  packageJson.scripts.start = packageJson.scripts.start.replace('--port=7011', `--port=${config.nodePort}`);
  packageJson.scripts.stop = packageJson.scripts.stop.replace('--port=7011', `--port=${config.nodePort}`);
  fs.writeFileSync(FILE_PACKAGE, JSON.stringify(packageJson, null, 2));
}

function owDbJs() {
  let dbJs = fs.readFileSync(FILE_CONFIG_DB, 'utf-8');
  dbJs = rwVar(dbJs, {
    'dbUser': '',
    'dbPass': '',
    'dbHost': '127.0.0.1',
    'dbPort': '27017',
    'dbName': 'jscms'
  })
  fs.writeFileSync(FILE_CONFIG_DB, dbJs); 
}

function overwrittenConfig(projectFolderPath, _config) {
  FILE_PACKAGE = projectFolderPath + '/package.json';
  FILE_CONFIG_DB = projectFolderPath + '/config/db.js';
  config = _config;
  owPackageJson();
  owDbJs();
}

module.exports = overwrittenConfig;
