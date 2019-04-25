const fs = require('fs-extra');
const path = require('path');

const log = require

/**
 * @description 备份系统
 */
class Backup {
  constructor(options = {
    folderName: '.',
    options: {}
  }) {
    this.folderName = path.resolve(options.folderName);
    this.options = options.options;
    //检查必要文件是否存在
    this.exists();
  }

  /**
   * @description 检查必要文件是否存在
   */
  exists() {
    console.log('this.folderName', this.folderName);
    if (fs.existsSync(this.folderName)) {
      log('error', 'The specified path does not exist.');
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
