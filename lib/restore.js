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
 * @description 还原系统
 */
class Restore {
  constructor(options = {
    folderName: '.',
    options: {}
  }) {
    this.fullFolderName = path.resolve(options.folderName);
    this.options = options.options;
    this.path = parsePath(this.fullFolderName);
    //检查必要文件是否存在
    exists(this.path);
    //开始还原
    this.startRestore();
  }

  /**
   * @description 开始还原
   */
  async startRestore() {
    //还原上传资源文件夹
    this.restoreUpload();
    //还原数据到json
    await this.restoreDatabase();
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
   * @description 还原上传资源文件夹
   */
  restoreUpload() {
    let sourceDir = path.join(this.fullFolderName, 'bak/upload');
    let targetDir = this.path.appUpload;
    log('info', `Restore resource file`);
    log('processing', `Remove folder ${chalk.green(targetDir)}.`, 4);
    fs.removeSync(targetDir);
    log('processing', `Copy ${chalk.green(sourceDir)} to ${chalk.green(targetDir)}.`, 4);
    fs.copySync(sourceDir, targetDir);
    log('done', 'Resource file restore completed.', 2);
    console.log('\n');
  }

  /**
   * @description 还原json数据到数据库
   */
  async restoreDatabase() {
    let sourceDir = path.join(this.fullFolderName, 'bak/database');
    log('info', `Restore database`);
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
        await mongooseModel.deleteMany({});
        let res = await mongooseModel.find({});
        let dir = `${sourceDir}/${modelName}/`;
        let files = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
        if ( files.length ) {
          for (const filePath of files) {
            let json = require(dir + filePath);
            await mongooseModel.insertMany(json);
          }
          log('processing', `Written ${chalk.green(modelName)} collection of MongoDB`, 6)
        }
      }
    }
    log('done', 'Database restore complete.', 2);
  }
}

/**
 * @description 命令接收器
 */
module.exports = async function restore(folderName, options = {}) {
  new Restore({
    folderName,
    options
  });
}
