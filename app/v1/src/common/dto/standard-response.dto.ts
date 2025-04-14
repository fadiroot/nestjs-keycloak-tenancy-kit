export interface StandardResponse<T> {
    statusCode: number;
    message: string;
    data?: T; // Optional data field
  }
  