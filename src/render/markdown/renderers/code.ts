import { Renderer } from '../..';
import { LimpNodeOf } from '../../../parsing/parsing';
import { escape } from '../utils';
import renderer from '../markdownRenderer';

class CodeRoleRenderer implements Renderer {
  render(node: LimpNodeOf<'role' | 'block_role'>): string {
    if (node.type === 'role') {
      return `\`${escape(
        node.children.map((it) => renderer.render(it)).join('')
      )}\``;
    }
    return `\`\`\`\n${node.children
      .map((it) => renderer.render(it))
      .join('')}\`\`\``;
  }
}

renderer.registerRenderer('code', new CodeRoleRenderer());

export default {};
