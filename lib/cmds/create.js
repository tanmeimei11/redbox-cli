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
var fs_1 = require("fs");
var inquirer_1 = require("inquirer");
var path_1 = require("path");
var shelljs_1 = require("shelljs");
var ora = require('ora');
var download = require('download-git-repo');
var execPromise = function (cmd) { return new Promise(function (resolve, reject) {
    shelljs_1.exec(cmd, function (code, out) {
        resolve(out);
    });
}); };
exports.command = "create [project]";
exports.aliases = "create";
exports.desc = "\u5728\u5F53\u524D\u4ECE\u6A21\u677F\u521B\u5EFA\u65B0\u9879\u76EE";
exports.builder = {
    project: {
        default: 'my-project'
    }
};
var repoTpl = "gitlab:githost.in66.cc:in-template/redbox-tpl";
var tplBranch = ["promo-tpl"];
exports.handler = function (argv) { return __awaiter(_this, void 0, void 0, function () {
    var spinner, prompt, answer, projectName, template, dest, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                spinner = ora('开始创建').info();
                prompt = inquirer_1.createPromptModule();
                _a.label = 1;
            case 1:
                _a.trys.push([1, 5, , 6]);
                return [4 /*yield*/, prompt([{
                            type: 'list',
                            name: 'template',
                            message: '选择模板?',
                            choices: tplBranch
                        }, {
                            type: 'confirm',
                            name: 'newDir',
                            message: function (answers) { return "\u521B\u5EFA\u65B0\u7684\u76EE\u5F55" + argv.project + "\u5417?"; },
                            default: true
                        }])];
            case 2:
                answer = _a.sent();
                projectName = answer.newDir ? argv.project : '';
                template = repoTpl + "#" + answer.template;
                dest = path_1.join(process.cwd(), projectName, answer.template);
                return [4 /*yield*/, downloadRepo(template, dest, projectName)];
            case 3:
                _a.sent();
                return [4 /*yield*/, installDepence(projectName)];
            case 4:
                _a.sent();
                spinner.succeed('创建成功!');
                return [3 /*break*/, 6];
            case 5:
                err_1 = _a.sent();
                console.log(err_1);
                spinner.fail("\u521B\u5EFA\u5931\u8D25, \u8BF7\u8054\u7CFB\u4F5C\u8005~");
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
function downloadRepo(template, dest, projectName) {
    if (projectName === void 0) { projectName = ''; }
    return new Promise(function (resolve, reject) {
        if (fs_1.existsSync(dest))
            shelljs_1.rm('-rf', dest);
        var spinner = ora('下载模板中...').start().info();
        spinner.info("git clone " + repoTpl);
        download(template, dest, { clone: true }, function (err) {
            if (err) {
                spinner.fail("\u6A21\u677F\u4E0B\u8F7D\u5931\u8D25: " + err.message.trim());
                reject(err);
                return;
            }
            spinner.succeed('模板下载成功');
            shelljs_1.cp('-R', dest + "/template/*", path_1.join(process.cwd(), projectName));
            shelljs_1.rm('-rf', dest);
            resolve();
        });
    });
}
function installDepence(projectName) {
    return __awaiter(this, void 0, void 0, function () {
        var spinner;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    spinner = ora('开始安装依赖\n').start();
                    return [4 /*yield*/, shelljs_1.exec("cd " + (projectName || '.') + " && npm i")];
                case 1:
                    _a.sent();
                    spinner.succeed('依赖安装完成');
                    return [2 /*return*/];
            }
        });
    });
}
