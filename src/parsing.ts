import { canonicalizeLineBreaks, dedent } from '.';
import { splitNextDedent } from './strparsing';

export interface BaseNode<T extends string, K> {
  type: T;
  line: number;
  column: number;
  pos: number;
  children: K[];
}

export type Node =
  | (BaseNode<'text', never> & { self: string })
  | (BaseNode<'role', Node> & { name: string; args: { [key: string]: string } })
  | BaseNode<'title', Node>
  | (BaseNode<'block_role', Node> & {
      name: string;
      args: { [key: string]: string };
      unparsed: boolean;
    })
  | BaseNode<'root', Node>;

type Keys = Node['type'];

type TokenStart = {
  type: Keys;
  pos: number;
  span: number;
  column?: number;
  line?: number;
  matched: string;
};

const Inclusions: { [key in Keys]: Keys[] } = {
  root: ['text', 'role', 'block_role', 'title'],
  text: [],
  block_role: ['text', 'role', 'block_role'],
  role: ['text', 'role'],
  title: ['text', 'role'],
};

export function parseDocument(src: string): Node {
  const ret: Node = {
    type: 'root',
    line: 0,
    column: 0,
    pos: 0,
    children: [],
  };

  parse(canonicalizeLineBreaks(src), ret);

  return ret;
}

function parse(src: string, parent: Node): number {
  if (parent.type === 'text') {
    throw new Error(
      `SemanticError: text nodes cannot have children at line ${
        parent.line + 1
      }, column ${parent.column + 1}`
    );
  }

  let index = 0;

  while (src) {
    const token = findNextToken(src);

    if (!token) {
      parent.children.push(
        ...parseInline(
          {
            type: 'text',
            pos: index,
            span: src.length,
            matched: src,
            column: parent.column,
            line: parent.line,
          },
          parent
        )
      );
      break;
    }

    const pre = src.slice(0, token.pos);

    parent.children.push(
      ...parseInline(
        {
          type: 'text',
          pos: index,
          span: pre.length,
          matched: pre,
          column: parent.column,
          line: parent.line,
        },
        parent
      )
    );

    index += pre.length;

    const lines = pre.split('\n');
    token.line = lines.length + parent.line + 1;
    token.column =
      token.pos -
      lines
        .slice(0, lines.length - 1)
        .map((l) => l.length)
        .reduce((a, b) => a + b + 1, 0);

    if (!Inclusions[parent.type].includes(token.type)) {
      throw new Error(
        `SyntaxError: unexpected token '${token.type}' in '${parent.type}' at line ${token.line}, column ${token.column}`
      );
    }

    switch (token.type) {
      case 'title':
        parent.children.push(parseTitle(token, parent));
        break;
      case 'block_role':
        parent.children.push(parseBlock(token, parent));
        break;
      default:
        throw new Error(
          `Unexpected token type '${token.type}' at line ${token.line}, column ${token.column}`
        );
    }

    index += token.span;

    src = src.slice(token.span + token.pos);
  }

  return index;
}

function createTitleToken(
  src: string,
  match: RegExpMatchArray
): TokenStart | null {
  let prevs = src.slice(0, match.index).split('\n');
  let titleLine = prevs[prevs.length - 2];

  if (!titleLine || !titleLine.trim()) {
    return null;
  }

  return {
    type: 'title',
    // here -1 is because of the linefeed character
    pos: match.index! - titleLine.length - 1,
    // here +1 is because of the linefeed character
    span: match[0].length + titleLine.length + 1,
    matched: `${titleLine}\n${match[0]}`,
  };
}

function createBlockToken(
  src: string,
  match: RegExpMatchArray
): TokenStart | null {
  let posts = splitNextDedent(src.slice(match.index! + match[0]!.length));

  return {
    type: 'block_role',
    pos: match.index!,
    span: match[0]!.length + posts[0].length,
    matched: `${match[0]}${posts[0]}`,
  };
}

function findNextToken(src: string): TokenStart | null {
  const matchBlock = src.match(/^ *::.*?~\s*$/m);
  const matchTitle = src.match(/^ *([-=]){4,}\s*$/m);

  if (!matchBlock || typeof matchBlock.index !== 'number') {
    if (matchTitle && typeof matchTitle.index !== 'number') {
      return createTitleToken(src, matchTitle);
    }

    return null;
  }

  if (matchTitle && typeof matchTitle.index === 'number') {
    return matchBlock.index > matchTitle.index
      ? createTitleToken(src, matchTitle)
      : createBlockToken(src, matchBlock);
  }

  return createBlockToken(src, matchBlock);
}

