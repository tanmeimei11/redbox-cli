"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var yargs_1 = require("yargs");
yargs_1.commandDir('cmds')
    .demandCommand()
    .help()
    .locale('zh_CN')
    .argv;
