const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { program } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const fileUtils = require('./common/fileUtils');

class AutoCommit {
  constructor(option = {}) {
    this.option = Object.assign({}, AutoCommit.__option, option);
    this.svnExistCheck();
  }

  static __option = {};

  comment = null;
  commentDefGit = '【GIT】提交代码变更';
  commentDefSvn = '【SVN】提交代码变更';

  svn = null;

  register(programBuilder) {
    this.execBuilder = programBuilder;
  }

  execSvnAutoCommit() {
    try {
      this.svnAutoCommit(this.execBuilder);
    } catch (err) {
      console.log(chalk.yellow(err.message));
      execSync(`${this.svn} cleanup`, {
        encoding: 'utf-8',
        stdio: 'inherit',
      });

      this.svnAutoCommit(this.execBuilder);
    }
  }

  async svnAutoCommit(callback) {
    try {
      execSync(`${this.svn} update`, {
        encoding: 'utf-8',
        stdio: 'inherit',
      });

      execSync(`${this.svn} add . --force`, {
        encoding: 'utf-8',
        stdio: 'inherit',
      });

      if (this.comment) {
        this.comment = this.comment === this.commentDefGit ? this.commentDefSvn : this.comment;
        execSync(`${this.svn} commit -m "feat: ${this.comment}"`, {
          encoding: 'utf-8',
          stdio: 'inherit',
        });

        if (typeof callback === 'function') callback();
        this.comment = null;
        return;
      }

      const commentQS = [
        {
          name: 'comment',
          type: 'input',
          message: chalk.magenta(`请输入备注/【SVN】提交日志:`),
          default: this.commentDefSvn,
        },
      ];

      process.nextTick(async () => {
        const { comment } = await inquirer.prompt(commentQS);

        execSync(`${this.svn} commit -m "feat: ${comment}"`, {
          encoding: 'utf-8',
          stdio: 'inherit',
        });

        if (typeof callback === 'function') callback();
      });
    } catch (err) {
      console.log(chalk.red(err.message));
      console.log(chalk.red('SVN自动提交代码变更失败，请手动提交变更后再打包！'));
      process.exit(-1);
    }
  }

  async gitAutoCommit(callback) {
    try {
      execSync('git add .', {
        encoding: 'utf-8',
        stdio: 'inherit',
      });

      const commentQS = [
        {
          name: 'comment',
          type: 'input',
          message: chalk.magenta(`请输入备注/【GIT】提交日志:`),
          default: this.commentDefGit,
        },
      ];

      process.nextTick(async () => {
        const { comment } = await inquirer.prompt(commentQS);

        this.comment = comment;

        execSync(`git commit -m "feat: ${comment}"`, {
          encoding: 'utf-8',
          stdio: 'inherit',
        });

        const remote = execSync('git remote -v', {
          encoding: 'utf-8',
        });
        if (remote) {
          execSync('git pull', {
            encoding: 'utf-8',
            stdio: 'inherit',
          });
        }

        if (typeof callback === 'function') callback();
      });
    } catch (err) {
      console.log(chalk.red(err.message));
      console.log(chalk.red('【GIT】自动提交代码变更失败，请手动提交变更后再打包！'));
      process.exit(-1);
    }
  }

  isMissingAll(status) {
    if (status.startsWith('!')) {
      const statusArr = status.split('!').filter((item) => item);
      const exclamationMarks = status.match(/\!/g);

      return !!statusArr.length && statusArr.length === exclamationMarks.length;
    }

    return false;
  }

  svnAddIgnoreExec() {
    execSync(`${this.svn} propset svn:ignore -F svnignore.txt .`, {
      encoding: 'utf-8',
      stdio: 'inherit',
    });

    execSync(`${this.svn} propset svn:ignore "coverage" tests/unit`, {
      encoding: 'utf-8',
      stdio: 'inherit',
    });

    execSync(`${this.svn} up`, {
      encoding: 'utf-8',
      stdio: 'inherit',
    });
  }

