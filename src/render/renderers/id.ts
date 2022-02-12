import { Renderer } from '..';
import { LimpNodeOf } from '../../parsing/parsing';
import renderer from '../renderer';

class IDRoleRenderer implements Renderer {
  render(node: LimpNodeOf<'role' | 'block_role'>): string {
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
}

renderer.registerRenderer('id', new IDRoleRenderer());

export default {};
