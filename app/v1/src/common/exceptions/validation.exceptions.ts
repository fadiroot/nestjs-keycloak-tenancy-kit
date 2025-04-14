import { BadRequestException, ValidationError } from '@nestjs/common';

export class ValidationException extends BadRequestException {
  private errors: ValidationError[];

  constructor(validationErrors: ValidationError[]) {
    super('Validation failed.'); 
    this.errors = validationErrors;
  }

  getErrors(): ValidationError[] {
    return this.errors;
  }
  setErrors(errors: ValidationError[]) {
    this.errors = errors;
  }
}
