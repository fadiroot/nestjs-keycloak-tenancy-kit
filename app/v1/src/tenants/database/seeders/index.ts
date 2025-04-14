import { seedLeaveTypes } from './leaveTypes.seeder';
import { seedSocialLinkTypes } from './socialLinkType.seeder';
import { seedeDepartment } from './department.seeder';
import { seedPermissions } from './permission.seeder';
import { seedRolePermission } from './rolePermission.seeder';
import { seedLeaveTypeDepartments } from './seedLeaveTypeDepartments';

export const seed = async (tenantDb) => {
  await seedLeaveTypes(tenantDb);
  await seedSocialLinkTypes(tenantDb);
  await seedeDepartment(tenantDb);
  await seedPermissions(tenantDb);
  await seedRolePermission(tenantDb);
  await seedLeaveTypeDepartments(tenantDb);
};
