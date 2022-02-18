import { Renderer } from '../..';
import { LimpNodeOf } from '../../../parsing/parsing';
import { escape } from '../utils';
import renderer from '../htmlRenderer';

class CodeRoleRenderer implements Renderer {
  render(node: LimpNodeOf<'role' | 'block_role'>): string {
    if (node.type === 'role') {
      return `<code class="limp-inline">${escape(
        node.children.map((it) => renderer.render(it)).join('')
      )}</code>`;
    }
    return `<pre class="limp-block"><code>${escape(
      node.children.map((it) => renderer.render(it)).join('')
    )}</code></pre>`;
  }
}

renderer.registerRenderer('code', new CodeRoleRenderer());

export default {};
