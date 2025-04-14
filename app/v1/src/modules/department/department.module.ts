import { forwardRef, Module } from '@nestjs/common';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';
import { DepartmentRepository } from './department.repository';
import { UserModule } from '../user/user.module';
import { DepartmentLeaveApproversModule } from '../departmentLeaveApprovers/departmentLeaveApprovers.module';
import { I18nModule } from 'nestjs-i18n';
import { TenantModule } from '../../tenants/tenants.module';

@Module({
  imports: [
    forwardRef(()=>UserModule),
    DepartmentLeaveApproversModule,
    TenantModule
    
  ],
  controllers: [DepartmentController],
  providers: [DepartmentService, DepartmentRepository],
  exports: [DepartmentService],
})
export class DepartmentModule { }

