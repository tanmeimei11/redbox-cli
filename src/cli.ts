import { commandDir } from 'yargs'
commandDir('cmds')
  .demandCommand()
  .help()
  .locale('zh_CN')
  .argv
