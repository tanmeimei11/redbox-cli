"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("http");
exports.delay = function (time) { return new Promise(function (resolve) { return setTimeout(function () { return resolve(); }, time); }); };
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
exports.lastSpilt = function (val, spilt) { return val.split(spilt).slice(-1); };
