export class GenericMapper<TDomain, TInsertable, TUpdateable> {
  /**
   * Maps database row to domain model
   */
  toDomain(row: any): TDomain {
    return this.mapToType<TDomain>(row, this.toCamelCase);
  }

  /**
   * Maps domain model to database insertable
   */
  toInsertable(domain: Partial<TInsertable>): Record<string, any> {
    return this.mapToType<Record<string, any>>(domain, this.toSnakeCase);
  }

  /**
   * Maps domain model to database updateable
   */
  toUpdateable(domain: Partial<TUpdateable>): Record<string, any> {
    const updateable: Record<string, any> = {};

    for (const [key, value] of Object.entries(domain)) {
      if (value !== undefined) {
        updateable[this.toSnakeCase(key)] = value;
      }
    }

    return updateable;
  }

  /**
   * Helper method to map an object to a target type
   */
  private mapToType<T>(source: any, mapper: (key: string) => string): T {
    return Object.entries(source).reduce((target, [key, value]) => {
      (target as any)[mapper(key)] = value;
      return target;
    }, {} as T);
  }

  /**
   * Convert a string from snake_case to camelCase
   */
  private toCamelCase(key: string): string {
    return key.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
  }

  /**
   * Convert a string from camelCase to snake_case
   */
  private toSnakeCase(key: string): string {
    return key.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`);
  }
}
