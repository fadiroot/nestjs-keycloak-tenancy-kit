import { HttpStatus } from '@nestjs/common';

export class ApiResponse {
  constructor(
    protected readonly code: HttpStatus,
    public readonly message: string,
  ) {}

  public prepare<T>(res, responseBody: T): Response {
    return res.status(this.code).json({
      message: this.message,
      ...responseBody,
    });
  }
}
