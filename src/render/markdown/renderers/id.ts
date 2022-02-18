import { Renderer } from '../..';
import { LimpNodeOf } from '../../../parsing/parsing';
import renderer from '../markdownRenderer';

class LabelRoleRenderer implements Renderer {
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

const instance = new LabelRoleRenderer();

renderer.registerRenderer('id', instance);
renderer.registerRenderer('label', instance);

export default {};
