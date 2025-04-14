import { Injectable } from '@nestjs/common';
import { Database } from './database/database';
import { Tenant } from './database/tenantsTable';
import { I18nContext } from 'nestjs-i18n';
@Injectable()
export class AppService {
  constructor(private readonly database: Database) {}

  async getHello(i18n: I18nContext): Promise<string> {
    return await i18n.t('translation.greeting',{args:{test:1}});
  }

  async getAllTenants(): Promise<Tenant.selectable[]> {
    try {
      const tenants = await this.database
        .selectFrom('tenants')
        .selectAll()
        .execute();
      return tenants;
    } catch (error) {
      console.log('Error ftching tenants :', error);
      throw new Error('Failed to fetch tenants');
    }
  }
}
