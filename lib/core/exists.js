const fs = require('fs-extra');
const chalk = require('chalk');

const log = require('./log');

/**
 * @description 检查必要文件是否存在
 */
module.exports = function exists(path) {
  if (!fs.existsSync(path.folderName)) {
    log('error', `The specified path ${chalk.green(path.folderName)} does not exist.`);
  }
  if (!fs.existsSync(path.app)) {
    log('error', `The path ${chalk.green(path.app)} to the application does not exist.`);
  }
  if (!fs.existsSync(path.config)) {
    log('error', `The application's configuration file path ${chalk.green(path.config)} does not exist.`);
  }
  if (!fs.existsSync(path.configDB)) {
    log('error', `The database configuration file ${chalk.green(path.configDB)} does not exist`);
  }
  if (!fs.existsSync(path.appUpload)) {
    log('error', `The upload folder ${chalk.green(path.appUpload)} does not exist.`);
  }
  if (!fs.existsSync(path.modelman)) {
    log('error', `The model file ${chalk.green(path.modelman)} does not exist`);
  }
}
