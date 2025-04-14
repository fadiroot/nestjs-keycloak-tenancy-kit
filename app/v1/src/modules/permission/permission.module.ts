import { Module } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { TenantDatabaseManager } from '../../tenants/database/tenantDatabaseManager';
import { PermissionRepository } from './permission.repository';

@Module({
  controllers: [PermissionController],
  providers: [
    PermissionService,
    PermissionRepository,
    TenantDatabaseManager
  ],
  exports: [PermissionService, PermissionRepository]
})
export class PermissionModule { }
