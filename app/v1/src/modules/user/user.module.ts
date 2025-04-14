import { forwardRef, Global, Module } from "@nestjs/common";
import { UserRepository } from "./repositories/user.repository";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { TenantDatabaseManager } from "../../tenants/database/tenantDatabaseManager";
import { EducationRepository } from "./repositories/education.repository";
import { VisaRepository } from "./repositories/visa.repository";
import { EmergencyRepository } from "./repositories/emergency.repository";
import { UserExtraInformationRepository } from "./repositories/userExtraInformation.repository";
import { UserSocialLinksRepository } from "./repositories/userSocialLinks.repository";
import { JobTitleController } from "./controllers/jobTitle.controller";
import { JobTitleRepository } from "./repositories/jobTitle.repository";
import { JobTitleService } from "./services/jobTitle.service";
import { RoleService } from "../role/role.service";
import { DepartmentService } from "../department/department.service";
import { RoleModule } from "../role/role.module";
import { DepartmentModule } from "../department/department.module";
import { RoleRepository } from "../role/role.repository";
import { DepartmentRepository } from "../department/department.repository";
import { SocialLinkTypesController } from "./controllers/socialLinkTypes.controller";
import { SocialLinkTypesService } from "./services/socialLinkTypes.service";
import { SocialLinkTypesRepository } from "./repositories/socialLinkTypes.repository";
import { TenantModule } from "../../tenants/tenants.module";
import { TenantService } from "../../tenants/tenant.service";

@Global()
@Module({
    imports: [
        RoleModule,
        forwardRef(() => DepartmentModule),
        TenantModule,
        



    ],
    providers: [
        UserService,
        UserRepository,
        VisaRepository,
        EmergencyRepository,
        TenantDatabaseManager,
        EducationRepository,
        UserExtraInformationRepository,
        UserSocialLinksRepository,
        JobTitleRepository,
        JobTitleService,
        RoleService,
        RoleRepository,
        SocialLinkTypesService,
        SocialLinkTypesRepository,
        


    ],
    controllers: [UserController, JobTitleController, SocialLinkTypesController],
    exports: [
        UserService,
        TenantDatabaseManager,
    ],
})
export class UserModule { }

