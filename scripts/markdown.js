#!/usr/bin/env node

(function () {
  const fs = require('fs');
  const limp = require('../lib');

  const args = [...process.argv];

  for (; args.length > 0;) {
    if (args.shift() === __filename) {
      break;
    }
  }

  if (args.length === 0) {
    console.log(`Usage: ${__filename} [file]`);
    return;
  }

  for (let arg of args) {
    if (!fs.existsSync(arg)) {
      console.warn(`file "${arg}" is not found. skipping.`);
    }

    const file = arg.match(/^(.*?)(?:\.[^.]+)?$/)[1];
    const out = limp.compileToMarkdown(fs.readFileSync(arg, 'utf8'))

    fs.writeFileSync(`${file}.md`, out);
  }
}());
