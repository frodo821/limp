import { Renderer } from '..';
import { LimpNodeOf } from '../../parsing/parsing';
import renderer from '../renderer';

class AnchorRoleRenderer implements Renderer {
  render(node: LimpNodeOf<'role' | 'block_role'>): string {
    const href = node.args[0] || node.args['url'];
    const target = node.args[1] || node.args['target'] || '_self';

    if (node.type === 'role') {
      return `<a href="${href}" target="${target}" class="limp-inline">${node.children
        .map((it) => renderer.render(it))
        .join('')}</a>`;
    }
    return `<a href="${href}" target="${target}" class="limp-block">${node.children
      .map((it) => renderer.render(it))
      .join('')}</a>`;
  }
}

renderer.registerRenderer('ref', new AnchorRoleRenderer());

export default {};
