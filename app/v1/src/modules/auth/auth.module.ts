import { Global, Module } from '@nestjs/common';
import {
  AuthGuard,
  KeycloakConnectModule,
  PolicyEnforcementMode,
  TokenValidation,
} from 'nest-keycloak-connect';
import { APP_GUARD } from '@nestjs/core';
import { UserModule } from '../user/user.module';
import { TenantAccessGuard } from './guards/tenantAccess.guard';
import { DatabaseModule } from '../../database/database.module';
import { Reflector } from '@nestjs/core';
import { UserService } from '../user/user.service';
import { RolePermissionModule } from '../rolePermission/rolePermission.module';

// Add config based on environment
const getKeycloakConfig = () => {
  const env = process.env.NODE_ENV || 'development';

  const configs = {
    development: {
      authServerUrl: process.env.KEYCLOAK_URL || 'http://keycloak:8080',
      realm: process.env.KEYCLOAK_REALM || 'company',
      clientId: process.env.KEYCLOAK_CLIENT_ID || 'company-hr',
      secret: process.env.KEYCLOAK_CLIENT_SECRET,
    },
    production: {
      authServerUrl: 'https://company-hr-auth.company.com',
      realm: process.env.KEYCLOAK_REALM || 'company',
      clientId: process.env.KEYCLOAK_CLIENT_ID || 'company-hr',
      secret: process.env.KEYCLOAK_CLIENT_SECRET,
    },
  };
  console.log('Keycloak Configuration:', configs[env]);

  return configs[env] || configs.development;
};

export const keycloakConfig = getKeycloakConfig();

@Global()
@Module({
  imports: [
    KeycloakConnectModule.register({
      authServerUrl: keycloakConfig.authServerUrl,
      realm: keycloakConfig.realm,
      clientId: keycloakConfig.clientId,
      secret: keycloakConfig.secret ?? '',
      policyEnforcement: PolicyEnforcementMode.PERMISSIVE,
      verifyTokenAudience: false,
      tokenValidation: TokenValidation.OFFLINE,
      bearerOnly: true,
      useNestLogger: true,
    }),
    UserModule,
    DatabaseModule,
  ],
  providers: [
    TenantAccessGuard,
    Reflector,

    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useFactory: (reflector: Reflector, userService: UserService) => {
        const guard = new TenantAccessGuard(userService);
        return guard;
      },
      inject: [Reflector, UserService],
    },
  ],
  exports: [TenantAccessGuard],
})
export class AuthModule { }
