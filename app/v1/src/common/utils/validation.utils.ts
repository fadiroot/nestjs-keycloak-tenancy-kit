import { I18nService } from 'nestjs-i18n';
import { NotFoundException } from '../exceptions/application.exceptions';

export function getValidationMessageKey(entity: string, path: string): string {
  return `${entity}.validation.${path}`;
}
// Helper to validate IDs
export const validateEntityIds = async (
  i18n: I18nService,
  query: any,
  ids: any,
  label: string
): Promise<void> => {
  const found = query;
  if (found.length !== ids.length) {
    const invalidIds = ids.filter(
      (id) =>
        !found.some((item) => {
          return item.id === id;
        })
    );
    throw new NotFoundException(i18n, label, invalidIds.join(', '));
  }
};
