import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class SuperAdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader) {
            throw new UnauthorizedException('No authorization header found');
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new UnauthorizedException('Invalid authorization format');
        }

        try {
            const decoded = jwt.decode(token) as any;

            const isSuperAdmin = decoded?.resource_access?.['realm-management']?.roles.includes('realm-admin');
            console.log('he is super')

            if (!isSuperAdmin) {
                throw new ForbiddenException('Access denied: Super admin rights required');
            }

            return true;
        } catch (error) {
            if (error instanceof ForbiddenException) {
                throw error;
            }
            throw new UnauthorizedException('Invalid token');
        }
    }
}