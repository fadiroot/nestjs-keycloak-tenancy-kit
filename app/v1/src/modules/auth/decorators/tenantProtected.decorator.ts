import { applyDecorators, UseGuards } from '@nestjs/common';
import { TenantAccessGuard } from '../guards/tenantAccess.guard';
import { PermissionGuard } from '../guards/permisson.guard';

export function TenantProtected() {
    return applyDecorators(
        UseGuards(TenantAccessGuard),
        UseGuards(PermissionGuard)
    );
}