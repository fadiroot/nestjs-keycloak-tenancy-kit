import { Injectable, Inject } from "@nestjs/common";
import { TENANT_DB } from "../../../../src/tenants/constants";
import { TenantDatabase } from "../../../../src/tenants/database/database";
import { SOCIAL_LINK_TYPES_TABLE, USER_SOCIAL_LINKS_TABLE } from "../user.constants";
import { userSocialLinks } from '../interfaces/userSocialLinks.interface'; // Import the namespace

@Injectable()
export class UserSocialLinksRepository {
  constructor(@Inject(TENANT_DB) private readonly tenantDb: TenantDatabase) {}

  async addOrUpdateUserSocialLinks(
    userId: string, 
    socialLinks: userSocialLinks.insertable[]  // Use the insertable type
  ) {
    // Store the results of upsert operations
    const upsertedLinks: userSocialLinks.selectable[] = [];

    for (const link of socialLinks) {
      const existingLink = await this.tenantDb
        .selectFrom(USER_SOCIAL_LINKS_TABLE)
        .where('user_id', '=', userId)
        .where('social_link_type_id', '=', link.social_link_type_id)
        .executeTakeFirst();

      if (existingLink) {
        // Update existing link
        const updatedLink = await this.tenantDb
          .updateTable(USER_SOCIAL_LINKS_TABLE)
          .set({
            link_url: link.link_url,
            updated_at: new Date()
          })
          .where('user_id', '=', userId)
          .where('social_link_type_id', '=', link.social_link_type_id)
          .returningAll()
          .executeTakeFirstOrThrow();

        upsertedLinks.push(updatedLink);
      } else {
        // Insert new link
        const newLink = await this.tenantDb
          .insertInto(USER_SOCIAL_LINKS_TABLE)
          .values({
            user_id: userId,
            social_link_type_id: link.social_link_type_id,
            link_url: link.link_url,
            created_at: new Date(),
            updated_at: new Date()
          })
          .returningAll()
          .executeTakeFirstOrThrow();

        upsertedLinks.push(newLink);
      }
    }

    return upsertedLinks;
  }

  // Existing methods remain the same...

  async removeSpecificSocialLink(
    userId: string, 
    socialLinkTypeId: string
  ) {
    const deletedLink = await this.tenantDb
      .deleteFrom(USER_SOCIAL_LINKS_TABLE)
      .where('user_id', '=', userId)
      .where('social_link_type_id', '=', socialLinkTypeId)
      .returningAll()
      .executeTakeFirst();

    return deletedLink;
  }
} 