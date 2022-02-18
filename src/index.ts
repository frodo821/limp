import htmlRenderer from './render/html';
import markdownRenderer from './render/markdown';
import { parseDocument } from './parsing/parsing';

export * from './parsing/parsing';
export * from './parsing/strparsing';

export function compileToHTML(src: string): string {
  return htmlRenderer.render(parseDocument(src));
}

export function compileToMarkdown(src: string): string {
  return markdownRenderer.render(parseDocument(src));
}
