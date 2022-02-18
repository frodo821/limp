import LimpRenderer from '..';
import { LimpNodeOf } from '../..';

export class HTMLRenderer extends LimpRenderer {
  paragraph(node: LimpNodeOf<'paragraph'>): string {
    return `<p>${node.children.map((it) => this.render(it)).join('')}</p>`;
  }

  text(node: LimpNodeOf<'text'>): string {
    return node.self;
  }

  role(node: LimpNodeOf<'role'>): string {
    const renderer = this.renderers[node.name];
    if (renderer) {
      return renderer.render(node);
    } else {
      return `<div style="display: inline" class="limp-unknown ${
        node.name
      }">${node.children.map((it) => this.render(it)).join('')}</div>`;
    }
  }

  title(node: LimpNodeOf<'title'>): string {
    return `<h${node.level}>${node.children
      .map((it) => this.render(it))
      .join('')}</h${node.level}>`;
  }

  block_role(node: LimpNodeOf<'block_role'>): string {
    const renderer = this.renderers[node.name];
    if (renderer) {
      return renderer.render(node);
    } else {
      return `<div class="limp-unknown ${node.name}">${node.children
        .map((it) => this.render(it))
        .join('')}</div>`;
    }
  }

  root(node: LimpNodeOf<'root'>): string {
    return `<div class="limp-root">${node.children
      .map((it) => this.render(it))
      .join('')}</div>`;
  }
}

const renderer = new HTMLRenderer();

export default renderer;
