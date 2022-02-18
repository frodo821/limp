import LimpRenderer from '..';
import { LimpNodeOf } from '../..';

export class MarkdownRenderer extends LimpRenderer {
  paragraph(node: LimpNodeOf<'paragraph'>): string {
    return `${node.children.map((it) => this.render(it)).join('')}\n\n`;
  }

  text(node: LimpNodeOf<'text'>): string {
    return node.self;
  }

  role(node: LimpNodeOf<'role'>): string {
    const renderer = this.renderers[node.name];
    if (renderer) {
      return renderer.render(node);
    } else {
      return node.children.map((it) => this.render(it)).join('');
    }
  }

  title(node: LimpNodeOf<'title'>): string {
    return `${'#'.repeat(node.level)} ${node.children
      .map((it) => this.render(it))
      .join('')}\n`;
  }

  block_role(node: LimpNodeOf<'block_role'>): string {
    const renderer = this.renderers[node.name];
    if (renderer) {
      const result = renderer.render(node);
      return result ? `${result}\n` : '';
    } else {
      return `<div class="limp-unknown limp-${node.name}">${node.children
        .map((it) => this.render(it))
        .join('')}</div>`;
    }
  }

  root(node: LimpNodeOf<'root'>): string {
    return `${node.children.map((it) => this.render(it)).join('')}`;
  }
}

const renderer = new MarkdownRenderer();

export default renderer;
