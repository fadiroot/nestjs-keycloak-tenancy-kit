import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { TenantDatabaseManager } from '../../tenants/database/tenantDatabaseManager';
import { RoleRepository } from './role.repository';
import { TenantModule } from '../../tenants/tenants.module';

@Module({
  imports: [TenantModule],
  controllers: [RoleController],
  providers: [RoleService, RoleRepository, TenantDatabaseManager],
})
export class RoleModule {}
