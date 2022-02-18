import htmlRenderer from './render/html';
import { parseDocument } from './parsing/parsing';

export * from './parsing/parsing';
export * from './parsing/strparsing';

export function compileToHTML(src: string): string {
  return htmlRenderer.render(parseDocument(src));
}
