import { Renderer } from '../..';
import { LimpNodeOf } from '../../../parsing/parsing';
import renderer from '../htmlRenderer';

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
      case 'br':
        return `<br>`;
      default:
        return `<span class="limp-inline limp-${node.name}">${renderer.render(
          node
        )}</span>`;
    }
  }
}

const instance = new TextDecorationsRenderer();

renderer.registerRenderer('bold', instance);
renderer.registerRenderer('underlined', instance);
renderer.registerRenderer('italic', instance);
renderer.registerRenderer('strike', instance);
renderer.registerRenderer('br', instance);
renderer.registerRenderer('b', instance);
renderer.registerRenderer('u', instance);
renderer.registerRenderer('i', instance);
renderer.registerRenderer('s', instance);

export default {};
