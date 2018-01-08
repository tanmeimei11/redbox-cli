
import { exec } from 'shelljs'
import { request,delay,lastSpilt } from '../utils'
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
const jenkisPost = (data,path) => new Promise<string>((resolve, reject) => {
  let body = `json=${encodeURIComponent(JSON.stringify(data))}`
  request({
    port: 8001,
    hostname: '10.10.106.240',
    method: 'POST',
    auth: JENKINS_TOKEN,
    headers: {
      'Content-Length': Buffer.byteLength(body),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    path: `/jenkins/job/${path}`
  },body).then(data => resolve(data))
})
const spinner = ora('开始检查配置').start()
export const handler = async argv => {
  let prompt = createPromptModule()
  if (JENKINS_TOKEN === 'undefined') {
    return spinner.fail(`配置缺少 JENKINS_TOKE`)
  }
  const curBranch = argv.branch
  const defBranch = ['develop', 'master']

  const redboxResPath = `redbox_res_onekey_deploy`
  const redboxH5Path = `redbox-h5_onekey_deploy`

  const resultReg = /^{"result":"(\w+)"}$/
  spinner.succeed('检查配置成功').start('开始部署').info()
  try {
    const answer = await prompt([{
      type: 'list',
      name: 'job',
      message: '选择执行的Job?',
      choices: [
        { name: 'redboxRes',value: redboxResPath },
        { name: 'redboxH5',value: redboxH5Path }
      ]
    },{
      type: 'list',
      name: 'branch',
      message: '选择发布的分支?',
      choices: [
        argv.branch,
        ...defBranch.filter(b => b !== curBranch)
      ],
      filter:  val => `origin/${val}`,
      when: answers => answers.job === redboxResPath
    },{
      type: 'list',
      name: 'env',
      message: '选择要部署的环境',
      choices: ['QA','QA2','QA3','QA_unit','webtest'],
      when: answers => answers.job === redboxResPath
    },{
      type: 'list',
      name: 'branch',
      message: '选择发布的分支?',
      choices: [
        argv.branch,
        ...defBranch.filter(b => b !== curBranch)
      ],
      when: answers => answers.job === redboxH5Path
    },{
      type: 'list',
      name: 'env',
      message: '选择要部署的环境',
      choices: ['QA','webtest'],
      when: answers => answers.job === redboxH5Path
    }])
    const confirm = await prompt({
      type: 'confirm',
      name: 'ok',
      message: `执行${lastSpilt(answer.job,'/')} 部署 分支[${lastSpilt(answer.branch,'/')}] 到 ${answer.env}`,
      default: false
    })
    if (!confirm.ok) return spinner.start('部署取消').warn()
    spinner.start('开始提交Jenkins')
    const numb = /(\d+)/.exec(await jenkisPost({},`${answer.job}/api/json?tree=nextBuildNumber`))[0]
    const data = await jenkisPost({
      'parameter': [{
        'name': 'BRANCH',
        'value': answer.branch
      }, {
        'name': 'deploy_env',
        'value': answer.env
      }]
    },`${answer.job}/build?`)
    if (data) throw new Error(data)
    spinner.succeed('提交Jenkins成功').start(`开始执行Job[${numb}]`)
    let result = ''
    const now = Date.now()
    while (!resultReg.test(result)) {
      result = await jenkisPost({},`${answer.job}/${numb}/api/json?tree=result`)
      await delay(500)
      if (Date.now() - now > 1000 * 5 * 60) break
    }
    const isSucc = resultReg.exec(result)[1] === 'SUCCESS'
    spinner[isSucc ? `succeed` : `fail`](`Job执行${isSucc ? '成功' : '失败'}`)
  } catch (error) {
    console.log(error)
    spinner.fail(`部署失败: 请联系作者~`)
  }
}
