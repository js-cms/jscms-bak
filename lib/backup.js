const path = require('path');
const moment = require('moment');
const chalk = require('chalk');
const fs = require('fs-extra');

const constant = require('./core/const');
const log = require('./core/log');
const dbConnect = require('./core/dbConnect');
const parseProto = require('./util/parseProto');
const parsePath = require('./core/parsePath');
const exists = require('./core/exists');

/**
 * @description 备份系统
 */
class Backup {
  constructor(options = {
    folderName: '.',
    options: {}
  }) {
    this.fullFolderName = path.resolve(options.folderName);
    this.options = options.options;
    this.path = parsePath(this.fullFolderName);
    //检查必要文件是否存在
    exists(this.path);
    //开始备份
    this.startBackup();
  }

  /**
   * @description 开始备份
   */
  async startBackup() {
    //备份上传资源文件夹
    this.backupUpload();
    //备份数据到json
    await this.backupDatabase();
    process.exit(1);
  }

  /**
   * @description 检查必要文件是否存在
   */
  exists() {
    console.log(this.path);
    if (!fs.existsSync(this.path.folderName)) {
      log('error', `The specified path ${chalk.green(this.path.folderName)} does not exist.`);
    }
    if (!fs.existsSync(this.path.app)) {
      log('error', `The path ${chalk.green(this.path.app)} to the application does not exist.`);
    }
    if (!fs.existsSync(this.path.config)) {
      log('error', `The application's configuration file path ${chalk.green(this.path.config)} does not exist.`);
    }
    if (!fs.existsSync(this.path.configDB)) {
      log('error', `The database configuration file ${chalk.green(this.path.configDB)} does not exist`);
    }
    if (!fs.existsSync(this.path.appUpload)) {
      log('error', `The upload folder ${chalk.green(this.path.appUpload)} does not exist.`);
    }
    if (!fs.existsSync(this.path.modelman)) {
      log('error', `The model file ${chalk.green(this.path.modelman)} does not exist`);
    }
  }

  /**
   * @description 备份上传资源文件夹
   */
  backupUpload() {
    let targetDir = path.join(this.fullFolderName, 'bak/upload');
    log('info', `Backup resource file`);
    log('processing', `Remove folder ${chalk.green(targetDir)}.`, 4);
    fs.removeSync(targetDir);
    log('processing', `Copy ${chalk.green(this.path.appUpload)} to ${chalk.green(targetDir)}.`, 4);
    fs.copySync(this.path.appUpload, targetDir);
    log('done', 'Resource file backup completed.', 2);
    console.log('\n');
  }

  /**
   * @description 备份数据到json
   */
  async backupDatabase() {
    let targetDir = path.join(this.fullFolderName, 'bak/database');
    log('info', `Backup database`);
    log('processing', `Remove folder ${chalk.green(targetDir)}.`, 4);
    fs.removeSync(targetDir);
    log('processing', `Connecting to database.`, 4);
    let dbconfig = require(this.path.configDB);
    let modelProto = require(this.path.modelman);
    let mongoose = {};
    try {
      mongoose = await dbConnect(dbconfig.client.url);
      log('info', `The MongoDB connection is successful.`, 4);
    } catch (e) {
      log('error', `The MongoDB connection failed.`, 4);
    }
    for (const key in modelProto) {
      if (modelProto.hasOwnProperty(key)) {
        let modelName = key[0].toUpperCase() + key.substr(1);
        let mongooseSchema = parseProto(modelProto[key], key);
        let mongooseModel = mongoose.model(modelName, new mongoose.Schema(mongooseSchema));
        let res = await mongooseModel.find({});
        let objects = {};
        for (const item of res) {
          let timeKey = moment(item.createTime).format('YYYY-MM-DD');
          if ( !objects[timeKey] ) objects[timeKey] = [];
          objects[timeKey].push(item);
        }
        for (let key in objects) {
          let filePath = `${targetDir}/${modelName}/${key}.json`;
          log('processing', `Write to ${chalk.green(filePath)}`, 6);
          fs.outputJsonSync(filePath, objects[key], {
            name: key
          });
        }
      }
    }
    log('done', 'Database backup complete.', 2);
  }
}

/**
 * @description 命令接收器
 */
module.exports = async function backup(folderName, options = {}) {
  new Backup({
    folderName,
    options
  });
}
