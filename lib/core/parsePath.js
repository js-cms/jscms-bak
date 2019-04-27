const constant = require('./const');
const path = require('path');

/**
 * @description 解析公共路径
 */
module.exports = function parsePath(fullFolderName) {
  let _path = {};
  _path.folderName = fullFolderName;
  _path.app = path.join(fullFolderName, constant.PATH_APP);
  _path.config = path.join(fullFolderName, constant.PATH_CONFIG);
  _path.configDB = path.join(fullFolderName, constant.PATH_CONFIG, 'db.js');
  let APP_CONST = require(`${_path.config}/constant/index.js`);
  _path.appUpload = path.join(fullFolderName, APP_CONST.directory.JSCMS_UPLOAD);
  _path.modelman = path.join(fullFolderName, APP_CONST.directory.JSCMS_MODELMAN + '/index.js');
  return _path;
}
