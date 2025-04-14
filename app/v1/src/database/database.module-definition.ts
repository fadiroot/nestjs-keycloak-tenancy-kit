import { ConfigurableModuleBuilder } from '@nestjs/common';
import { DatabaseOptions } from './database.options';

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  ASYNC_OPTIONS_TYPE,
  OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<DatabaseOptions>()
  .setClassMethodName('forRoot')
  .setExtras({}, (definition) => ({
    ...definition,
    global: true,
  }))
  .build();