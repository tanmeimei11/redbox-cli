
import { existsSync as exists } from 'fs'
import { createPromptModule } from 'inquirer'
import { resolve, join } from 'path'
import { rm, cp, exec, which, cd } from 'shelljs'
const ora = require('ora')
const download = require('download-git-repo')

export const command = `create [projectName]`
export const aliases = `create`
export const desc = `在当前从模板创建新项目`
export const builder = {
  projectName: {
    default: 'my-project'
  }
}

const repoTpl = `gitlab:githost.in66.cc:in-template/redbox-tpl`
const tplBranch = [`promo-tpl`,`super-tpl`]

export const handler = async argv => {

  const spinner = ora('开始创建').info()
  const prompt = createPromptModule()
  const execPromise = cmd => new Promise((resolve, reject) => {
    let child = exec(cmd, (code, out) => {
      resolve(out)
    })
    child.stdout.on('data', function (data) {
      spinner.text = data
    })
  })
  async function installDepence (projectName,spinner) {
    spinner.succeed()
    let isYarn = which('yarn')
    let command = isYarn ? 'yarn' : 'npm'
    cd(projectName || '.')
    await execPromise(`${command} install`)
    spinner.succeed('依赖安装完成\n')
  }

  function downloadRepo (template, dest, projectName = '') {
    return new Promise((resolve, reject) => {
      if (exists(dest)) rm('-rf', dest)

      const spinner = ora('下载模板中...').start().info()
      spinner.info(`git clone ${repoTpl}`)

      download(template, dest, { clone: true }, err => {
        if (err) {
          spinner.fail(`模板下载失败: ${err.message.trim()}\n`)
          reject(err)
          return
        }

        resolve(execPromise(`cp -r ${dest}/template/ ${join(process.cwd(), projectName)}`).then(res => {
          rm('-rf', dest)
          spinner.succeed('模板下载成功\n')
        }))
      })
    })
  }
  try {
    const answer = await prompt([{
      type: 'list',
      name: 'template',
      message: '选择模板?',
      choices: tplBranch
    }, {
      type: 'confirm',
      name: 'newDir',
      message: answers => `创建新的目录${argv.projectName}吗?`,
      default: true
    }])
    const projectName = answer.newDir ? argv.projectName : ''
    const template = `${repoTpl}#${answer.template}`
    const dest = join(process.cwd(), projectName, answer.template)

    await downloadRepo(template, dest, projectName)

    await installDepence(projectName, spinner)

    spinner.succeed('创建成功!\n')
  } catch (err) {
    console.log(err)
    spinner.fail(`创建失败, 请联系作者~\n`)
  }
}
