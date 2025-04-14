import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/PermissionUser.decorator';
import { Permissions } from '../../permission/enum/permission.enum';
import { IUserRequest } from '../../user/interfaces/user.interface';
import { RolePermissionService } from '../../rolePermission/rolePermission.service';



@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rolePermissionService: RolePermissionService
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<Permissions[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest<IUserRequest>();
    const user = request.user;

    const permissions = await this.rolePermissionService.getPermissionsByRoleId(user.roleId);

    const userPermissions = permissions.rows.map((p: any) => p.name);
    const hasAllPermissions = requiredPermissions.every(permission =>
      userPermissions.includes(permission)
    );
    console.log(hasAllPermissions)

    return hasAllPermissions;
  }
}