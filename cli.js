const DEFAULT_HTML_TEMPLATE = `<!DOCTYPE html>\
<html lang="en"><head><meta charset="UTF-8" /><meta http-equiv="X-UA-Compatible" content="IE=edge" />\
<meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>$FILENAME</title></head>\
<body>$CONTENT</body></html>`;

(function () {
  const fs = require('fs');
  const limp = require('.');

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

    const out = limp.compile(fs.readFileSync(arg, 'utf8'));
    fs.writeFileSync(
      `${file}.html`,
      DEFAULT_HTML_TEMPLATE.replace(/(?<!\\)\$[a-z0-9_]+/gi, function (str) {
        return {
          '$FILENAME': file,
          '$CONTENT': out,
        }[str] || str;
      }).replace('\\$', '$'));
  }
}());
