import { Renderer } from '../..';
import { LimpNodeOf, LimpNode } from '../../../parsing/parsing';
import renderer from '../markdownRenderer';

class ListRenderer implements Renderer {
  render(node: LimpNodeOf<'role' | 'block_role'>): string {
    return this.renderInternal(node);
  }

  renderInternal(node: LimpNode, type?: string): string {
    if (node.type !== 'block_role') {
      return `<span>${node.children
        .map((it) => renderer.render(it))
        .join('')}</span>`;
    }

    type = type || node.args[0] || node.args['type'] || 'ordered';

    if (node.name === 'list') {
      return node.children
        .map((it) => this.renderInternal(it as any, type))
        .join('')
        .trim();
    }

    const bullet = type === 'ordered' ? `1.` : '-';

    return `${bullet} ${node.children
      .map((it) => renderer.render(it))
      .join('')
      .replace(/\n/g, '\n  ')}\n`;
  }
}

const instance = new ListRenderer();

renderer.registerRenderer('list', instance);
renderer.registerRenderer('item', instance);

export default {};
