const fs = require('fs-extra');
const path = require('path');
const constant = require('./core/const');
const chalk = require('chalk');
const log = require('./core/log');
const dbConnect = require('./core/dbConnect');
const parseProto = require('./util/parseProto');
const moment = require('moment');

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
    this.parsePath();
    //检查必要文件是否存在
    this.exists();
    //备份上传资源文件夹
    this.backupUpload();
    //备份数据到json
    this.backupDatabase();
  }

  /**
   * @description 记录路径
   */
  parsePath() {
    this.path = {};
    this.path.folderName = this.fullFolderName;
    this.path.app = path.join(this.fullFolderName, constant.PATH_APP);
    this.path.config = path.join(this.fullFolderName, constant.PATH_CONFIG);
    this.path.configDB = path.join(this.fullFolderName, constant.PATH_CONFIG, 'db.js');
    let APP_CONST = require(`${this.path.config}/constant/index.js`);
    this.path.appUpload = path.join(this.fullFolderName, APP_CONST.directory.JSCMS_UPLOAD);
    this.path.modelman = path.join(this.fullFolderName, APP_CONST.directory.JSCMS_MODELMAN + '/index.js');
  }

  /**
   * @description 检查必要文件是否存在
   */
  exists() {
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
    log('processing', `Remove folder ${chalk.green(targetDir)}.`);
    fs.removeSync(targetUpload);
    log('processing', `Copy ${chalk.green(this.path.appUpload)} to ${chalk.green(targetUpload)}.`);
    fs.copySync(this.path.appUpload, targetUpload);
    log('done', 'Resource file backup completed.');
  }

  /**
   * @description 备份数据到json
   */
  async backupDatabase() {
    let targetDir = path.join(this.fullFolderName, 'bak/database');
    log('processing', `Remove folder ${chalk.green(targetDir)}.`);
    log('processing', `Connecting to database.`);
    let dbconfig = require(this.path.configDB);
    let modelProto = require(this.path.modelman);
    let mongoose = {};
    try {
      mongoose = await dbConnect(dbconfig.client.url);
      log('info', `The MongoDB connection is successful.`);
    } catch (e) {
      log('error', `The MongoDB connection failed.`);
    }
    for (const key in modelProto) {
      if (modelProto.hasOwnProperty(key)) {
        if (key === 'article') {
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
            objects[key] 
          }
          console.log(objects);
        }
      }
    }
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
