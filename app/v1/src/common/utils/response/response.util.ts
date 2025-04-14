import { HttpStatus } from '@nestjs/common';
import { ApiResponse } from './api.response';

export class SuccessMsgResponse extends ApiResponse {
  constructor(message: string) {
    super(HttpStatus.OK, message); // Use HttpStatus.OK for success messages
  }

  public send(res: Response): Response {
    return super.prepare(res, {});
  }
}

export class SuccessResponse<T> extends ApiResponse {
  public readonly code: HttpStatus;

  constructor(
    message: string,
    private readonly data: T,
    code: HttpStatus = HttpStatus.OK // Default to HttpStatus.OK
  ) {
    super(code, message);
    this.code = code;
  }

  public send(res: Response): Response {
    return super.prepare(res, { data: this.data });
  }
}

export class SuccessResponsePaginate<T> extends ApiResponse {
  private docs: T[];
  private meta: any;

  constructor(message: string, docs: T[], meta: any) {
    super(HttpStatus.OK, message);
    this.docs = docs;
    this.meta = meta;
  }

  public send(res: Response): Response {
    return super.prepare(res, {
      docs: this.docs,
      meta: this.meta,
    });
  }
}
