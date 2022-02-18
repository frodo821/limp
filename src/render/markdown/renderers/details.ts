import { Renderer } from '../..';
import { LimpNodeOf } from '../../../parsing/parsing';
import renderer from '../markdownRenderer';

class DetailsRenderer implements Renderer {
  render(node: LimpNodeOf<'role' | 'block_role'>): string {
    switch (node.name) {
      case 'details':
      case 'folding':
      case 'spoiler':
        return `<details>${node.children
          .map((it) => renderer.render(it))
          .join('')}</details>`;
      case 'summary':
        return `<summary>${node.children
          .map((it) => renderer.render(it))
          .join('')}</summary>`;
      default:
        throw new Error(`!!!THIS STATE IS UNEXPECTED AND MUST BE A BUG. PLEASE REPORT THIS TO MAINTAINER.!!!
details in DetailsRenderer.render:
  name: ${node.name}
  node: ${JSON.stringify(node, null, 2)}`);
    }
  }
}

const instance = new DetailsRenderer();

renderer.registerRenderer('details', instance);
renderer.registerRenderer('folding', instance);
renderer.registerRenderer('spoiler', instance);
renderer.registerRenderer('summary', instance);

export default {};
