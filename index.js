#!/usr/bin/env node

// Basic setup - load ASAP
require('dotenv').config();

const program = require('commander');
const packageInfo = require('./package.json');

program
  .command('download [mode]')
  .alias('dl')
  .description('Download files from your slack org')
  .option('-o, --output [directory]', 'An output directory to sync files into', process.cwd())
  .option('-f, --force', 'Download all files, overwriting local copies')
  .option('-d, --delete [expireAfter]', 'Delete files after downloading. If specified, only deletes files older than [expireAfter] days. Default is 30', defaultExpiry)
  .option('-a, --age <n>', 'Only download files newer than this age, in days. Default is 0 (any)', parseInt)
  .action(download);


program.on('--help', function() {
    console.log('  Examples:');
    console.log();
    console.log('    $ deploy exec sequential');
    console.log('    $ deploy exec async');
    console.log();
  });

program
  .command('*')
  .action(function(env){
    console.log(argumentsd);
  });

program.parse(process.argv);
if (!program.args.length) program.help();

function download (mode, options) {
 mode = mode || 'all';
 console.log('setup for %s env(s) with %s mode', mode, options.output);
}

function resolveDir(val) {
  return val || process.cwd;
}

function defaultExpiry(val) {
  return parseInt(val) || 30;
}
