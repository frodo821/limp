import { Renderer } from '..';
import { LimpNodeOf } from '../../parsing/parsing';
import { escape } from '../html/utils';
import renderer from '../renderer';

class CommentRoleRenderer implements Renderer {
  render(node: LimpNodeOf<'role' | 'block_role'>): string {
    return `<!--${escape(
      node.children.map((it) => renderer.render(it)).join('')
    )}-->`;
  }
}

const instance = new CommentRoleRenderer();

renderer.registerRenderer('rem', instance);
renderer.registerRenderer('comment', instance);

export default {};
