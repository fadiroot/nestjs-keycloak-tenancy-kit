import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  isUUID,
} from 'class-validator';

@ValidatorConstraint({ name: 'isUUIDOrAll', async: false })
export class IsUUIDOrAll implements ValidatorConstraintInterface {
  validate(value: string[]) {
    if (!Array.isArray(value)) return false;
    return value.every((item) => item === 'all' || isUUID(item, 4));
  }

  defaultMessage() {
    return 'Each value must be either a valid UUID v4 or "all"';
  }
}
