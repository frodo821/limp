import { Renderer } from '../..';
import { LimpNodeOf } from '../../../parsing/parsing';
import renderer from '../markdownRenderer';

class ImageRoleRenderer implements Renderer {
  render(node: LimpNodeOf<'role' | 'block_role'>): string {
    const href = node.args[0] || node.args['url'];
    const alt = node.args[1] || node.args['alt'];
    const title = node.args[2] || node.args['title'];
    return `![${alt || ''}${title ? ` "${title}"` : ''}](${href})`;
  }
}

const instance = new ImageRoleRenderer();

renderer.registerRenderer('image', instance);
renderer.registerRenderer('img', instance);

export default {};
