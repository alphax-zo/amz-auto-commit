/*
 * @Author: AlphaX Zo
 * @Email: zhouzhixuan@chinasie.com
 * @Date: 2023-03-25 09:19:59
 * @LastEditTime: 2023-04-08 17:49:10
 * @LastEditors: Do not edit
 * @FilePath: \WeBoard\scripts\common\logUtils.js
 * @Description: 日志输出
 */

const colors = require('chalk');
const { isString, isArray, compact } = require('lodash');

module.exports = {
    colors: colors,
    /**
     * @Author: AlphaX Zo
     * @Date: 2023-03-25 09:50:11
     * @LastEditTime: Do not edit
     * @Description: 函数注释配置模板
     * @param {*} prefix
     * @param {*} target
     * @param {*} suffix
     * @param {array} args
     * @return {*}
     * eg:log.succeed('读取文件失败', filePath, '', err);
     */
    succeed(prefix, target = '', hint = 'Successfully', suffix, ...args) {
        target = !isArray(target) ? String(target || '') : target;
        let targetInfo = isString(target) && target.length ? [target] : target || [];
        if (!isArray(targetInfo)) return;
        try {
            targetInfo = [...targetInfo];
            if (isArray(targetInfo) && targetInfo.length === 1) {
                targetInfo = colors.cyan(targetInfo[0]);
            }

            if (isArray(targetInfo) && targetInfo.length > 1) {
                if (targetInfo.length === 2) targetInfo.splice(1, 0, `${colors.green('To')}`);
                targetInfo = targetInfo.map(item => `  ${colors.cyan(item)}`).join('\n');
                targetInfo = `\n${targetInfo}\n`;
            }

            const extra = compact([hint, targetInfo, suffix ? `,${suffix}` : '']).join(' ');

            console.log(colors.green(`✓ ${prefix} ${extra}\n`), ...args);
        } catch (e) {
            console.log(colors.red(`x ${prefix} Failed ${targetInfo}\n`), ...args, e);
        }
    },
    /**
     * @Author: AlphaX Zo
     * @Date: 2023-03-25 09:49:54
     * @LastEditTime: Do not edit
     * @Description: 函数注释配置模板
     * @param {*} prefix
     * @param {*} target
     * @param {*} suffix
     * @param {array} args
     * @return {*}
     * eg:log.failed('读取文件失败', filePath, '', err);
     */
    failed(prefix, target = '', hint = 'Failed', suffix, ...args) {
        target = !isArray(target) ? String(target || '') : target;
        let targetInfo = isString(target) && target.length ? [target] : target || [];
        if (!isArray(targetInfo)) return;
        try {
            targetInfo = [...targetInfo];
            if (isArray(targetInfo) && targetInfo.length === 1) {
                targetInfo = colors.cyan(targetInfo[0]);
            }

            if (isArray(targetInfo) && targetInfo.length > 1) {
                if (targetInfo.length === 2) targetInfo.splice(1, 0, `${colors.green('To')}`);
                targetInfo = targetInfo.map(item => `  ${colors.cyan(item)}`).join('\n');
                targetInfo = `\n${targetInfo}\n`;
            }

            const extra = compact([hint, targetInfo, suffix ? `,${suffix}` : '']).join(' ');

            console.log(colors.red(`x ${prefix} ${extra}\n`), ...args);
        } catch (e) {
            console.log(colors.red(`x ${prefix} Failed ${targetInfo}\n`), ...args, e);
        }
    },
    /**
     * @Author: AlphaX Zo
     * @Date: 2023-03-25 09:53:20
     * @LastEditTime: Do not edit
     * @Description: 函数注释配置模板
     * @param {*} prefix
     * @param {*} target
     * @param {*} suffix
     * @param {array} args
     * @return {*}
     * eg: log.warned('目录不存在', filePath);
     */
    warned(prefix, target = '', hint = 'Warning', suffix, ...args) {
        target = !isArray(target) ? String(target || '') : target;
        let targetInfo = isString(target) && target.length ? [target] : target || [];
        if (!isArray(targetInfo)) return;
        try {
            targetInfo = [...targetInfo];
            if (isArray(targetInfo) && targetInfo.length === 1) {
                targetInfo = colors.cyan(targetInfo[0]);
            }

            if (isArray(targetInfo) && targetInfo.length > 1) {
                if (targetInfo.length === 2) targetInfo.splice(1, 0, `${colors.green('To')}`);
                targetInfo = targetInfo.map(item => `  ${colors.cyan(item)}`).join('\n');
                targetInfo = `\n${targetInfo}\n`;
            }

            const extra = compact([hint, targetInfo, suffix ? `,${suffix}` : '']).join(' ');

            console.log(colors.yellow(`! ${prefix} ${extra}\n`), ...args);
        } catch (e) {
            console.log(colors.red(`x ${prefix} Failed ${targetInfo}\n`), ...args, e);
        }
    },
    /**
     * @Author: AlphaX Zo
     * @Date: 2023-03-25 09:53:20
     * @LastEditTime: Do not edit
     * @Description: 函数注释配置模板
     * @param {*} prefix
     * @param {*} target
     * @param {*} suffix
     * @param {array} args
     * @return {*}
     * eg: log.message('目录不存在', filePath);
     */
    message(prefix, target = '', hint = '.', suffix, ...args) {
        target = !isArray(target) ? String(target || '') : target;
        let targetInfo = isString(target) && target.length ? [target] : target || [];
        if (!isArray(targetInfo)) return;
        try {
            targetInfo = [...targetInfo];
            if (isArray(targetInfo) && targetInfo.length === 1) {
                targetInfo = colors.cyan(targetInfo[0]);
            }

            if (isArray(targetInfo) && targetInfo.length > 1) {
                if (targetInfo.length === 2) targetInfo.splice(1, 0, `${colors.green('To')}`);
                targetInfo = targetInfo.map(item => `  ${colors.cyan(item)}`).join('\n');
                targetInfo = `\n${targetInfo}\n`;
            }

            const extra = compact([hint, targetInfo, suffix ? `,${suffix}` : '']).join(' ');

            console.log(colors.white(`${prefix} ${extra}\n`), ...args);
        } catch (e) {
            console.log(colors.red(`x ${prefix} Failed ${targetInfo}\n`), ...args, e);
        }
    },
    notify(option = {}, useWinToast = false) {
        const notifier = require('node-notifier');

        if (!useWinToast) {
            notifier.notify(option);

            // Buttons actions (lower-case):
            notifier.on('ok', () => {
                console.log('"Ok" was pressed');
            });
            notifier.on('cancel', () => {
                console.log('"Cancel" was pressed');
            });

            return notifier;
        }

        const WindowsToaster = notifier.WindowsToaster;
        const winToast = new WindowsToaster({
            withFallback: false, // Fallback to Growl or Balloons?
            customPath: undefined, // Relative/Absolute path if you want to use your fork of SnoreToast.exe
        });

        winToast.notify(
            {
                title: undefined, // String. Required
                message: undefined, // String. Required if remove is not defined
                icon: undefined, // String. Absolute path to Icon
                sound: false, // Bool | String (as defined by http://msdn.microsoft.com/en-us/library/windows/apps/hh761492.aspx)
                id: undefined, // Number. ID to use for closing notification.
                appID: undefined, // String. App.ID and app Name. Defaults to no value, causing SnoreToast text to be visible.
                remove: undefined, // Number. Refer to previously created notification to close.
                install: undefined, // String (path, application, app id).  Creates a shortcut <path> in the start menu which point to the executable <application>, appID used for the notifications.
                ...option,
            },
            (error, response) => {
                if (response) log.succeed(response, '', '');
                if (error) notifier.notify(option);
            }
        );
    },
};
