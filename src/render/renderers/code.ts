import { Renderer } from '..';
import { LimpNodeOf } from '../../parsing/parsing';
import renderer from '../renderer';

function escape(str: string): string {
  return str.replace(/[&><"]/g, function (s: string) {
    return (
      {
        '&': '&amp;',
        '>': '&gt;',
        '<': '&lt;',
        '"': '&quot;',
      }[s] || s
    );
  });
}

class CodeRoleRenderer implements Renderer {
  render(node: LimpNodeOf<'role' | 'block_role'>): string {
    if (node.type === 'role') {
      return `<code>${escape(
        node.children.map((it) => renderer.render(it)).join('')
      )}</code>`;
    }
    return `<code><pre>${escape(
      node.children.map((it) => renderer.render(it)).join('')
    )}</pre></code>`;
  }
}

renderer.registerRenderer('code', new CodeRoleRenderer());

export default {};