  svnAddIgnored(callback) {
    // 该方法可以独立出来作为单独的命令，供添加SVN忽略文件使用

    // 全局
    const addedGlobal = execSync(`${this.svn} propget svn:global-ignores .`, {
      encoding: 'utf-8',
    });

    // 本地
    if (!addedGlobal) {
      execSync(`${this.svn} propset svn:global-ignores "node_modules .happypack .git" .`, {
        encoding: 'utf-8',
        stdio: 'inherit',
      });
    }

    const added = execSync(`${this.svn} propget svn:ignore .`, {
      encoding: 'utf-8',
    });

    if (!added) {
      try {
        const svnignore = fileUtils.getPath('svnignore.txt', process.cwd());
        fs.accessSync(svnignore, fs.constants.F_OK);
        this.svnAddIgnoreExec();
      } catch (err) {
        const target = fileUtils.getPath('svnignore.txt', process.cwd());
        fileUtils.fsCopy('../../svnignore.txt', target, () => {
          execSync(`${this.svn} cleanup`, {
            encoding: 'utf-8',
            stdio: 'inherit',
          });

          this.svnAddIgnoreExec();
          this.exec();
        });
        // console.log(chalk.red(err.message));
        // console.log(chalk.yellow('请配置【SVN】忽略文件！'));
      }
    } else {
      if (typeof callback === 'function') callback();
    }
  }

  svnExistCheck() {
    try {
      const exist = execSync(`${this.svn} --version`, {
        encoding: 'utf-8',
      });

      if (exist.toLowerCase().indexOf('svn') > -1) {
        this.svn = 'svn';
      } else {
        this.svn = fileUtils.getPath('../subversion/bin/svn.exe');
        const exist = execSync(`${this.svn} --version`, {
          encoding: 'utf-8',
        });

        if (exist.toLowerCase().indexOf('svn') <= -1) {
          throw Error('无法获取【SVN】命令');
        }
      }
    } catch (err) {
      console.log(chalk.yellow('请安装【SVN】命令！'));
      console.log(
        chalk.green('参考文档：https://www.visualsvn.com/server/getting-started/#Installation')
      );
    }
  }

  svnCheck() {
    const exist = execSync(`${this.svn} --version`, {
      encoding: 'utf-8',
    });

    if (exist.toLowerCase().indexOf('svn') > -1) {
      const status = execSync(`${this.svn} status`, {
        encoding: 'utf-8',
      });

      // 添加忽略文件
      this.svnAddIgnored(() => {
        if (this.isMissingAll(status)) {
          const statusArr = status.split('!');
          statusArr.forEach((path) => {
            path = path.trim();
            if (path) execSync(`${this.svn} delete ${path}`);
          });
        }

        if (status) {
          console.log(chalk.green(status));
          this.execSvnAutoCommit();
        } else {
          if (typeof this.execBuilder === 'function') this.execBuilder();
        }
      });
    } else {
      console.log(chalk.yellow('请安装【SVN】命令！'));
      console.log(
        chalk.green('参考文档：https://www.visualsvn.com/server/getting-started/#Installation')
      );
    }
  }

  gitInit() {
    console.log(chalk.yellow('正在初始化【GIT】,请等待...'));
    execSync('git init');
    execSync(`git add .`);
    const changed = execSync(`git status`).toString().trim();
    if (changed.includes('Changes to be committed')) {
      execSync(`git commit -m "feat: 【GIT】初始化"`);
      console.log(chalk.yellow('正在初始化【GIT】成功！'));
      this.svnCheck();
    }
  }

  gitCheck() {
    const exist = execSync('git -v', {
      encoding: 'utf-8',
    });

    if (exist.toLowerCase().indexOf('git') > -1) {
      const existGit = execSync('git rev-parse --is-inside-work-tree', {
        encoding: 'utf-8',
      });

      if (existGit.indexOf('true') > -1) {
        const status = execSync('git status', {
          encoding: 'utf-8',
        });

        if (status && !status.includes('nothing to commit')) {
          console.log(chalk.green(status));
          this.gitAutoCommit(this.svnCheck.bind(this));
        } else {
          this.svnCheck();
        }
      } else {
        this.gitInit();
      }
    } else {
      console.log(chalk.yellow('请安装【GIT】命令！'));
      console.log(chalk.green('参考文档：https://git-scm.com/book/zh/v2/起步-安装-Git'));
    }
  }

  exec() {
    program
      .option('-git, --auto-git', 'wether to use git', false)
      .allowUnknownOption(true)
      .parse(process.argv);
    const options = program.opts();
    if (options.autoGit) {
      this.gitCheck();
    } else {
      this.svnCheck();
    }
  }
}

module.exports = AutoCommit;
