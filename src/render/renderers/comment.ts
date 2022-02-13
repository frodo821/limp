import { Renderer } from '..';
import { LimpNodeOf } from '../../parsing/parsing';
import { escape } from '../html/utils';
import renderer from '../renderer';

class CommentRoleRenderer implements Renderer {
  render(node: LimpNodeOf<'role' | 'block_role'>): string {
    if (this.isNoEmit(node)) {
      return '';
    }
    return `<!--${escape(
      node.children.map((it) => renderer.render(it)).join('')
    )}-->`;
  }

  isNoEmit(node: LimpNodeOf<'role' | 'block_role'>): boolean {
    const trues = ['yes', 'y', 'true', 'noemit'];

    return (
      node.args[0] === 'noemit' ||
      'noemit' in node.args ||
      trues.includes(node.args.noemit)
    );
  }
}

const instance = new CommentRoleRenderer();

renderer.registerRenderer('rem', instance);
renderer.registerRenderer('comment', instance);

export default {};
