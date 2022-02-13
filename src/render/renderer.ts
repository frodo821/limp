import { LimpNode, LimpNodeOf } from '..';
import { BaseNode } from '../parsing/parsing';

export interface Renderer {
  render(node: LimpNodeOf<'role' | 'block_role'>): string;
}

export class LimpRenderer {
  private static instance: LimpRenderer;
  private renderers: { [key: string]: Renderer } = {};

  constructor() {
    LimpRenderer.instance = this;
  }

  static get current(): LimpRenderer {
    return this.instance;
  }

  registerRenderer(name: string, renderer: Renderer) {
    this.renderers[name] = renderer;
  }

  render(node: LimpNode): string {
    switch (node.type) {
      case 'text':
        return this.text(node);
      case 'role':
        return this.role(node);
      case 'title':
        return this.title(node);
      case 'block_role':
        return this.block_role(node);
      case 'root':
        return this.root(node);
      case 'paragraph':
        return this.paragraph(node);
      default:
        throw new Error(`Unknown node type: ${(node as unknown as any).type}`);
    }
  }

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

const renderer = new LimpRenderer();

export default renderer;
