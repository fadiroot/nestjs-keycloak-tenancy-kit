import { Inject, Injectable } from '@nestjs/common';
import { TENANT_DB } from '../../../tenants/constants';
import { TenantDatabase } from '../../../tenants/database/database';
import {
    SocialLinkTypesMapper,
    socialLinkTypes
} from '../interfaces/socialLinkTypes';


@Injectable()
export class SocialLinkTypesRepository {
    constructor(
        @Inject(TENANT_DB) private readonly tenantDb: TenantDatabase
    ) { }

    async findAll() {
        const socialLinkTypes = await this.tenantDb
            .selectFrom('social_link_types')
            .selectAll()
            .where('deleted_at', 'is', null)
            .execute();

        return socialLinkTypes ? SocialLinkTypesMapper.toDomain(socialLinkTypes) : [];
    }

    async findById(id: string): Promise<socialLinkTypes.selectable | null> {
        const socialLinkType = await this.tenantDb
            .selectFrom('social_link_types')
            .selectAll()
            .where('id', '=', id)
            .where('deleted_at', 'is', null)
            .executeTakeFirst();

        return socialLinkType ? SocialLinkTypesMapper.toDomain(socialLinkType) : null;
    }
} 