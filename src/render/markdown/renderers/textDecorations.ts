import { Renderer } from '../..';
import { LimpNodeOf } from '../../../parsing/parsing';
import renderer from '../markdownRenderer';

class TextDecorationsRenderer implements Renderer {
  render(node: LimpNodeOf<'role' | 'block_role'>): string {
    switch (node.name) {
      case 'underlined':
      case 'u':
        return `_${node.children.map((it) => renderer.render(it)).join('')}_`;
      case 'strike':
      case 's':
        return `~~${node.children.map((it) => renderer.render(it)).join('')}~~`;
      case 'italic':
      case 'i':
        return `*${node.children.map((it) => renderer.render(it)).join('')}*`;
      case 'bold':
      case 'b':
        return `**${node.children.map((it) => renderer.render(it)).join('')}**`;
      case 'br':
        return `  \n`;
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
