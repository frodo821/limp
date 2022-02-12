export function reverse<T>(arr: T[]): T[] {
  return arr
    .map((it, idx) => ({ it, idx }))
    .sort(({ idx: a }, { idx: b }) => b - a)
    .map(({ it }) => it);
}
