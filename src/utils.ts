import { request as _request } from 'http'
import { createHash } from 'crypto'
import { readFileSync } from 'fs'

/**
 * 延迟等待
 * @param time 毫秒数
 */
export const delay = time => new Promise(resolve => setTimeout(() => resolve(),time))

/**
 * 请求
 * @param options 参数
 * @param body 内容
 */
export const request = (options,body) => new Promise<string>(resolve => {
  let req = _request(options,res => {
    let rawData = ''
    res.setEncoding('utf8')
    res.on('data', chunk => (rawData += chunk))
    res.on('end', () => resolve(rawData))
  })
  req.write(body)
  req.end()
})

/**
 * 处理结果
 * @param resolve
 */
export const resResolve = resolve => uploadRes => {
  let resInfo = ''
  uploadRes.on('data', chunk => {
    resInfo += chunk
  }).on('end', () => {
    resolve(JSON.parse(resInfo.toString()))
  })
}

/**
 * 分割获取最后一个字符串
 * @param val 字符串
 * @param spilt 分隔符
 */
export const lastSpilt = (val,spilt) => val.split(spilt).slice(-1)

/**
 * 判断文件是否上传
 * @param name
 * @param obj
 * @param hash
 */
export const hasUpload = (name,obj,hash) => (name in obj && obj[`${name}`].hash === hash)
/**
 * 获取七牛hash值
 * @param file 文件
 */
export const getEtag = file => {
  // 以4M为单位分割
  let blockSize = 4 * 1024 * 1024
  let sha1String = []
  let prefix = 0x16
  let blockCount = 0

  // sha1算法
  let sha1 = function (content) {
    let sha1 = createHash('sha1')
    sha1.update(content)
    return sha1.digest()
  }

  function calcEtag () {
    if (!sha1String.length) {
      return 'Fto5o-5ea0sNMlW_75VgGJCv2AcJ'
    }
    let sha1Buffer = Buffer.concat(sha1String, blockCount * 20)

      // 如果大于4M，则对各个块的sha1结果再次sha1
    if (blockCount > 1) {
      prefix = 0x96
      sha1Buffer = sha1(sha1Buffer)
    }

    sha1Buffer = Buffer.concat(
          [new Buffer([prefix]), sha1Buffer],
          sha1Buffer.length + 1
      )

    return sha1Buffer.toString('base64')
          .replace(/\//g, '_').replace(/\+/g, '-')
  }

  let buffer = readFileSync(file)
  let bufferSize = buffer.length
  blockCount = Math.ceil(bufferSize / blockSize)

  for (let i = 0; i < blockCount; i++) {
    sha1String.push(sha1(buffer.slice(i * blockSize, (i + 1) * blockSize)))
  }

  return calcEtag()
}
