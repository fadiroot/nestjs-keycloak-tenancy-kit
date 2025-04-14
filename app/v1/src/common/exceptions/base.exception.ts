import { HttpException, HttpStatus } from '@nestjs/common';

export class BaseException extends HttpException {
  constructor(
    public readonly message: string,
    public readonly statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    public readonly errorCode: string = 'INTERNAL_ERROR',
    public readonly metadata: Record<string, any> = {},
    public readonly i18nKey?: string,
    public readonly i18nArgs?: Record<string, any>
  ) {
    super(message, statusCode);
  }
}