export function parseRoleNameArgs(nameArgs: string): {
  name: string;
  args: { [key: string]: string };
  unparsed: boolean;
} {
  const [name, ...rawArgs] = nameArgs.split(/\s*(\(|\))\s*/);
  const unparsed = name.startsWith('*');

  if (rawArgs.length === 0) {
    return {
      name: unparsed ? name.slice(1) : name,
      args: {},
      unparsed,
    };
  }

  if (
    rawArgs.length !== 4 ||
    rawArgs[0] !== '(' ||
    rawArgs[rawArgs.length - 1] !== '' ||
    rawArgs[rawArgs.length - 2] !== ')'
  ) {
    console.warn(
      `!!!warning: expected role args, other than name are ignored!!!`
    );
    return {
      name: unparsed ? name.slice(1) : name,
      args: {},
      unparsed,
    };
  }

  let kwarg = false;
  let errored = false;

  const args = Object.fromEntries(
    rawArgs[1]
      .split(/\s*,\s*/)
      .map((it, idx) => {
        if (errored) {
          return false;
        }

        const sp = it.split(/([^=]+)=(.+)/);

        if (sp.length === 1) {
          if (kwarg) {
            console.warn(
              `!!!warning: unexpected positional argument was found after the first keyword argument found, args after this are igored!!!`
            );
            errored = true;
            return false;
          }

          return [idx.toString(), sp[0]];
        }

        kwarg = true;
        return [sp[1], sp[2]];
      })
      .filter((it) => it) as string[][]
  );

  return {
    name: unparsed ? name.slice(1) : name,
    args,
    unparsed,
  };
}

function parseBlock(src: TokenStart, parent: Node): Node {
  const nameline = src.matched.trim().split('\n', 1)[0];
  const nameAt = src.matched.search(
    nameline.replace(/([\[\]()^*+.?\\])/g, '\\$1')
  );

  const self: Node = {
    type: 'block_role',
    line: src.line!,
    column: src.column!,
    pos: parent.pos + src.pos,
    children: [],
    ...parseRoleNameArgs(nameline.slice(2, nameline.length - 1)),
  };

  parse(dedent(src.matched.slice(nameAt + nameline.length + 2)), self);

  return self;
}

function parseTitle(src: TokenStart, parent: Node): Node {
  const self: Node = {
    type: 'title',
    line: src.line!,
    column: src.column!,
    pos: parent.pos + src.pos,
    children: [],
  };

  const content = src.matched.split('\n', 1)[0].trim();

  self.children.push(
    ...parseInline(
      {
        type: 'text',
        pos: self.pos,
        span: content.length,
        matched: content,
        line: self.line,
        column: self.column,
      },
      self
    )
  );

  return self;
}

function parseInline(src: TokenStart, parent: Node): Node[] {
  let matched = src.matched;
  let index = 0;
  let line = src.line!;
  let column = 0;
  const ret: Node[] = [];

  while (matched) {
    const nextBlock = matched.search('\n\n');

    if (nextBlock !== -1) {
      const text = matched.slice(0, nextBlock);
      line += text.split('\n').length - 1;

      ret.push(
        ...parseInline(
          {
            type: 'text',
            matched: text,
            pos: parent.pos + src.pos + index,
            span: text.length,
            line,
            column,
          },
          parent
        )
      );

      matched = matched.slice(nextBlock + 2);
      index += nextBlock + 2;
      column = 0;
      continue;
    }

    const start = matched.search(/(?<!\\):/);

    ret.push({
      type: 'text',
      line,
      column,
      pos: parent.pos + src.pos + index,
      self: start === -1 ? matched : matched.slice(0, start),
      children: [],
    });

    if (start === -1) {
      break;
    }
    index += start;

    matched = matched.slice(start + 1);

    const bodyStart = matched.search(/(?<!\\):/) + 1;

    if (bodyStart === 0) {
      const {
        line: line_,
        column: column_,
        pos,
        self,
      } = ret.pop()! as Extract<Node, { type: 'text' }>;

      ret.push({
        type: 'text',
        line: line_,
        column: column_,
        pos,
        self: `${self}:${matched}`,
        children: [],
      });
      break;
    }

    const nameArgs = matched.slice(0, bodyStart - 1);

    matched = matched.slice(bodyStart);
    const bodyEnd = matched.search(/(?<!\\):/);
    const body = matched.slice(0, bodyEnd === -1 ? undefined : bodyEnd);

    const self: Node = {
      type: 'role',
      children: [],
      column,
      line,
      pos: parent.pos + src.pos + index,
      ...parseRoleNameArgs(nameArgs),
    };

    self.children.push(
      ...parseInline(
        {
          type: 'text',
          matched: body,
          pos: parent.pos + src.pos + index + nameArgs.length + 1,
          span: body.length,
          column,
          line,
        },
        self
      )
    );

    ret.push(self);

    if (bodyEnd === -1) {
      break;
    }
  }

  return ret;
}
