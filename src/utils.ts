import { request as _request } from 'http'

export const delay = time => new Promise(resolve => setTimeout(() => resolve(),time))

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

export const lastSpilt = (val,spilt) => val.split(spilt).slice(-1)
