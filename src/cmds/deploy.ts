
import { exec } from 'shelljs'
import { request } from 'http'
import { createPromptModule } from 'inquirer'
const ora = require('ora')
export const command = 'deploy [branch]'
export const aliases = 'deploy'
export const desc = '部署 项目分支 到Jenkins'
export const builder = {
  branch: {
    default: exec('git status | head -n 1  | awk \'{print  $3}\'', { silent: true }).stdout.trim()
  }
}

const JENKINS_TOKEN = exec('npm config get JENKINS_TOKEN', { silent: true }).stdout.trim()
const reqConfig = ({ body,path }) => ({
  port: 8001,
  hostname: '10.10.106.240',
  method: 'POST',
  auth: JENKINS_TOKEN,
  headers: {
    'Content-Length': Buffer.byteLength(body),
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  path: `/jenkins/view/${path}`
})
const jenkisPost = (data,path) => new Promise<string>((resolve, reject) => {
  let body = `json=${encodeURIComponent(JSON.stringify(data))}`
  let req = request(reqConfig({ body,path }),res => {
    let rawData = ''
    res.setEncoding('utf8')
    res.on('data', chunk => (rawData += chunk))
    res.on('end', () => resolve(rawData))
  })
  req.write(body)
  req.end()
})
const delay = time =>  new Promise(resolve => setTimeout(() => resolve(),time))
export const handler = async argv => {
  let prompt = createPromptModule()
  const curBranch = argv.branch
  const defBranch = ['develop', 'master']
  const redboxRes = ['QA','QA2','QA3','QA_unit','webtest']
  const redboxResPath = `redbox-res/job/redbox_res_onekey_deploy`
  const resultReg = /^{"result":"(\w+)"}$/
  const spinner = ora('开始部署').start().info()
  const answer = await prompt([{
    type: 'list',
    name: 'branch',
    message: '选择发布的分支?',
    choices: [
      argv.branch,
      ...defBranch.filter(b => b !== curBranch)
    ],
    filter: val => `origin/${val}`
  },{
    type: 'list',
    name: 'env',
    message: '选择要部署的环境',
    choices: redboxRes
  }])
  spinner.start('提交Jenkins')
  try {
    const numb = /(\d+)/.exec(await jenkisPost({},`${redboxResPath}/api/json?tree=nextBuildNumber`))[0]
    const data = await jenkisPost({
      'parameter': [{
        'name': 'BRANCH',
        'value': answer.branch
      }, {
        'name': 'deploy_env',
        'value': answer.env
      }]
    },`${redboxResPath}/build?`)
    if (data) throw new Error()
    spinner.succeed('提交Jenkins')
    spinner.start('开始执行Job')
    let result = ''
    const now = Date.now()
    while (!resultReg.test(result)) {
      result = await jenkisPost({},`${redboxResPath}/${numb}/api/json?tree=result`)
      await delay(500)
      if (Date.now() - now > 1000 * 5 * 60) {
        break
      }
    }
    if (resultReg.exec(result)[1] === 'SUCCESS') {
      spinner.succeed('Job执行')
    } else {
      spinner.fail('Job执行')
    }
  } catch (error) {
    console.log(error)
    spinner.fail(`部署失败: 请联系作者~`)
  }
}
