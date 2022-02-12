const fs = require('fs');
const path = require('path');
const limp = require('..');

/**
 * render text templates with variables
 * @param {string} template template string
 * @param {{[key: string]: string}} vars variables to interpolate
 * @returns {string} interpolated string
 */
function renderTemplate(template, vars) {
  return template.replace(/(?<!\\)\$[a-z0-9_]+/gi, function (str) {
    return vars[str.slice(1)] || str;
  }).replace('\\$', '$');
}

/**
 * @param {string} basepath
 * @returns {string[]}
 */
function getAllFilesToCompile(basepath) {
  const dir = fs.opendirSync(basepath);
  const ret = [];

  /** @type {fs.Dirent}
   */
  let item;

  while ((item = dir.readSync()) !== null) {
    const fullpath = path.join(basepath, item.name);

    if (item.isDirectory()) {
      ret.push(...getAllFilesToCompile(fullpath));
    }

    if (item.isFile() && path.extname(item.name) === '.limp') {
      ret.push(fullpath);
    }
  }

  return ret;
}

/**
 * @param {string} basepath 
 * @param {string} outpath 
 * @param {string} dirpath 
 * @param {string[]} excludes
 * @returns 
 */
function copyAssetFiles(basepath, outpath, dirpath, excludes) {
  const dir = fs.opendirSync(dirpath);

  /** @type {fs.Dirent}
   */
  let item;

  while ((item = dir.readSync()) !== null) {
    const fullpath = path.join(dirpath, item.name);

    if (excludes.some(it => new RegExp(it).test(item.name))) {
      continue;
    }

    if (item.isDirectory()) {
      copyAssetFiles(basepath, outpath, fullpath, excludes);
    }

    if (item.isFile()) {
      const copyTo = path.resolve(outpath, path.relative(basepath, fullpath));

      /**
       * @type {string}
       */
      let dirname;
      if (!fs.existsSync(dirname = path.dirname(copyTo))) {
        fs.mkdirSync(dirname, { recursive: true });
      }

      fs.copyFileSync(fullpath, copyTo);
    }
  }
}

/**
 * @param {string} file 
 * @param {string} docs 
 * @param {string} output 
 * @returns {[string, string]}
 */
function getOutputPath(file, docs, output) {
  const outDir = path.resolve(output, path.relative(docs, path.dirname(file)));
  const name = `${path.basename(file, '.limp')}.html`;

  return [path.resolve(outDir, name), outDir];
}

function main() {
  const template = fs.readFileSync(path.join(__dirname, '..', 'docs', 'template', 'template.html'), 'utf8');
  const baseDir = path.dirname(__dirname);
  const docsDir = path.join(baseDir, 'docs');
  const outputDir = path.join(baseDir, 'build', 'docs');
  const files = getAllFilesToCompile(docsDir);

  for (let file of files) {
    const out = limp.compile(fs.readFileSync(file, 'utf8'));
    const [outPath, outDir] = getOutputPath(file, docsDir, outputDir);

    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    fs.writeFileSync(
      outPath,
      renderTemplate(template,
        {
          'filename': out.match(/<h\d>(.*)<\/h\d>/i)?.[0]?.replace(/<.*?>/g, '') ?? '',
          'filepath': path.relative(outputDir, outPath),
          'content': out,
        }
      )
    );
  }

  copyAssetFiles(
    docsDir,
    outputDir,
    docsDir,
    ['template', '.limp$']);
}

main();
