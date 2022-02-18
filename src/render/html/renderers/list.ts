import { Renderer } from '../..';
import { LimpNodeOf } from '../../../parsing/parsing';
import renderer from '../htmlRenderer';

class ListRenderer implements Renderer {
  render(node: LimpNodeOf<'role' | 'block_role'>): string {
    if (node.type === 'role') {
      return `<span>${node.children
        .map((it) => renderer.render(it))
        .join('')}</span>`;
    }

    if (node.name === 'list') {
      const type = node.args[0] || node.args['type'] || 'ordered';

      if (type === 'unordered') {
        return `<ul>${node.children
          .map((it) => renderer.render(it))
          .join('')}</ul>`;
      }

      return `<ol>${node.children
        .map((it) => renderer.render(it))
        .join('')}</ol>`;
    }

    return `<li>${node.children
      .map((it) => renderer.render(it))
      .join('')}</li>`;
  }
}

const instance = new ListRenderer();

renderer.registerRenderer('list', instance);
renderer.registerRenderer('item', instance);

export default {};
