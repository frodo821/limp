import renderer from './render';
import { parseDocument } from './parsing/parsing';

export * from './parsing/parsing';
export * from './parsing/strparsing';

export function compile(src: string): string {
  return renderer.render(parseDocument(src));
}
