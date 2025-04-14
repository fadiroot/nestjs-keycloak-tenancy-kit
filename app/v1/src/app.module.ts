import { PermissionModule } from './modules/permission/permission.module';
import { RoleModule } from './modules/role/role.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TenantModule } from './tenants/tenants.module';
import { AcceptLanguageResolver, I18nModule } from 'nestjs-i18n';
import { join } from 'path';
import { RolePermissionModule } from './modules/rolePermission/rolePermission.module';
import { DepartmentModule } from './modules/department/department.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { LocationModule } from './modules/location/location.module';
import { DepartmentLeaveApproversModule } from './modules/departmentLeaveApprovers/departmentLeaveApprovers.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { LeaveTypesModule } from './modules/leaveTypes/leaveTypes.module';
import { LeaveTypeLocationsModule } from './modules/leaveTypeLocations/leaveTypeLocations.module';
import { LeaveTypeDepartmentsModule } from './modules/leaveTypeDepartments/leaveTypeDepartments.module';
import { LeaveModule } from './modules/leave/leave.module';
import { RoleUserModule } from './modules/role_user/role_user.module';
import { LeaveTypeSpecialEmployeesModule } from './modules/leaveTypeSpecialEmployees/leaveTypeSpecialEmployees.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { DropboxModule } from './modules/dropbox/dropbox.module';
import { LeaveApprovalsModule } from './modules/leaveApprovals/leaveApprovals.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: configService.getOrThrow('FALLBACK_LANGUAGE'),
        loaderOptions: {
          path: join(__dirname, '/i18n/'),
          watch: true,
        },
      }),
      resolvers: [AcceptLanguageResolver],
      inject: [ConfigService],
    }),
    DatabaseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          host: configService.get('POSTGRES_HOST'),
          port: configService.get('POSTGRES_PORT') || 5432,
          user: configService.get('POSTGRES_USER'),
          password: configService.get('POSTGRES_PASSWORD'),
          database: configService.get('POSTGRES_DB'),
        };
      },
    }),
    AuthModule,
    TenantModule,
    RoleModule,
    PermissionModule,
    RolePermissionModule,
    UserModule,
    DepartmentModule,
    LocationModule,
    DepartmentLeaveApproversModule,
    LeaveTypesModule,
    LeaveModule,
    LeaveTypeLocationsModule,
    LeaveTypeDepartmentsModule,
    RoleUserModule,
    LeaveTypeSpecialEmployeesModule,
    StatisticsModule,
    LeaveApprovalsModule,
    DropboxModule
    
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
