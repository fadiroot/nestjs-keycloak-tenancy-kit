import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export enum DateComparisonOperator {
  BEFORE = 'before',
  AFTER = 'after',
  EQUAL = 'equal',
  BEFORE_OR_EQUAL = 'beforeOrEqual',
  AFTER_OR_EQUAL = 'afterOrEqual',
}

export interface DateValidationConfig {
  targetProperty: string;
  operator: DateComparisonOperator;
}

export function CompareDates(
  config: DateValidationConfig,
  validationOptions?: ValidationOptions
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'compareDates',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [config],
      options: {
        message: `${propertyName} must be ${config.operator} ${config.targetProperty}`,
        ...validationOptions,
      },
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [config] = args.constraints as DateValidationConfig[];
          const object = args.object as Record<string, any>;

          const compareValue = new Date(value);
          const targetValue = new Date(object[config.targetProperty]);

          if (
            !compareValue ||
            !targetValue ||
            isNaN(compareValue.getTime()) ||
            isNaN(targetValue.getTime())
          ) {
            return false;
          }

          switch (config.operator) {
            case DateComparisonOperator.BEFORE:
              return compareValue < targetValue;
            case DateComparisonOperator.AFTER:
              return compareValue > targetValue;
            case DateComparisonOperator.EQUAL:
              return compareValue.getTime() === targetValue.getTime();
            case DateComparisonOperator.BEFORE_OR_EQUAL:
              return compareValue <= targetValue;
            case DateComparisonOperator.AFTER_OR_EQUAL:
              return compareValue >= targetValue;
            default:
              return false;
          }
        },
        defaultMessage(args: ValidationArguments) {
          const [config] = args.constraints as DateValidationConfig[];
          return `${args.property} must be ${config.operator} ${config.targetProperty}`;
        },
      },
    });
  };
}
