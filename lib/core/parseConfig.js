const fs = require('fs-extra');
const path = require('path');

function mergeConfig(config) {
  let defaultConfig = {
    appName: 'jscms-application',
    appDesc: 'a jscms application',
    superEmail: 'test@jscms.top',
    superPassword: 'test',
    dbUser: '',
    dbPass: '',
    dbHost: '127.0.0.1',
    dbPort: '27017',
    dbName: 'jscms',
    nodePort: '7011'
  }
  for (const key in defaultConfig) {
    if (defaultConfig.hasOwnProperty(key)) {
      let newValue = config[key];
      if (newValue) {
        defaultConfig[key] = newValue;
      }
    }
  }
  return defaultConfig;
}

function getEgnlishKey(key) {
  return ({
    '应用名称': 'appName',
    '应用描述': 'appDesc',
    '网站管理员用户名（邮箱）': 'superEmail',
    '网站管理员密码': 'superPassword',
    'mongoodb主机（host）': 'dbHost',
    'mongoodb端口（port）': 'dbPort',
    'mongoodb数据库名(dbname)': 'dbName',
    'mongoodb数据库用户名（username）': 'dbUser',
    'mongoodb数据库密码（password）': 'dbPass',
    'nodejs服务端端口': 'nodePort'
  })[key];
}

function parseText(content) {
  if ( !content ) {
    return {};
  }
  let lines = content.split('\n');
  let config = {};
  lines.forEach(l => {
    if ( l[0] !== '#' ) {
      let tempArray = l.split("：");
      if ( tempArray.length === 2 ) {
        let key = getEgnlishKey(tempArray[0]);
        let value = tempArray[1];
        config[key] = value;
      }
    }
  });
  return config;
}

function getExistence(paths) {
  let exis = paths.map(p => {
    if ( fs.existsSync(p) ) {
      return p;
    }
  });
  return exis[0];
}

function getConfig(configPaths) {
  if ( typeof configPaths === 'string' ) {
    configPaths = [configPaths];
  }
  let paths = configPaths.map(p => path.resolve(p));
  let exisPath = getExistence(paths);
  let fileContent = "";
  if ( exisPath ) {
    fileContent = fs.readFileSync(exisPath, 'utf-8');
  }
  let config = {};
  try {
    config = JSON.parse(fileContent);
  } catch (e) {
    config = parseText(fileContent);
  }
  return mergeConfig(config);
}

function parseConfig(configPath) {
  const configPaths = configPath || ['./jscms.install.config.cn.txt', './jscms.install.config.json'];
  const config = getConfig(configPaths);
  return config;
}

module.exports = parseConfig;
