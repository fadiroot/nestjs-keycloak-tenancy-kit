import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { I18nService } from 'nestjs-i18n';

const generateMessageKey = (resource: string, field?: string): string => {
  if (field) {
    return `${resource}.validation.${field}`; 
  }
  return `${resource}.notFound`; 
};

export class NotFoundException extends BaseException {
  public constructor(i18n: I18nService, resource: string, id: string | number) {
    const messageKey = 'errors.notFound'; 
    const translatedMessage = i18n.t(messageKey, {
      args: { resource, id }, 
    });

    super(
      translatedMessage,
      HttpStatus.NOT_FOUND,
      'NOT_FOUND',
      { resource, id },
      messageKey,
      { resource, id }
    );
  }
}

export class DatabaseException extends BaseException {
  public constructor(
    i18n: I18nService,
    operation: string,
    resource: string,
    error: Error
  ) {
    const messageKey = 'errors.database'; // Keep this static if it doesn't need to be dynamic
    const translatedMessage = i18n.t(messageKey, {
      args: { operation, resource },
    });

    super(
      translatedMessage,
      HttpStatus.INTERNAL_SERVER_ERROR,
      'DATABASE_ERROR',
      { operation, resource, error: error.message },
      messageKey,
      { operation, resource }
    );
  }
}

export class ValidationException extends BaseException {
  constructor(i18n: I18nService, resource: string, field: string) {
    const messageKey = generateMessageKey(resource, field); // Generate dynamic key for validation
    const translatedMessage: any = i18n.t(messageKey, {
      args: { field }, // Optionally pass any additional args if needed
    });

    super(
      translatedMessage,
      HttpStatus.BAD_REQUEST,
      'VALIDATION_ERROR',
      { field },
      messageKey,
      { field }
    );
  }
}
export class ForbiddenException extends BaseException {
  public constructor(
    i18n: I18nService,
    resource: string,
    action: string,
    params?: Record<string, any>
  ) {
    const messageKey = 'errors.forbidden';
    const translatedMessage: string = i18n.t(messageKey, {
      args: { resource, action, ...params },
    });

    super(
      translatedMessage,
      HttpStatus.FORBIDDEN,
      'FORBIDDEN',
      { resource, action, ...params },
      messageKey,
      { resource, action, ...params }
    );
  }
}

export class BadRequestException extends BaseException {
  public constructor(
    i18n: I18nService,
    resource: string,
    field: string,
    params?: Record<string, any>
  ) {
    const messageKey = generateMessageKey(resource, field);
    const translatedMessage: string = i18n.t(messageKey, {
      args: { ...params },
    });

    super(
      translatedMessage,
      HttpStatus.BAD_REQUEST,
      'BAD_REQUEST',
      { resource, field },
      messageKey,
      { resource, field }
    );
  }
}
