

import { existsSync as exists } from 'fs'
import { createPromptModule } from 'inquirer'
import { resolve, join } from 'path'
import { rm, cp, exec } from 'shelljs'
const ora = require('ora')
const download = require('download-git-repo')

const execPromise = cmd =>  new Promise((resolve, reject) => {
  exec(cmd, (code, out) => {
    resolve(out)
  })
})

const currPath = process.cwd()
let projectName = 'my-project'

export const command = `create [project]`
export const aliases = `create`
export const desc = `在当前从模板创建新项目`
export const  builder = {
    project: {
        default: projectName
    }
}

const repoTpl = `gitlab:githost.in66.cc:in-template/redbox-tpl`
const tplBranch = [`promo-tpl`]

export const handler = async argv => {
  projectName = argv.project

  const spinner = ora('开始创建').info()
  const prompt = createPromptModule()
  const projectPath = join(currPath, projectName)

  try{
    const answer = await prompt([{
      type: 'list',
      name: 'template',
      message: '选择模板?',
      choices: tplBranch
    }])
    const template = `${repoTpl}#${answer.template}`
    const dest = join(projectPath, answer.template)

    await downloadRepo(template, dest)

    await installDepence()


    spinner.succeed('创建成功!')
  }catch(err){
      console.log(err)
      spinner.fail(`创建失败, 请联系作者~`)
  }
}

function downloadRepo(template, dest){
  return new Promise((resolve, reject) => {
    if (exists(dest)) rm('-rf', dest)

    const spinner = ora('下载模板中...').start().info()
    spinner.info(`git clone ${repoTpl}`)

    download(template, dest, { clone: true }, err => {
      if(err){
        spinner.fail(`模板下载失败: ${err.message.trim()}`)
        reject(err)
        return
      }
      spinner.succeed('模板下载成功')
      cp('-R', `${dest}/template/*`, join(currPath, projectName))
      rm('-rf', dest)
      resolve()
    })
  })
}

async function installDepence(){
  const spinner = ora('开始安装依赖\n').start()
  await exec(`cd ${projectName} && npm i`)
  spinner.succeed('\n依赖安装完成')
}
