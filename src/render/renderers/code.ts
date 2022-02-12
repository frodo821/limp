import { Renderer } from '..';
import { LimpNodeOf } from '../../parsing/parsing';
import renderer from '../renderer';

class CodeRoleRenderer implements Renderer {
  render(node: LimpNodeOf<'role' | 'block_role'>): string {
    if (node.type === 'role') {
      return `<code>${node.children
        .map((it) => renderer.render(it))
        .join('')}</code>`;
    }
    return `<code><pre>${node.children
      .map((it) => renderer.render(it))
      .join('')}</pre></code>`;
  }
}

renderer.registerRenderer('code', new CodeRoleRenderer());

export default {};
