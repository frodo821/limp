import { Renderer } from '..';
import { LimpNodeOf } from '../../parsing/parsing';
import renderer from '../renderer';

class TextDecorationsRenderer implements Renderer {
  render(node: LimpNodeOf<'role' | 'block_role'>): string {
    switch (node.name) {
      case 'underlined':
      case 'u':
        return `<u>${node.children
          .map((it) => renderer.render(it))
          .join('')}</u>`;
      case 'strike':
      case 's':
        return `<s>${node.children
          .map((it) => renderer.render(it))
          .join('')}</s>`;
      case 'italic':
      case 'i':
        return `<i>${node.children
          .map((it) => renderer.render(it))
          .join('')}</i>`;
      case 'bold':
      case 'b':
        return `<b>${node.children
          .map((it) => renderer.render(it))
          .join('')}</b>`;
      default:
        throw new Error(`cannnot handle the node with role '${node.name}'`);
    }
  }
}

const instance = new TextDecorationsRenderer();

renderer.registerRenderer('bold', instance);
renderer.registerRenderer('underlined', instance);
renderer.registerRenderer('italic', instance);
renderer.registerRenderer('strike', instance);
renderer.registerRenderer('b', instance);
renderer.registerRenderer('u', instance);
renderer.registerRenderer('i', instance);
renderer.registerRenderer('s', instance);

export default {};
