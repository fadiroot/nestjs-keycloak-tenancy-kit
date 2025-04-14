export function camelToSnake(str: string): string {
  return str.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`);
}
