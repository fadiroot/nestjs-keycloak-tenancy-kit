import {
  Injectable,
  ValidationPipe,
  ValidationError,
  ArgumentMetadata,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { ValidationException } from '../exceptions/validation.exceptions';
import { Reflector } from '@nestjs/core';

@Injectable()
export class I18nValidationPipe extends ValidationPipe {
  private static readonly MODULE_NAME_METADATA_KEY = 'module_name';

  // Public static getter for the metadata key
  public static getModuleNameMetadataKey() {
    return I18nValidationPipe.MODULE_NAME_METADATA_KEY;
  }

  constructor(
    private readonly i18n: I18nService,
    private readonly reflector: Reflector
  ) {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (errors: ValidationError[]) =>
        new ValidationException(errors),
    });
  }

  async transform(value: any, metadata: ArgumentMetadata) {
    try {
      return await super.transform(value, metadata);
    } catch (error) {
      if (error instanceof ValidationException) {
        const translatedErrors = await this.translateErrors(
          error.getErrors(),
          metadata.type
        );
        error.setErrors(translatedErrors);
      }
      throw error;
    }
  }

  private async translateErrors(
    errors: ValidationError[],
    moduleType: string
  ): Promise<any[]> {
    const translateError = async (error: ValidationError): Promise<any> => {
      const translatedConstraints: Record<string, string> = {};
      const constraints = error.constraints || {};

      // Retrieve the module name either from metadata or fallback to moduleType
      const moduleName =
        this.reflector.get<string>(
          I18nValidationPipe.getModuleNameMetadataKey(), // Use the public getter
          error.target.constructor
        ) || moduleType;

      // Loop through each constraint and attempt to translate its message
      for (const [constraintKey, defaultMessage] of Object.entries(
        constraints
      )) {
        // Dynamically construct the key based on the module name, error property, and validation type
        const i18nKey = `${moduleName}.validation.${error.property}.${constraintKey}`;

        try {
          // Fetch the translated message
          translatedConstraints[constraintKey] = await this.i18n.t(i18nKey, {
            args: { property: error.property, value: error.value },
          });
        } catch {
          // Fallback to default message if translation key is missing
          translatedConstraints[constraintKey] = defaultMessage;
        }
      }

      // Prepare translated error object
      const translatedError = {
        ...error,
        constraints: translatedConstraints,
      };

      // Recursively translate children errors if any
      if (error.children?.length) {
        translatedError.children = await Promise.all(
          error.children.map((child) => translateError(child))
        );
      }

      return translatedError;
    };

    return Promise.all(errors.map((error) => translateError(error)));
  }
}
