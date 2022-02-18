import { Renderer } from '../..';
import { LimpNodeOf, LimpNode } from '../../../parsing/parsing';
import renderer from '../htmlRenderer';

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
    return `<table class="limp-block limp-table">${node.children
      .map((it) => renderer.render(it))
      .join('')}</table>`;
  }

  renderHeading(node: LimpNodeOf<'block_role'>): string {
    return `<tr class="limp-block limp-table-heading">${node.children
      .map((it) => this.renderColumn(it, false))
      .join('')}</tr>`;
  }

  renderRow(node: LimpNodeOf<'block_role'>): string {
    return `<tr class="limp-block limp-table-row">${node.children
      .map((it) => this.renderColumn(it, true))
      .join('')}</tr>`;
  }

  renderColumn(node: LimpNode, in_body: boolean): string {
    const tag = in_body ? 'td' : 'th';

    if (node.type !== 'role' || node.name !== 'td') {
      return `<${tag} class="limp-block limp-table-cell limp-malformed">${renderer.render(
        node
      )}</${tag}>`;
    }

    return `<${tag} class="limp-block limp-table-cell">${node.children
      .map((it) => renderer.render(it))
      .join('')}</${tag}>`;
  }
}

const instance = new TableRenderer();

renderer.registerRenderer('table', instance);
renderer.registerRenderer('th', instance);
renderer.registerRenderer('tr', instance);
renderer.registerRenderer('td', instance);

export default {};
