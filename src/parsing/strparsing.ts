export function getIndentationLevel(str: string): number {
  return str.match(/^ */)![0].length;
}

export function dedent(str: string): string {
  const prefix = Math.min(
    ...str
      .split('\n')
      .filter((it) => it.trim())
      .map(getIndentationLevel)
  );
  return str
    .split('\n')
    .map((it) => it.slice(prefix))
    .join('\n');
}

export function splitNextDedent(str: string): [string, string] {
  if (!str) {
    return ['', ''];
  }

  const lines = str.split('\n');
  const ret: [string[], string[]] = [[], []];
  const start_indent_level = getIndentationLevel(
    lines.find((it) => it.trim()) || ''
  );

  if (start_indent_level === 0) {
    return [str, ''];
  }

  let line: string;

  while (typeof (line = lines.shift()!) === 'string') {
    if (!line.trim() || getIndentationLevel(line) >= start_indent_level) {
      ret[0].push(line);
      continue;
    }

    ret[1].push(...lines);
    break;
  }

  return [ret[0].join('\n'), ret[1].join('\n')];
}

export function canonicalizeLineBreaks(str: string): string {
  return str.replace(/\r\n?/g, '\n');
}
