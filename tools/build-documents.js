const fs = require('fs');
const path = require('path');
const limp = require('..');
const { 'default': renderer } = require('../lib/render');
const { version, repository, name: packageName } = require('../package.json');

class ExtraDataRole {
  constructor() {
    this.data = {};
  }

  clear() {
    this.data = {};
  }

  getDataOnce() {
    const data = { ...this.data };
    this.clear();
    return data;
  }

  /**
   * @param {LimpNode} node 
   * @returns {string}
   */
  render(node) {
    if (node.type !== 'block_role') {
      console.warn('data role cannot be applied to a inline text');
      return '';
    }

    const first = node.children[0];

    if (!first || first.type !== 'text') {
      console.warn('expected a json string');
      return '';
    }

    try {
      Object.assign(this.data, JSON.parse(first.self));
    } catch {
      console.warn('malformed json string');
    }

    console.log(this.data);

    return '';
  }
}

const collector = new ExtraDataRole();

renderer.registerRenderer('data', collector);

/**
 * render text templates with variables
 * @param {string} template template string
 * @param {{[key: string]: string}} vars variables to interpolate
 * @returns {string} interpolated string
 */
function renderTemplate(template, vars) {
  if ('content' in vars) {
    template = template.replace(/\$content/g, vars.content);
  }

  return template.replace(/(?<!\\)\$[a-z0-9_]+/gi, function (str) {
    const name = str.slice(1);
    if (!name in vars) {
      console.warn(`!!!warning: variable ${name} not found in the current context!!!`);
      return str;
    }
    return vars[name];
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
  const indices = {};

  for (let file of files) {
    const content = limp.compile(fs.readFileSync(file, 'utf8'));
    const extras = collector.getDataOnce();
    const [outPath, outDir] = getOutputPath(file, docsDir, outputDir);

    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const filename = content.match(/<h(\d)>(.*)<\/h\1>/i)?.[2]?.replace(/<.*?>/g, '') ?? '';
    const filepath = path.relative(outputDir, outPath).replace(/\\/g, '/');

    indices[filepath] = { title: filename, extras };

    fs.writeFileSync(
      outPath,
      renderTemplate(template,
        {
          filename,
          filepath,
          content,
          version,
          repository,
          package: packageName,
          ...extras,
        }
      )
    );
  }

  fs.writeFileSync(path.join(outputDir, 'indices.json'), JSON.stringify(indices));

  copyAssetFiles(
    docsDir,
    outputDir,
    docsDir,
    ['template', '.limp$']);
}

main();
