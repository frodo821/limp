export function escape(str: string): string {
  return str.replace(/[`]/g, function (s) {
    return (
      {
        '`': '\\`',
      }[s] || s
    );
  });
}
