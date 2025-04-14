import { SetMetadata } from '@nestjs/common';
import { I18nValidationPipe } from '../pipes/i18n-validation.pipe';

export const ModuleName = (name: string) => 
  SetMetadata(I18nValidationPipe.getModuleNameMetadataKey(), name);