
import { existsSync as exists } from 'fs'
import { createPromptModule } from 'inquirer'
import { resolve, join } from 'path'
import { rm, cp, exec } from 'shelljs'
const ora = require('ora')
const download = require('download-git-repo')

const execPromise = cmd => new Promise((resolve, reject) => {
  exec(cmd, (code, out) => {
    resolve(out)
  })
})

export const command = `create [project]`
export const aliases = `create`
export const desc = `在当前从模板创建新项目`
export const builder = {
  project: {
    default: 'my-project'
  }
}

const repoTpl = `gitlab:githost.in66.cc:in-template/redbox-tpl`
const tplBranch = [`promo-tpl`]

export const handler = async argv => {

  const spinner = ora('开始创建').info()
  const prompt = createPromptModule()

  try {
    const answer = await prompt([{
      type: 'list',
      name: 'template',
      message: '选择模板?',
      choices: tplBranch
    }, {
      type: 'confirm',
      name: 'newDir',
      message: answers => `创建新的目录${argv.project}吗?`,
      default: true
    }])
    const projectName = answer.newDir ? argv.project : ''
    const template = `${repoTpl}#${answer.template}`
    const dest = join(process.cwd(), projectName, answer.template)

    await downloadRepo(template, dest, projectName)

    await installDepence(projectName)

    spinner.succeed('创建成功!\n')
  } catch (err) {
    console.log(err)
    spinner.fail(`创建失败, 请联系作者~\n`)
  }
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

async function installDepence (projectName) {
  const spinner = ora('安装依赖').start()
  await execPromise(`cd ${projectName || '.'} && npm i`)
  spinner.succeed('依赖安装完成\n')
}
