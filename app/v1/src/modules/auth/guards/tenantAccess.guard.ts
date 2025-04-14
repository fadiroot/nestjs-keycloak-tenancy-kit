import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../../user/user.service';
import * as jwt from 'jsonwebtoken';
import { UserMapper } from '../../user/interfaces/user.interface';
import { Reflector } from '@nestjs/core';

interface KeycloakToken {
  exp: number;
  iat: number;
  auth_time: number;
  jti: string;
  iss: string;
  aud: string[];
  sub: string;
  typ: string;
  azp: string;
  session_state: string;
  acr: string;
  'allowed-origins': string[];
  realm_access: {
    roles: string[];
  };
  resource_access: {
    [key: string]: {
      roles: string[];
    };
  };
  scope: string;
  sid: string;
  email_verified: boolean;
  name: string;
  preferred_username: string;
  given_name: string;
  family_name: string;
  email: string;
}

@Injectable()
export class TenantAccessGuard implements CanActivate {
  constructor(
    private readonly userService: UserService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    try {
      const authHeader = request.headers.authorization;
      if (!authHeader) {
        throw new UnauthorizedException('No authorization header found');
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        throw new UnauthorizedException('Invalid authorization format');
      }
      request.token = token

      let decodedToken: KeycloakToken;
      try {
        const decoded = jwt.decode(token);
        if (!decoded || typeof decoded === 'string') {
          throw new Error('Invalid token format');
        }
        decodedToken = decoded as KeycloakToken;
      } catch (tokenError) {
        console.error('Token decode error:', tokenError);
        throw new UnauthorizedException('Invalid token format');
      }

      const isSuperAdmin = decodedToken?.resource_access?.['realm-management']?.roles.includes('realm-admin');
      if (isSuperAdmin){
        return true
      }
      const userEmail = decodedToken.email;

      if (!userEmail) {
        throw new UnauthorizedException('No email found in token');
      }

      const user = await this.userService.findByEmail(userEmail);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      
      request.user = UserMapper.toDomain(user);
      return true;

    } catch (error) {
      console.error('Guard error:', error);
      throw new UnauthorizedException(
        error instanceof UnauthorizedException ? error.message : 'Authentication failed'
      );
    }
  }
}