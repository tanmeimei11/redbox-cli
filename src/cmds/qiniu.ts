
import { ls,test,cat } from 'shelljs'
import { dirname,basename, resolve } from 'path'
import { readFileSync,appendFileSync } from 'fs'
import { get,request } from 'https'
import { getEtag,resResolve,hasUpload,findFiles,chalk } from '../utils'

export const command = 'qiniu [globdir]'
export const aliases = 'qn'
export const desc = '图片上传到七牛'
export const builder = {
  globdir: {
    default: '*.png'
  }
}
type qnRes = {succ: boolean,data: object,message: string}
const qiniuReUrl = key => `https://static.in66.co/${key}`
const qnTokenUrl = 'https://box.in66.co/qiniu-token'
const qiniuUpload = (path, tokenRes) => new Promise<{key: string,hash: string}>(resolve => request({
  hostname: 'up.qbox.me',
  port: 443,
  path: `/putb64/-1/key/${tokenRes.key}`,
  method: 'POST',
  headers: {
    Authorization: `UpToken ${tokenRes.token}`,
    contentType: 'application/octet-stream'
  }
},resResolve(resolve)).end(readFileSync(path).toString('base64')))
const qiniuYun = ({ path, name }) => new Promise<qnRes>(resolve => get(qnTokenUrl,resResolve(resolve))).then(async token => {
  if (!token.succ) throw new Error(token.message)
  const { key } = await qiniuUpload(`${path}/${name}`, token.data)
  return qiniuReUrl(key)
})

export const handler = async argv => {
  const [files,spinner] = findFiles({ globdir: argv.globdir })
  files.forEach(async file => {
    const [path,name,hash] = [dirname(file), basename(file),getEtag(file)]
    const blueName = chalk.blue(`${path}/${file}`)
    let qiniuPath = `${path}/.qnrc`
    if (!test('-f', qiniuPath)) appendFileSync(qiniuPath, '{}', { flag: 'w' })
    spinner.start(`开始上传 ${blueName}`)
    try {
      let qiniuData = JSON.parse(cat(qiniuPath))
      const qiniuUrl = hasUpload(name,qiniuData,hash) ? qiniuData[`${name}`].qiniuUrl : await qiniuYun({ path, name })
      qiniuData = JSON.parse(cat(qiniuPath))
      qiniuData[`${name}`] = { hash,qiniuUrl }
      appendFileSync(qiniuPath, JSON.stringify(qiniuData, null, '\t'), { flag: 'w' })
      spinner.succeed(`上传成功 ${blueName}`).start().info(`七牛地址: ${qiniuUrl}`)
    } catch (error) {
      spinner.fail(`上传失败 ${chalk.red(`${path}/${file}`)}`)
    }
  })
}
