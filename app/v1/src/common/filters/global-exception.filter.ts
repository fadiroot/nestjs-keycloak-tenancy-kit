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
      let message: string | string[] = error.message;
      let errorCode = 'INTERNAL_ERROR';
      let metadata: Record<string, any> = {};
  
      if (error instanceof ValidationException) {
        status = HttpStatus.BAD_REQUEST;
        errorCode = 'VALIDATION_ERROR';
        const errors = error.getErrors();
        message = this.formatValidationErrors(errors);
        metadata = { validationErrors: errors };
      } else if (error instanceof BaseException) {
        status = error.statusCode;
        errorCode = error.errorCode;
        metadata = error.metadata || {};
        
        if (error.i18nKey) {
          try {
            message = await this.i18n.t(error.i18nKey, {
              args: error.i18nArgs || {},
            });
          } catch (e) {
            message = error.message;
          }
        }
      } else if (error instanceof HttpException) {
        status = error.getStatus();
        const response = error.getResponse();
        message = typeof response === 'string' ? response : (response as any).message;
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
  
    private formatValidationErrors(errors: ValidationError[]): string[] {
      const formatError = (error: ValidationError): string[] => {
        const messages: string[] = [];
  
        if (error.constraints) {
          messages.push(...Object.values(error.constraints));
        }
  
        if (error.children?.length) {
          error.children.forEach((childError) => {
            messages.push(...formatError(childError));
          });
        }
  
        return messages;
      };
  
      return errors.flatMap(formatError);
    }
  }
  