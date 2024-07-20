/*
 * @Author: AlphaX Zo
 * @Email: zhouzhixuan@chinasie.com
 * @Date: 2023-03-21 23:46:37
 * @LastEditTime: 2023-06-28 22:27:00
 * @LastEditors: Do not edit
 * @FilePath: \WeBoard\scripts\common\fileRegExp.js
 * @Description: Vue组件文件分析正则
 */
module.exports = {
    // 环境变量.env
    RegProjEnv: /(([A-Z]+[A-Z_]+[A-Z]+)\s*?(?==)\s*?=\s*)(['"]?.+['"]?)/g,
    RegProjEnvDynamic: (match = '[A-Z]+[A-Z_]+[A-Z]+', opt = 'g') =>
        new RegExp(`((${match})\\s*?(?==)\\s*?=\\s*)(['"]?.+['"]?)`, opt),
};
