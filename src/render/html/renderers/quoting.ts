import { Renderer } from '../..';
import { LimpNodeOf } from '../../../parsing/parsing';
import { escape } from '../utils';
import renderer from '../htmlRenderer';

class QuoteRenderer implements Renderer {
  render(node: LimpNodeOf<'role' | 'block_role'>): string {
    if (node.type === 'role') {
      return `<q>${escape(
        node.children.map((it) => renderer.render(it)).join('')
      )}</q>`;
    }
    return `<blockquote>${escape(
      node.children.map((it) => renderer.render(it)).join('')
    )}</blockquote>`;
  }
}

const instance = new QuoteRenderer();

renderer.registerRenderer('quote', instance);
renderer.registerRenderer('q', instance);

export default {};
