import { LimpNode, LimpNodeOf } from '..';

export interface Renderer {
  render(node: LimpNodeOf<'role' | 'block_role'>): string;
}

export default abstract class LimpRenderer {
  private static instance: LimpRenderer;
  protected renderers: { [key: string]: Renderer } = {};

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

  abstract paragraph(node: LimpNodeOf<'paragraph'>): string;

  abstract text(node: LimpNodeOf<'text'>): string;

  abstract role(node: LimpNodeOf<'role'>): string;

  abstract title(node: LimpNodeOf<'title'>): string;

  abstract block_role(node: LimpNodeOf<'block_role'>): string;

  abstract root(node: LimpNodeOf<'root'>): string;
}
