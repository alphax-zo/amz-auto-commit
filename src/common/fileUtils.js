/*
 * @Author: AlphaX Zo
 * @Email: zhouzhixuan@chinasie.com
 * @Date: 2023-04-05 16:37:54
 * @LastEditTime: 2023-05-26 09:41:49
 * @LastEditors: Do not edit
 * @FilePath: \Weboard-v10.0.0\scripts\functions\fileUtils.js
 * @Description: 业务领域文件处理脚本
 */
const { exec } = require('child_process');
const _ = require('lodash');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const log = require('../common/logUtils');
const reg = require('../common/fileRegExp');
const utils = require('../utils');

module.exports = {
    setEnv(envFile = '.env', envCodeVals, callback) {
        return new Promise((resolve, reject) => {
            const envPath = path.join(process.cwd(), envFile).replace(/\\/g, '/');
            try {
                let conte = '';
                this.editSync(envPath, (fileContent, totalFiles) => {
                    conte = fileContent;
                    _.forEach(envCodeVals, (envVal, envCode) => {
                        conte = conte.replace(reg.RegProjEnvDynamic(envCode, 'g'), `$1${envVal}`);
                    });

                    typeof callback === 'function' && callback(conte, totalFiles);

                    return conte;
                });
                resolve({ result: true, envPath, conte });
                log.succeed('Update Env File', envPath);
            } catch (e) {
                log.failed('Update Env File', envPath, 'Failed', '', e);
                reject({ result: false, e });
            }
        });
    },

    getEnv(envFile = '.env', envCode, callback) {
        return new Promise((resolve, reject) => {
            const envPath = path.join(process.cwd(), envFile).replace(/\\/g, '/');
            try {
                // 读取文件
                const data = fs.readFileSync(envPath, 'utf8');
                const content = data.toString('utf8');
                const res = this.execAllFilter(
                    content,
                    reg.RegProjEnv,
                    item => item.indexOf('=') === -1
                );
                let output = {};
                res.map(item => (output[item[0]] = item[1]));
                output = envCode ? output[envCode] : output;
                typeof callback === 'function' && callback(output, envPath, content);

                resolve(output);
                log.succeed('Get Env File', envPath);
            } catch (e) {
                log.failed('Get Env File', envPath);
                reject(e);
            }
        });
    },

    getPath(filePath, rootPath) {
        if (path.isAbsolute(filePath)) return filePath;

        if (rootPath) return path.join(rootPath, filePath);

        return path.resolve(__dirname, filePath);
    },

    editSync(filePath, callback) {
        const tmpPath = this.getPath(filePath);
        // 读取文件
        const data = fs.readFileSync(tmpPath, 'utf8');
        if (typeof callback === 'function') {
            const content = callback(data.toString('utf8'));
            if (!content) {
                log.failed('File Write', tmpPath, 'Failed', 'File Content Should Not Be Empty');
                return;
            }
            // 写入文件
            fs.writeFileSync(tmpPath, content, { encoding: 'utf8' });
            log.succeed('File Edit', tmpPath);

            this.prettierFormat(tmpPath);
        }
    },

    execAllFilter(fileContent, regex, match) {
        let total = utils.execAll(fileContent, regex);
        return total.map(items => {
            return _.chain(items)
                .filter(item => (typeof match === 'function' ? match(item) : true))
                .compact()
                .value();
        });
    },

    prettierFormat(formatPath, relativePath = '') {
        const prettierPath = path.join(process.cwd(), '/node_modules/prettier/bin-prettier.js');
        exec(`node ${prettierPath}  --write ${formatPath}`);
        log.succeed('Format', path.relative(relativePath, formatPath));
    },
    fsCopy(src, des, callback) {
        const tmpSrc = this.getPath(src);
        const tmpDes = this.getPath(des);
        fsPromises
            .copyFile(tmpSrc, tmpDes)
            .then(() => {
                log.succeed('File Copy', [tmpSrc, tmpDes]);
                if (typeof callback === 'function') callback();
            })
            .catch(err => {
                log.failed('File Copy', [tmpSrc, tmpDes], 'Failed', '', err);
                if (typeof callback === 'function') callback(err);
            });
    },
    filterFiles(files, ignores = []) {
        if (!ignores.length) return files;
        return files.filter(file => !ignores.includes(file));
    },
};
