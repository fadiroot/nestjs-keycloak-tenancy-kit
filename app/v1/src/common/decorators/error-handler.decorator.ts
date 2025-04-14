import { SetMetadata, applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ErrorHandlerOptions, ERROR_HANDLER_METADATA } from '../interceptors/exception-interceptor';

export function HandleErrors(options: ErrorHandlerOptions) {
  return applyDecorators(
    SetMetadata(ERROR_HANDLER_METADATA, options),
    ApiResponse({
      status: 400,
      description: 'Bad Request Error',
    }),
    ApiResponse({
      status: 500,
      description: 'Internal Server Error',
    }),
  );
}