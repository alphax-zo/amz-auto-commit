/*
 * @Author: AlphaX Zo
 * @Email: zhouzhixuan@chinasie.com
 * @Date: 2023-03-22 20:28:28
 * @LastEditTime: 2023-05-05 14:30:52
 * @LastEditors: Do not edit
 * @FilePath: \WeBoard\scripts\utils.js
 * @Description: 工具函数（CommonJs风格）
 */
// const fs = require('fs');
const path = require('path');

module.exports = {
    execAll(content, regex) {
        let matched;
        let totalMatched = [];
        while ((matched = regex.exec(content)) != null) {
            totalMatched.push(matched);
        }

        return totalMatched;
    },
};
