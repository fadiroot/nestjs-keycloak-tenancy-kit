import { Module } from '@nestjs/common';
import { RoleUserService } from './role_user.service';
import { RoleUserController } from './role_user.controller';
import { TenantDatabaseManager } from '../../tenants/database/tenantDatabaseManager';
import { RoleUserRepository } from './role_user.repository';

@Module({
  imports: [],
  controllers: [RoleUserController],
  providers: [RoleUserService, RoleUserRepository, TenantDatabaseManager],
})
export class RoleUserModule {}
