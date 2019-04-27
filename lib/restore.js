const path = require('path');
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
    process.exit();
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
