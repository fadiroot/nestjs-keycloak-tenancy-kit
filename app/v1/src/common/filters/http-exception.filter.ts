import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  ValidationError,
} from '@nestjs/common';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { BaseException } from '../exceptions/base.exception';
import { ValidationException } from '../exceptions/validation.exceptions';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly i18n: I18nService) {}

  async catch(error: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'INTERNAL_ERROR';
    let message = 'An unexpected error occurred.';
    let metadata: Record<string, any> = {};

    if (error instanceof ValidationException) {
      status = HttpStatus.BAD_REQUEST;
      errorCode = 'VALIDATION_ERROR';
      const errors = error.getErrors();
      message = 'Validation failed.';
      metadata = { validationErrors: this.formatValidationErrors(errors) };
    } else if (error instanceof BaseException) {
      status = error.statusCode;
      errorCode = error.errorCode;
      metadata = error.metadata || {};
      message = await this.getTranslatedMessage(error);
    } else if (error instanceof HttpException) {
      status = error.getStatus();
      const responseError = error.getResponse();
      message = typeof responseError === 'string' ? responseError : (responseError as any).message;
      errorCode = `HTTP_${status}`;
    }

    this.logger.error(`${errorCode}: ${message}`, error.stack);

    response.status(status).json({
      statusCode: status,
      errorCode,
      message,
      timestamp: new Date().toISOString(),
      metadata,
    });
  }

  private async getTranslatedMessage(error: BaseException): Promise<string> {
    if (error.i18nKey) {
      try {
        return await this.i18n.t(error.i18nKey, { args: error.i18nArgs || {} });
      } catch {
        return error.message;
      }
    }
    return error.message;
  }

  private formatValidationErrors(errors: ValidationError[]): Record<string, string[]> {
    const formattedErrors: Record<string, string[]> = {};
    errors.forEach(error => {
      const messages = error.constraints ? Object.values(error.constraints) : [];
      formattedErrors[error.property] = messages;
      if (error.children?.length) {
        Object.assign(formattedErrors, this.formatValidationErrors(error.children));
      }
    });
    return formattedErrors;
  }
}
