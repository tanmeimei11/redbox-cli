"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var shelljs_1 = require("shelljs");
var path_1 = require("path");
var fs_1 = require("fs");
var https_1 = require("https");
var utils_1 = require("../utils");
exports.command = 'qiniu [globdir]';
exports.aliases = 'qn';
exports.desc = '图片上传到七牛';
exports.builder = {
    globdir: {
        default: '*.png'
    }
};
var qiniuReUrl = function (key) { return "https://static.in66.co/" + key; };
var qnTokenUrl = 'https://box.in66.co/qiniu-token';
var qiniuUpload = function (path, tokenRes) { return new Promise(function (resolve) { return https_1.request({
    hostname: 'up.qbox.me',
    port: 443,
    path: "/putb64/-1/key/" + tokenRes.key,
    method: 'POST',
    headers: {
        Authorization: "UpToken " + tokenRes.token,
        contentType: 'application/octet-stream'
    }
}, utils_1.resResolve(resolve)).end(fs_1.readFileSync(path).toString('base64')); }); };
var qiniuYun = function (_a) {
    var path = _a.path, name = _a.name;
    return new Promise(function (resolve) { return https_1.get(qnTokenUrl, utils_1.resResolve(resolve)); }).then(function (token) { return __awaiter(_this, void 0, void 0, function () {
        var key;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!token.succ)
                        throw new Error(token.message);
                    return [4 /*yield*/, qiniuUpload(path + "/" + name, token.data)];
                case 1:
                    key = (_a.sent()).key;
                    return [2 /*return*/, qiniuReUrl(key)];
            }
        });
    }); });
};
exports.handler = function (argv) { return __awaiter(_this, void 0, void 0, function () {
    var _this = this;
    var _a, files, spinner;
    return __generator(this, function (_b) {
        _a = utils_1.findFiles({ globdir: argv.globdir }), files = _a[0], spinner = _a[1];
        files.forEach(function (file) { return __awaiter(_this, void 0, void 0, function () {
            var _a, path, name, hash, blueName, qiniuPath, qiniuData, qiniuUrl, _b, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = [path_1.dirname(file), path_1.basename(file), utils_1.getEtag(file)], path = _a[0], name = _a[1], hash = _a[2];
                        blueName = utils_1.chalk.blue(file);
                        qiniuPath = path + "/.qnrc";
                        if (!shelljs_1.test('-f', qiniuPath))
                            fs_1.appendFileSync(qiniuPath, '{}', { flag: 'w' });
                        spinner.start("\u5F00\u59CB\u4E0A\u4F20 " + blueName);
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 5, , 6]);
                        qiniuData = JSON.parse(shelljs_1.cat(qiniuPath));
                        if (!utils_1.hasUpload(name, qiniuData, hash)) return [3 /*break*/, 2];
                        _b = qiniuData["" + name].qiniuUrl;
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, qiniuYun({ path: path, name: name })];
                    case 3:
                        _b = _c.sent();
                        _c.label = 4;
                    case 4:
                        qiniuUrl = _b;
                        qiniuData = JSON.parse(shelljs_1.cat(qiniuPath));
                        qiniuData["" + name] = { hash: hash, qiniuUrl: qiniuUrl };
                        fs_1.appendFileSync(qiniuPath, JSON.stringify(qiniuData, null, '\t'), { flag: 'w' });
                        spinner.succeed("\u4E0A\u4F20\u6210\u529F " + blueName).start().info("\u4E03\u725B\u5730\u5740: " + qiniuUrl);
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _c.sent();
                        spinner.fail("\u4E0A\u4F20\u5931\u8D25 " + utils_1.chalk.red(file));
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        }); });
        return [2 /*return*/];
    });
}); };
