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
exports.command = 'tiny [globdir]';
exports.aliases = 'tiny';
exports.desc = '图片通过tiny压缩';
exports.builder = {
    globdir: {
        default: '*.png'
    }
};
var tinyImg = function (_a) {
    var path = _a.path, name = _a.name;
    return new Promise(function (resolve) { return fs_1.createReadStream(path + "/" + name).pipe(https_1.request({
        hostname: 'tinypng.com',
        port: 443,
        path: '/web/shrink',
        method: 'POST',
        headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1'
        }
    }, utils_1.resResolve(resolve))); });
};
var downImg = function (url, writeS) { return new Promise(function (resolve) { return https_1.get(url, function (imgRes) {
    imgRes.pipe(writeS);
    imgRes.on('end', function () { return resolve(); });
}); }); };
exports.handler = function (argv) { return __awaiter(_this, void 0, void 0, function () {
    var _this = this;
    var _a, files, spinner;
    return __generator(this, function (_b) {
        _a = utils_1.findFiles({ globdir: argv.globdir }), files = _a[0], spinner = _a[1];
        files.forEach(function (file) { return __awaiter(_this, void 0, void 0, function () {
            var _a, path, name, hash, blueName, tinyPath, tinyData, _b, input, output, compressHash, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = [path_1.dirname(file), path_1.basename(file), utils_1.getEtag(file)], path = _a[0], name = _a[1], hash = _a[2];
                        blueName = utils_1.chalk.blue(path + "/" + file);
                        spinner.start("\u5F00\u59CB\u538B\u7F29 " + blueName);
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 6, , 7]);
                        tinyPath = path + "/.tinyrc";
                        if (!shelljs_1.test('-f', tinyPath))
                            fs_1.appendFileSync(tinyPath, '{}', { flag: 'w' });
                        tinyData = JSON.parse(shelljs_1.cat(tinyPath));
                        if (!utils_1.hasUpload(name, tinyData, hash)) return [3 /*break*/, 2];
                        spinner.succeed("\u538B\u7F29\u6210\u529F " + blueName);
                        return [3 /*break*/, 5];
                    case 2: return [4 /*yield*/, tinyImg({ path: path, name: name })];
                    case 3:
                        _b = _c.sent(), input = _b.input, output = _b.output;
                        return [4 /*yield*/, downImg(output.url, fs_1.createWriteStream(path + "/" + name))];
                    case 4:
                        _c.sent();
                        compressHash = utils_1.getEtag(path + "/" + name);
                        tinyData = JSON.parse(shelljs_1.cat(tinyPath));
                        tinyData["" + name] = { hash: compressHash };
                        fs_1.appendFileSync(tinyPath, JSON.stringify(tinyData, null, '\t'), { flag: 'w' });
                        spinner.succeed("\u538B\u7F29\u6210\u529F " + blueName).start().info("\u538B\u7F29\u5927\u5C0F: " + (input.size / 1024).toFixed(2) + "KB  => " + (output.size / 1024).toFixed(2) + "KB");
                        _c.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_1 = _c.sent();
                        spinner.fail("\u538B\u7F29\u5931\u8D25 " + utils_1.chalk.red(path + "/" + file));
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        }); });
        return [2 /*return*/];
    });
}); };
