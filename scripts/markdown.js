#!/usr/bin/env node

class MarkdownRenderer {
  constructor() {
    this.renderers = {};
    MarkdownRenderer.instance = this;
  }
  static get current() {
    return this.instance;
  }
  registerRenderer(name, renderer) {
    this.renderers[name] = renderer;
  }
  render(node) {
    switch (node.type) {
      case 'text':
        return this.text(node);
      case 'role':
        return this.role(node);
      case 'title':
        return this.title(node);
      case 'block_role':
        return this.block_role(node);
      case 'root':
        return this.root(node);
      case 'paragraph':
        return this.paragraph(node);
      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }
  paragraph(node) {
    return `${node.children.map((it) => this.render(it)).join('')}\n\n`;
  }
  text(node) {
    return node.self;
  }
  role(node) {
    const renderer = this.renderers[node.name];
    if (renderer) {
      return renderer.render(node);
    }
    else {
      return node.children.map((it) => this.render(it)).join('');
    }
  }
  title(node) {
    return `${'#'.repeat(node.level)} ${node.children.map((it) => this.render(it)).join('')}\n`;
  }
  block_role(node) {
    const renderer = this.renderers[node.name];
    if (renderer) {
      const result = renderer.render(node);
      return result ? `\n${result}\n` : '';
    }
    else {
      return `<div class="limp-unknown limp-${node.name}">${node.children.map((it) => this.render(it)).join('')}</div>`;
    }
  }
  root(node) {
    return `${node.children.map((it) => this.render(it)).join('')}`;
  }
}

function escape(str) {
  return str.replace(/[`]/g, function (s) {
    return ({
      '`': '\\`'
    }[s] || s);
  });
}

const anchor = (renderer) => ({
  render(node) {
    return `[${node.children.map((it) => renderer.render(it)).join('')}](${node.args[0] || node.args['url']})`;
  }
});

const code = (renderer) => ({
  render(node) {
    if (node.type === 'role') {
      return `\`${escape(node.children.map((it) => renderer.render(it)).join(''))}\``;
    }
    return `\`\`\`\n${node.children.map((it) => renderer.render(it)).join('')}\`\`\``;
  }
});

const image = (renderer) => ({
  render(node) {
    const href = node.args[0] || node.args['url'];
    const alt = node.args[1] || node.args['alt'];
    const title = node.args[2] || node.args['title'];
    return `![${alt || ''}${title ? ` "${title}"` : ''}](${href})`;
  }
});

const decorations = (renderer) => ({
  render(node) {
    switch (node.name) {
      case 'underlined':
      case 'u':
        return `_${node.children
          .map((it) => renderer.render(it))
          .join('')}_`;
      case 'strike':
      case 's':
        return `~~${node.children
          .map((it) => renderer.render(it))
          .join('')}~~`;
      case 'italic':
      case 'i':
        return `*${node.children
          .map((it) => renderer.render(it))
          .join('')}*`;
      case 'bold':
      case 'b':
        return `**${node.children
          .map((it) => renderer.render(it))
          .join('')}**`;
      case 'br':
        return `  \n`;
      default:
        return `<span class="limp-inline limp-${node.name}">${renderer.render(node)}</span>`;
    }
  }
});

const id = (renderer) => ({
  render(node) {
    const id = node.args[0] || node.args['id'];
    if (node.type === 'role') {
      return `<span id="${id}">${node.children
        .map((it) => renderer.render(it))
        .join('')}</span>`;
    }
    return `<div id="${id}">${node.children
      .map((it) => renderer.render(it))
      .join('')}</div>`;
  }
});

const list = (renderer) => ({
  render(node, type) {
    type = type || node.args[0] || node.args['type'] || 'ordered';

    if (node.type === 'role') {
      return `<span>${node.children
        .map((it) => renderer.render(it))
        .join('')}</span>`;
    }
    if (node.name === 'list') {
      return node.children
        .map((it) => this.render(it))
        .join('')
        .trim();
    }
    const bullet = type === 'ordered' ? `1.` : '-';

    return `${bullet} ${node.children
      .map((it) => renderer.render(it))
      .join('')
      .replace(/\n/g, '\n  ')}\n`;
  }
});

const table = (renderer) => ({
  render(node) {
    switch (node.name) {
      case 'table':
        return this.renderTable(node);
      case 'th':
        return this.renderHeading(node);
      case 'tr':
        return this.renderRow(node);
      case 'td':
        return this.renderColumn(node);
      default:
        return `<div class="limp-block limp-malformed">${renderer.render(node)}</div>`;
    }
  },
  renderTable(node) {
    return node.children
      .map((it) => renderer.render(it))
      .join('')
      .replace(/\n\n/g, '\n');
  },
  renderHeading(node) {
    return `|${node.children
      .map((it) => renderer.render(it, false))
      .join('|')
      .replace(/\n/g, '<br/>')}|\n|${':-:|'.repeat(node.children.length)}`;
  },
  renderRow(node) {
    return `|${node.children
      .map((it) => this.renderColumn(it, true))
      .join('|')
      .replace(/\n/g, '<br/>')}|`;
  },
  renderColumn(node) {
    return node.children
      .map((it) => renderer.render(it))
      .join('');
  }
});

(function () {
  const fs = require('fs');
  const limp = require('../lib');

  const args = [...process.argv];

  const renderer = new MarkdownRenderer();

  renderer.registerRenderer('ref', anchor(renderer));
  renderer.registerRenderer('code', code(renderer));
  renderer.registerRenderer('image', image(renderer));
  renderer.registerRenderer('img', image(renderer));
  renderer.registerRenderer('bold', decorations(renderer));
  renderer.registerRenderer('italic', decorations(renderer));
  renderer.registerRenderer('underlined', decorations(renderer));
  renderer.registerRenderer('strike', decorations(renderer));
  renderer.registerRenderer('b', decorations(renderer));
  renderer.registerRenderer('i', decorations(renderer));
  renderer.registerRenderer('u', decorations(renderer));
  renderer.registerRenderer('s', decorations(renderer));
  renderer.registerRenderer('id', id(renderer));
  renderer.registerRenderer('label', id(renderer));
  renderer.registerRenderer('list', list(renderer));
  renderer.registerRenderer('item', list(renderer));
  renderer.registerRenderer('table', table(renderer));
  renderer.registerRenderer('th', table(renderer));
  renderer.registerRenderer('tr', table(renderer));
  renderer.registerRenderer('td', table(renderer));

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

    const ast = limp.parseDocument(fs.readFileSync(arg, 'utf8'));

    const out = renderer.render(ast)

    fs.writeFileSync(`${file}.md`, out);
  }
}());
