import { ls, test, cat } from 'shelljs'
import { dirname, basename, resolve } from 'path'
import { readFileSync, appendFileSync, createReadStream, createWriteStream } from 'fs'
import { get, request } from 'https'
import { getEtag, resResolve, hasUpload, findFiles, chalk } from '../utils'

export const command = 'tiny [globdir]'
export const aliases = 'tiny'
export const desc = '图片通过tiny压缩'
export const builder = {
  globdir: {
    default: '*.png'
  }
}
type tinyRes = { input: { size: number }, output: { size: number, url: string } }
const tinyImg = ({ path, name }) => new Promise<tinyRes>(resolve => createReadStream(`${path}/${name}`).pipe(request({
  hostname: 'tinypng.com',
  port: 443,
  path: '/web/shrink',
  method: 'POST',
  headers: {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1'
  }
}, resResolve(resolve))))

const downImg = (url, writeS) => new Promise(resolve => get(url, imgRes => {
  imgRes.pipe(writeS)
  writeS.on('close', () => resolve())
  // imgRes.on('end', () => resolve())
}))

export const handler = async argv => {
  const [files, spinner] = findFiles({ globdir: argv.globdir })
  files.forEach(async file => {
    const [path, name, hash] = [dirname(file), basename(file), getEtag(file)]
    const blueName = chalk.blue(file)
    spinner.start(`开始压缩 ${blueName}`)
    try {
      let tinyPath = `${path}/.tinyrc`
      if (!test('-f', tinyPath)) appendFileSync(tinyPath, '{}', { flag: 'w' })
      let tinyData = JSON.parse(cat(tinyPath))
      if (hasUpload(name, tinyData, hash)) {
        spinner.succeed(`压缩成功 ${blueName}`)
      } else {
        const { input, output } = await tinyImg({ path, name })
        let writeS = createWriteStream(`${path}/${name}`)
        await downImg(output.url, writeS)
        let compressHash = getEtag(`${path}/${name}`)
        tinyData = JSON.parse(cat(tinyPath))
        tinyData[`${name}`] = { hash: compressHash }
        appendFileSync(tinyPath, JSON.stringify(tinyData, null, '\t'), { flag: 'w' })
        spinner.succeed(`压缩成功 ${blueName}`).start().info(`压缩大小: ${(input.size / 1024).toFixed(2)}KB  => ${(output.size / 1024).toFixed(2)}KB`)
      }
    } catch (error) {
      spinner.fail(`压缩失败 ${chalk.red(file)}`)
    }
  })
}
