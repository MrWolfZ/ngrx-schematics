export function sortLexicographically(...strings: string[]) {
  return [...strings].sort(
    (l, r) => l.toLowerCase() < r.toLowerCase() ? -1 : l.toLowerCase() > r.toLowerCase() ? 1 : 0
  );
}

export function sortLexicographicallyBy<T>(projection: (item: T) => string, ...items: T[]) {
  return [...items].sort(
    (l, r) => projection(l).toLowerCase() < projection(r).toLowerCase() ? -1 : projection(l).toLowerCase() > projection(r).toLowerCase() ? 1 : 0
  );
}
