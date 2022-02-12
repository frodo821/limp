import { Renderer } from '..';
import { LimpNodeOf } from '../../parsing/parsing';
import renderer from '../renderer';

class ImageRoleRenderer implements Renderer {
  render(node: LimpNodeOf<'role' | 'block_role'>): string {
    const href = node.args[0] || node.args['url'];
    const alt = node.args[1] || node.args['alt'];
    const title = node.args[2] || node.args['title'];

    return `<img src="${href}" alt="${alt}" title="${title}" />`;
  }
}

const instance = new ImageRoleRenderer();

renderer.registerRenderer('image', instance);
renderer.registerRenderer('img', instance);

export default {};
