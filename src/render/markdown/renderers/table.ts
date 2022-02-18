import { Renderer } from '../..';
import { LimpNodeOf, LimpNode } from '../../../parsing/parsing';
import renderer from '../markdownRenderer';

class TableRenderer implements Renderer {
  render(node: LimpNodeOf<'role' | 'block_role'>): string {
    if (node.type === 'role') {
      return `<span class="limp-inline limp-malformed">${renderer.render(
        node
      )}</span>`;
    }

    switch (node.name) {
      case 'table':
        return this.renderTable(node);
      case 'th':
        return this.renderHeading(node);
      case 'tr':
        return this.renderRow(node);
      default:
        return `<div class="limp-block limp-malformed">${renderer.render(
          node
        )}</div>`;
    }
  }

  renderTable(node: LimpNodeOf<'block_role'>): string {
    return node.children
      .map((it) => renderer.render(it))
      .join('')
      .replace(/\n\n/g, '\n');
  }

  renderHeading(node: LimpNodeOf<'block_role'>): string {
    return `|${node.children
      .map((it) => this.renderColumn(it))
      .join('|')
      .replace(/\n/g, '<br/>')}|\n|${':-:|'.repeat(node.children.length)}`;
  }

  renderRow(node: LimpNodeOf<'block_role'>): string {
    return `|${node.children
      .map((it) => this.renderColumn(it))
      .join('|')
      .replace(/\n/g, '<br/>')}|`;
  }

  renderColumn(node: LimpNode): string {
    return node.children.map((it) => renderer.render(it)).join('');
  }
}

const instance = new TableRenderer();

renderer.registerRenderer('table', instance);
renderer.registerRenderer('th', instance);
renderer.registerRenderer('tr', instance);
renderer.registerRenderer('td', instance);

export default {};
