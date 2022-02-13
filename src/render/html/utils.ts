export function escape(str: string): string {
  return str.replace(/[&><"]/g, function (s: string) {
    return (
      {
        '&': '&amp;',
        '>': '&gt;',
        '<': '&lt;',
        '"': '&quot;',
      }[s] || s
    );
  });
}
