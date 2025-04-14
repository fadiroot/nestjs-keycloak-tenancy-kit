import { Global, Module } from '@nestjs/common';
import { RolePermissionService } from './rolePermission.service';
import { RolePermissionController } from './rolePermission.controller';
import { TenantDatabaseManager } from '../../tenants/database/tenantDatabaseManager';
import { RolePermissionRepository } from './rolePermission.repository';

@Global()

@Module({
  imports: [],
  controllers: [RolePermissionController],
  exports :[
    RolePermissionService,
    RolePermissionRepository,

  ],
  providers: [
    RolePermissionService,
    RolePermissionRepository,
    TenantDatabaseManager,
  ],
})
export class RolePermissionModule {}
