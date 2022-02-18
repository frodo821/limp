import { Renderer } from '../..';
import { LimpNodeOf } from '../../../parsing/parsing';
import renderer from '../markdownRenderer';

class AnchorRoleRenderer implements Renderer {
  render(node: LimpNodeOf<'role' | 'block_role'>): string {
    return `[${node.children.map((it) => renderer.render(it)).join('')}](${node.args[0] || node.args['url']})`;
  }
}

renderer.registerRenderer('ref', new AnchorRoleRenderer());

export default {};
