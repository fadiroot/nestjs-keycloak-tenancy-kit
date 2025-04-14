export function SnakeToCamel(str: string): string {
    return str.replace(/([-_][a-z])/g, (group) => group.toUpperCase().replace('-', '').replace('_', ''));
  }