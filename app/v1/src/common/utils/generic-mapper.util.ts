import { SnakeToCamel } from './SnakeToCamel.util';

export class GenericMapper<TDomain, TInsertable, TUpdateable> {
  public static toDomain(
    data: Record<string, any> | Record<string, any>[]
  ): any {
    if (Array.isArray(data)) {
      return data.map((row) => this.mapToType(row, this.toCamelCase));
    } else {
      return this.mapToType(data, this.toCamelCase);
    }
  }

  public static toInsertable(domain: any): any {
    if (Array.isArray(domain))
      return domain.map((item) => this.mapToType(item, this.toSnakeCase));
    else
      return this.mapToType<Record<string, any>>(
        domain,
        this.toSnakeCase,
        false
      );
  }

  public static toUpdatable(domain: any) {
    const transform = (item) => {
      const updatable = {};

      for (const [key, value] of Object.entries(item)) {
        if (value !== undefined) {
          updatable[this.toSnakeCase(key)] = value;
        }
      }

      return updatable;
    };
    if (Array.isArray(domain)) return domain.map(transform);
    return transform(domain);
  }

  private static mapToType<T>(
    source: any,
    mapper: (key: string) => string,
    recursive = true
  ): T {
    if (!source || typeof source !== 'object') {
      return source as T; // Return primitive values as-is
    }
  
    if (source instanceof Date) {
      return source as unknown as T; // Handle Date objects correctly
    }
  
    if (Array.isArray(source)) {
      return source.map((item) =>
        recursive && typeof item === 'object'
          ? this.mapToType(item, mapper, recursive)
          : item
      ) as unknown as T;
    }
  
    return Object.entries(source).reduce((target, [key, value]) => {
      if (typeof value === 'string' && this.isIsoDate(value)) {
        // Convert ISO date strings to Date objects
        (target as any)[mapper(key)] = new Date(value);
      } else if (recursive && typeof value === 'object' && value !== null) {
        // Recursively process objects
        (target as any)[mapper(key)] = this.mapToType(value, mapper, recursive);
      } else {
        // Assign other values as-is
        (target as any)[mapper(key)] = value;
      }
      return target;
    }, {} as T);
  }
  

  private static isIsoDate(value: string): boolean {
    // Match ISO 8601 date strings
    return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value);
  }

  private static toCamelCase(key: string): string {
    return SnakeToCamel(key);
  }

  private static toSnakeCase(key: string): string {
    return key.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`);
  }
}
