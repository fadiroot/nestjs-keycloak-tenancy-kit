import { Global, Module, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { DatabaseModule } from '../database/database.module';
import { CurrentTenantService } from './services/currentTenant.service';
import { TenantDatabaseManager } from './database/tenantDatabaseManager';
import SetupContainer from './services/setupContainer.service';
import { TenantRepository } from './repository/tenantRepository';
import { TENANT_DB, TENANT_REPOSITORY_TOKEN } from './constants';
import { KeycloakTenantService } from './services/keycloakTenant.service';
import { RoleRepository } from '../modules/role/role.repository';
import { DepartmentRepository } from '../modules/department/department.repository';
import { Logger } from '@nestjs/common';
import { TenantDatabaseSetupService } from './services/TenantDatabaseSetup.service';

@Global()
@Module({
  imports: [DatabaseModule],
  controllers: [TenantController],
  providers: [
    Logger,
    TenantService,
    CurrentTenantService,
    TenantDatabaseManager,
    SetupContainer,
    KeycloakTenantService,
    RoleRepository,
    DepartmentRepository,
    {
      provide: TENANT_REPOSITORY_TOKEN,
      useClass: TenantRepository,
    },
    {
      provide: TENANT_DB,
      useFactory: async (
        tenantDatabaseSetupService: TenantDatabaseSetupService,
        request: Request,
      ) => {
        return tenantDatabaseSetupService.setupTenantDatabase(request);
      },
      inject: [TenantDatabaseSetupService, REQUEST],
      scope: Scope.REQUEST,
    },
    TenantDatabaseSetupService, 
  ],
  exports: [
    TenantService,
    CurrentTenantService,
    TenantDatabaseManager,
    TENANT_DB,
    KeycloakTenantService,
  ],
})
export class TenantModule { }
