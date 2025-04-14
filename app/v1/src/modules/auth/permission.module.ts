import { Module } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { RolePermissionService } from '../rolePermission/rolePermission.service';
import { PermissionGuard } from './guards/permisson.guard';
import { UserRepository } from '../user/repositories/user.repository';
import { TenantModule } from '../../tenants/tenants.module';

@Module({
    imports: [TenantModule],
    providers: [
        UserService,
        RolePermissionService,
        PermissionGuard,
        UserRepository
        
    ],
    exports: [
        RolePermissionService,
        PermissionGuard
    ]
})
export class PermissionModule {} 