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
var utils_1 = require("../utils");
var inquirer_1 = require("inquirer");
var node_notifier_1 = require("node-notifier");
var path_1 = require("path");
node_notifier_1.notify({
    'title': 'ssss',
    'icon': path_1.join(__dirname, '../assets/jenkins.png'),
    'message': "ssss"
});
var ora = require('ora');
exports.command = 'deploy [branch]';
exports.aliases = 'deploy';
exports.desc = '部署 项目分支 到Jenkins';
exports.builder = {
    branch: {
        default: shelljs_1.exec('git status | head -n 1  | awk \'{print  $3}\'', { silent: true }).stdout.trim()
    }
};
var JENKINS_TOKEN = shelljs_1.exec('npm config get JENKINS_TOKEN', { silent: true }).stdout.trim();
var jenkisPost = function (data, path) { return new Promise(function (resolve, reject) {
    var body = "json=" + encodeURIComponent(JSON.stringify(data));
    utils_1.request({
        port: 8001,
        hostname: '10.10.106.240',
        method: 'POST',
        auth: JENKINS_TOKEN,
        headers: {
            'Content-Length': Buffer.byteLength(body),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        path: "/jenkins/job/" + path
    }, body).then(function (data) { return resolve(data); });
}); };
exports.handler = function (argv) { return __awaiter(_this, void 0, void 0, function () {
    var spinner, prompt, curBranch, defBranch, redboxResPath, redboxH5Path, resultReg, answer, numb, _a, _b, data, result, now, isSucc, error_1;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                spinner = ora('开始检查配置').start();
                prompt = inquirer_1.createPromptModule();
                if (JENKINS_TOKEN === 'undefined') {
                    return [2 /*return*/, spinner.fail("\u914D\u7F6E\u7F3A\u5C11 JENKINS_TOKE")];
                }
                curBranch = argv.branch;
                defBranch = ['develop', 'master'];
                redboxResPath = "redbox_res_onekey_deploy";
                redboxH5Path = "redbox-h5_onekey_deploy";
                resultReg = /^{"result":"(\w+)"}$/;
                spinner.succeed('检查配置成功').start('开始部署').info();
                _c.label = 1;
            case 1:
                _c.trys.push([1, 9, , 10]);
                return [4 /*yield*/, prompt([{
                            type: 'list',
                            name: 'job',
                            message: '选择执行的Job?',
                            choices: [
                                { name: 'redboxRes', value: redboxResPath },
                                { name: 'redboxH5', value: redboxH5Path }
                            ]
                        }, {
                            type: 'list',
                            name: 'branch',
                            message: '选择发布的分支?',
                            choices: function (answers) { return ([
                                argv.branch
                            ].concat(defBranch.filter(function (b) { return b !== curBranch; }))).map(function (barnch) { return answers.job === redboxResPath ? { name: barnch, value: "origin/" + barnch } : barnch; }); }
                        }, {
                            type: 'list',
                            name: 'env',
                            message: '选择部署的环境?',
                            choices: function (answers) { return answers.job === redboxResPath ? ['QA', 'QA2', 'QA3', 'QA_unit', 'webtest'] : ['QA', 'webtest']; }
                        }, {
                            type: 'confirm',
                            name: 'ok',
                            message: function (answers) { return "\u6267\u884C" + utils_1.lastSpilt(answers.job, '/') + "\u5206\u652F[" + utils_1.lastSpilt(answers.branch, '/') + "]\u90E8\u7F72\u5230[" + answers.env + "]"; },
                            default: false
                        }])];
            case 2:
                answer = _c.sent();
                if (!answer.ok)
                    return [2 /*return*/, spinner.start('部署取消').warn()];
                spinner.start('开始提交Jenkins');
                _b = (_a = /(\d+)/).exec;
                return [4 /*yield*/, jenkisPost({}, answer.job + "/api/json?tree=nextBuildNumber")];
            case 3:
                numb = _b.apply(_a, [_c.sent()])[0];
                return [4 /*yield*/, jenkisPost({
                        'parameter': [{
                                'name': 'BRANCH',
                                'value': answer.branch
                            }, {
                                'name': 'deploy_env',
                                'value': answer.env
                            }]
                    }, answer.job + "/build?")];
            case 4:
                data = _c.sent();
                if (data)
                    throw new Error(data);
                spinner.succeed('提交Jenkins成功').start("\u5F00\u59CB\u6267\u884CJob[" + numb + "]");
                result = '';
                now = Date.now();
                _c.label = 5;
            case 5:
                if (!!resultReg.test(result)) return [3 /*break*/, 8];
                return [4 /*yield*/, jenkisPost({}, answer.job + "/" + numb + "/api/json?tree=result")];
            case 6:
                result = _c.sent();
                return [4 /*yield*/, utils_1.delay(500)];
            case 7:
                _c.sent();
                if (Date.now() - now > 1000 * 5 * 60)
                    return [3 /*break*/, 8];
                return [3 /*break*/, 5];
            case 8:
                isSucc = resultReg.exec(result)[1] === 'SUCCESS';
                spinner[isSucc ? "succeed" : "fail"]("Job\u6267\u884C" + (isSucc ? '成功' : '失败'));
                node_notifier_1.notify({
                    'title': utils_1.lastSpilt(answer.job, '/'),
                    'icon': 'http://10.10.106.240:8001/jenkins/static/81d4cb1c/images/headshot.png',
                    'message': "\u5206\u652F[" + utils_1.lastSpilt(answer.branch, '/') + "]\u90E8\u7F72\u5230[" + answer.env + "]" + (isSucc ? '成功' : '失败')
                });
                return [3 /*break*/, 10];
            case 9:
                error_1 = _c.sent();
                spinner.fail("\u90E8\u7F72\u5931\u8D25: JENKINS_TOKEN[" + JENKINS_TOKEN + "], \u8BF7\u8054\u7CFB\u4F5C\u8005~");
                return [3 /*break*/, 10];
            case 10: return [2 /*return*/];
        }
    });
}); };
