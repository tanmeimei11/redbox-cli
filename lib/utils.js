"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("http");
var crypto_1 = require("crypto");
var fs_1 = require("fs");
/**
 * 延迟等待
 * @param time 毫秒数
 */
exports.delay = function (time) { return new Promise(function (resolve) { return setTimeout(function () { return resolve(); }, time); }); };
/**
 * 请求
 * @param options 参数
 * @param body 内容
 */
exports.request = function (options, body) { return new Promise(function (resolve) {
    var req = http_1.request(options, function (res) {
        var rawData = '';
        res.setEncoding('utf8');
        res.on('data', function (chunk) { return (rawData += chunk); });
        res.on('end', function () { return resolve(rawData); });
    });
    req.write(body);
    req.end();
}); };
/**
 * 处理结果
 * @param resolve
 */
exports.resResolve = function (resolve) { return function (uploadRes) {
    var resInfo = '';
    uploadRes.on('data', function (chunk) {
        resInfo += chunk;
    }).on('end', function () {
        resolve(JSON.parse(resInfo.toString()));
    });
}; };
/**
 * 分割获取最后一个字符串
 * @param val 字符串
 * @param spilt 分隔符
 */
exports.lastSpilt = function (val, spilt) { return val.split(spilt).slice(-1); };
/**
 * 判断文件是否上传
 * @param name
 * @param obj
 * @param hash
 */
exports.hasUpload = function (name, obj, hash) { return (name in obj && obj["" + name].hash === hash); };
/**
 * 获取七牛hash值
 * @param file 文件
 */
exports.getEtag = function (file) {
    // 以4M为单位分割
    var blockSize = 4 * 1024 * 1024;
    var sha1String = [];
    var prefix = 0x16;
    var blockCount = 0;
    // sha1算法
    var sha1 = function (content) {
        var sha1 = crypto_1.createHash('sha1');
        sha1.update(content);
        return sha1.digest();
    };
    function calcEtag() {
        if (!sha1String.length) {
            return 'Fto5o-5ea0sNMlW_75VgGJCv2AcJ';
        }
        var sha1Buffer = Buffer.concat(sha1String, blockCount * 20);
        // 如果大于4M，则对各个块的sha1结果再次sha1
        if (blockCount > 1) {
            prefix = 0x96;
            sha1Buffer = sha1(sha1Buffer);
        }
        sha1Buffer = Buffer.concat([new Buffer([prefix]), sha1Buffer], sha1Buffer.length + 1);
        return sha1Buffer.toString('base64')
            .replace(/\//g, '_').replace(/\+/g, '-');
    }
    var buffer = fs_1.readFileSync(file);
    var bufferSize = buffer.length;
    blockCount = Math.ceil(bufferSize / blockSize);
    for (var i = 0; i < blockCount; i++) {
        sha1String.push(sha1(buffer.slice(i * blockSize, (i + 1) * blockSize)));
    }
    return calcEtag();
};
