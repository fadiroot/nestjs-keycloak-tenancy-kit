import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
  } from '@nestjs/common';
  import { Observable, throwError } from 'rxjs';
  import { catchError } from 'rxjs/operators';
  import { I18nService } from 'nestjs-i18n';
  import { BaseException } from '../exceptions/base.exception';
  import { DatabaseException } from '../exceptions/application.exceptions';
  import { HttpStatus } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  
  export const ERROR_HANDLER_METADATA = 'error_handler_metadata';
  
  export interface ErrorHandlerOptions {
    resource: string;
    operation: string;
    i18nKey?: string;
  }
  
  @Injectable()
  export class ErrorHandlingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(ErrorHandlingInterceptor.name);
  
    constructor(
      private readonly i18n: I18nService,
      private readonly reflector: Reflector
    ) {}
  
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const handler = context.getHandler();
      const options = this.reflector.get<ErrorHandlerOptions>(
        ERROR_HANDLER_METADATA,
        handler
      );
  
      if (!options) {
        return next.handle();
      }
  
      return next.handle().pipe(
        catchError(async (error) => {
          this.logger.error(
            `Error in ${options.resource} during ${options.operation}`,
            error.stack
          );
  
          if (error instanceof BaseException) {
            if (error.i18nKey && this.i18n) {
              const translatedMessage: any = await this.i18n.t(error.i18nKey, {
                args: error.i18nArgs || {},
              });
  
              return throwError(
                () =>
                  new BaseException(
                    translatedMessage,
                    error.statusCode,
                    error.errorCode,
                    error.metadata,
                    error.i18nKey,
                    error.i18nArgs
                  )
              );
            }
            return throwError(() => error);
          }
  
          if (error.code && error.code.startsWith('ER')) {
            const dbError = new DatabaseException(
              this.i18n,
              options.operation,
              options.resource,
              error
            );
            this.logger.error(dbError.message);
            return throwError(() => dbError);
          }
  
          const baseError = new BaseException(
            error.message || 'Internal Server Error',
            HttpStatus.INTERNAL_SERVER_ERROR,
            'INTERNAL_ERROR',
            { originalError: error.message },
            options.i18nKey,
            { resource: options.resource, operation: options.operation }
          );
  
          if (options.i18nKey && this.i18n) {
            const translatedMessage: any = await this.i18n.t(options.i18nKey, {
              args: baseError.metadata,
            });
  
            return throwError(
              () =>
                new BaseException(
                  translatedMessage,
                  baseError.statusCode,
                  baseError.errorCode,
                  baseError.metadata,
                  baseError.i18nKey,
                  baseError.i18nArgs
                )
            );
          }
  
          return throwError(() => baseError);
        })
      );
    }
  }
  