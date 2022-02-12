import { canonicalizeLineBreaks, dedent, splitNextDedent } from './strparsing';

export interface BaseNode<T extends string, K> {
  type: T;
  line: number;
  column: number;
  pos: number;
  children: K[];
}

export type LimpNode =
  | (BaseNode<'text', never> & { self: string })
  | (BaseNode<'role', LimpNode> & {
      name: string;
      args: { [key: string]: string };
      unparsed: boolean;
    })
  | (BaseNode<'title', LimpNode> & { level: number })
  | (BaseNode<'block_role', LimpNode> & {
      name: string;
      args: { [key: string]: string };
      unparsed: boolean;
    })
  | BaseNode<'root', LimpNode>;

type Keys = LimpNode['type'];

export type LimpNodeOf<T extends Keys> = Extract<LimpNode, { type: T }>;

type TokenStart = {
  type: Keys;
  pos: number;
  span: number;
  column?: number;
  line?: number;
  matched: string;
  extra?: any;
};

const Inclusions: { [key in Keys]: Keys[] } = {
  root: ['text', 'role', 'block_role', 'title'],
  text: [],
  block_role: ['text', 'role', 'block_role'],
  role: ['text', 'role'],
  title: ['text', 'role'],
};

const titleLevels = {
  '=': 1,
  '-': 2,
  '*': 3,
  '#': 4,
};

export function parseDocument(src: string): LimpNode {
  const ret: LimpNode = {
    type: 'root',
    line: 0,
    column: 0,
    pos: 0,
    children: [],
  };

  parse(canonicalizeLineBreaks(src), ret);

  return ret;
}

function parse(src: string, parent: LimpNode): number {
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
        ..._internal_parseInline(
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
      ..._internal_parseInline(
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
    extra: match[1],
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
  const matchTitle = src.match(/^ *([-=*#]){4,}\s*$/m);

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
  const [name, ...rawArgs] = nameArgs
    .replace(/\\(:|;)/g, '$1')
    .split(/\s*(\(|\))\s*/);
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

function parseBlock(src: TokenStart, parent: LimpNode): LimpNode {
  const nameline = src.matched.trim().split('\n', 1)[0];
  const nameAt = src.matched.search(
    nameline.replace(/([\[\]()^*+.?\\])/g, '\\$1')
  );

  const self: LimpNode = {
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

function parseTitle(src: TokenStart, parent: LimpNode): LimpNode {
  const self: LimpNode = {
    type: 'title',
    line: src.line!,
    column: src.column!,
    pos: parent.pos + src.pos,
    children: [],
    level: (titleLevels as any)[(src.extra as string) || '='],
  };

  const content = src.matched.split('\n', 1)[0].trim();

  self.children.push(
    ..._internal_parseInline(
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

export function parseInline(src: string): LimpNode {
  const self: LimpNode = {
    type: 'root',
    line: 0,
    column: 0,
    pos: 0,
    children: [],
  };

  const nodes = _internal_parseInline(
    {
      type: 'text',
      pos: 0,
      span: src.length,
      matched: src,
      line: 0,
      column: 0,
    },
    self
  );

  self.children.push(...nodes);

  return self;
}

function _internal_parseInline(src: TokenStart, parent: LimpNode): LimpNode[] {
  if (!src.matched.trim()) {
    return [];
  }

  return src.matched
    .split('\n\n')
    .flatMap((src) => parseInlineFragments(src.split(/(?<!\\)(:|;)/), parent));
}

function parseInlineFragments(
  fragments: string[],
  parent: LimpNode
): LimpNode[] {
  const ret: LimpNode[] = [];
  const frags = [...fragments];

  while (frags.length > 0) {
    const node = consumeFragment(frags, parent);
    if (node === null) {
      continue;
    }
    ret.push(node);
  }

  return ret;
}

function consumeFragment(frags: string[], parent: LimpNode): LimpNode | null {
  let frag = frags.shift();

  if (!frag) {
    return null;
  }

  if (frag !== ':') {
    return createTextFragment(frag, parent);
  }

  const nameArgs = frags.shift();

  if (!nameArgs || (frag = frags.shift()) !== ':') {
    return createTextFragment(`:${nameArgs || ''}${frag || ''}`, parent);
  }

  let inNameArgs = false;
  let nested = 0;
  let body: string[] = [];

  for (;;) {
    frag = frags.shift();

    // end of stream encountered before the end of inline role
    if (typeof frag === 'undefined') {
      // restore modifications of the fragments
      frags.unshift(...body);
      return createTextFragment(`:${nameArgs}:`, parent);
    }

    if (frag === ':') {
      if (inNameArgs) {
        inNameArgs = false;
        nested++;
      } else {
        inNameArgs = true;
      }
    } else if (frag === ';' && !inNameArgs) {
      nested--;
    }
    body.push(frag);

    if (nested === -1) {
      body.pop();
      break;
    }
  }

  let self: LimpNode = {
    type: 'role',
    line: parent.line,
    column: parent.column,
    pos: parent.pos,
    children: [],
    ...parseRoleNameArgs(nameArgs),
  };

  if (self.unparsed) {
    let text = createTextFragment(body.join(''), self);
    if (text !== null) {
      self.children.push(text);
    }
  } else {
    self.children.push(...parseInlineFragments(body, self));
  }

  return self;
}

function createTextFragment(text: string, parent: LimpNode): LimpNode | null {
  if (!text) {
    return null;
  }

  return {
    type: 'text',
    line: parent.line,
    column: parent.column,
    pos: parent.pos,
    children: [],
    self: text.replace(/\\(:|;)/g, '$1'),
  };
}
