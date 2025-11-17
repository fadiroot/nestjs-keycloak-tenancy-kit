import {
  Injectable,
  Inject,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import axios from 'axios';
import { CreateTenantDto } from './dto/createTenant.dto';
import { Tenant } from '../database/tenantsTable';
import SetupContainer from './services/setupContainer.service';
import { ITenantRepository } from './repository/tenantRepositoryInterface';
import { TENANT_REPOSITORY_TOKEN } from './constants';
import { KeycloakTenantService, OrganizationData } from './services/keycloakTenant.service';
import { UpdateTenantDto } from './dto/updateTenant.dto';
import { UpdatedOrganizationData } from './services/keycloakTenant.service';
import { BadRequestException } from '../common/exceptions/application.exceptions';
import { I18nService } from 'nestjs-i18n';
import { TransactionContext } from '../transaction/transaction.type';
import { TransactionManager } from '../transaction/transactionManager';
import { CurrentTenantService } from './services/currentTenant.service';


interface ContainerInfo {
  dbName: string;
  dbUser: string;
  dbPassword: string;
  port: number;
}


interface TenantTransactionContext extends TransactionContext {
  containerInfo?: ContainerInfo;
  keycloakOrgId?: string;
  tenantRecord?: Tenant.selectable;
  createTenantDto?: CreateTenantDto;
  keycloakResponse?: axios.AxiosResponse;
  keycloakOrgData?: OrganizationData;
  updateTenantDto?: UpdateTenantDto;
  existingTenant?: Tenant.selectable;
  updatedOrganizationData?: UpdatedOrganizationData;
  updatedTenant?: Tenant.selectable;
}

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);
  currentTenantService: CurrentTenantService;

  constructor(
    @Inject(TENANT_REPOSITORY_TOKEN)
    private readonly tenantRepository: ITenantRepository,
    private readonly setupContainer: SetupContainer,
    private readonly keycloakTenantService: KeycloakTenantService,
    private readonly i18n: I18nService
  ) { }

  async getTenantById(orgId: string): Promise<Tenant.selectable | null> {
    try {
      const tenant = await this.tenantRepository.findById(orgId);
      return tenant;
    } catch (error) {
      this.logger.error(`Error fetching tenant by orgId: ${error}`, error);
    }
  }
  async getTenantByOrgId(orgId: string): Promise<Tenant.selectable | null> {
    
    try {
      const tenant = await this.tenantRepository.findByOrgId(orgId) ; 
      return tenant
    }
     catch (error) {
      this.logger.error(`Error fetching tenant by orgId: ${error}`, error);
    }
  }
  async getAllTenants() : Promise<Tenant.selectable[] | null> {
    try {
      const tenants = await this.tenantRepository.findAllTenants()
      return tenants
    }
    catch(error) {
      this.logger.error(`Error fetching all tenants: ${error}` , error)
    }
  }

  async createTenant(
    createTenantDto: CreateTenantDto
  ): Promise<Tenant.selectable> {
    const transaction = new TransactionManager<TenantTransactionContext>({
      createTenantDto,
    });


    // Step 1: Validate tenant
    transaction.addStep({
      name: 'validateTenant',
      execute: async (context) => {
        const { domain, name } = context.createTenantDto;
        const existingTenant = await this.checkExistingTenant(domain, name);
        if (existingTenant) {
          throw new BadRequestException(
            this.i18n,
            'tenants',
            'domain.alreadyExist'
          );
        }
      },
      rollback: async () => { }, // No rollback needed for validation
    });

    // Step 2: Create container
    transaction.addStep({
      name: 'createContainer',
      execute: async (context) => {
        const containerInfo = await this.setupTenantContainer(
          context.createTenantDto.name
        );
        console.log({containerInfo})
        return containerInfo;
      },
      rollback: async (context) => {
        if (context.createContainer) {
          await this.setupContainer.deleteContainer(
            context.createContainer.containerId
          );
        }
      },
    });

    // Step 3: Run migrations
    transaction.addStep({
      name: 'runMigrationsAndSeeders',
      execute: async (context) => {
        if (!context.createContainer) {
          throw new Error('Container info not available');
        }
        await this.setupContainer.runMigrationsAndSeeders(context.createContainer);
      },
      rollback: async () => {
      },
    });

    // Step 4: Create Keycloak Organization
    transaction.addStep({
      name: 'createKeycloakOrg',
      execute: async (context) => {
        const { name, domain } =
          context.createTenantDto;
        const createOrganizationData = {
          name: name,
          alias: domain,
          description: `Organization for ${name}`,
          redirectUrl: `https://${domain}`,
          domains: [{ name: domain, verified: false }],
          attributes: {},
        };

        const keycloakResponse =
          await this.keycloakTenantService.createOrganization(
            createOrganizationData,
         
          );
        console.log(keycloakResponse)
        const keycloakOrgData = JSON.parse(keycloakResponse.config.data);
        const locationHeader = keycloakResponse.headers.location;
        const organizationId = locationHeader.split('/').pop();

        if (!organizationId) {
          throw new InternalServerErrorException(
            'Failed to extract organization ID from Keycloak response'
          );
        }

        return {
          organizationId,
          keycloakResponse,
          keycloakOrgData,
        };
      },
      rollback: async (context) => {
        if (context.createKeycloakOrg?.organizationId) {
          await this.keycloakTenantService.deleteOrganization(
            context.createKeycloakOrg.organizationId
          );
        }
      },
    });

    // Step 5: Create tenant record
    transaction.addStep({
      name: 'createTenantRecord',
      execute: async (context) => {
        if (!context.createContainer || !context.createKeycloakOrg) {
          throw new Error('Missing required context for tenant creation');
        }
        const { organizationId, keycloakOrgData } = context.createKeycloakOrg;
        const containerInfo = context.createContainer;
        const { name, domain } = context.createTenantDto;

        const tenantData = {
          id: organizationId,
          name,
          redirect_url: keycloakOrgData.redirectUrl,
          alias: keycloakOrgData.alias,
          host_domain: domain,
          db_name: containerInfo.dbName,
          db_user: containerInfo.dbUser,
          db_password: containerInfo.dbPassword,
          db_port: containerInfo.port,
        };

        const tenant = await this.insertTenantRecord(tenantData);
        this.logger.log(
          `Tenant created successfully: ${JSON.stringify(tenant)}`
        );
        return tenant;
      },
      rollback: async (context) => {
        if (context.createTenantRecord?.id) {
          await this.tenantRepository.delete(context.createTenantRecord.id);
        }
      },
    });

    // Execute the transaction
    const result = await transaction.execute();
    if (!result.success) {
      throw new InternalServerErrorException(
        'Failed to create tenant: ' + result.error?.message
      );
    }
    return result.data.createTenantRecord;
  }

  private async checkExistingTenant(
    domain: string,
    name: string
  ): Promise<{ error: string } | null> {
    const existingTenant = await this.tenantRepository.findByDomainOrName(
      domain,
      name
    );
    if (existingTenant) {
      if (existingTenant.host_domain === domain) {
        return { error: 'A tenant with this domain already exists' };
      }
      ('');
      if (existingTenant.name === name) {
        return { error: 'A tenant with this name already exists' };
      }
    }
    return null;
  }

  private async setupTenantContainer(name: string): Promise<ContainerInfo> {
    try {
      return await this.setupContainer.createContainer(
        name.toLowerCase().replace(/\s/g, '_')
      );
    } catch (error) {
      this.logger.error(`Error setting up tenant container: ${error}`, error);
      throw new InternalServerErrorException(
        'Failed to set up tenant container'
      );
    }
  }

  private async insertTenantRecord(
    tenantData: Tenant.insertable
  ): Promise<Tenant.selectable> {
    try {
      return await this.tenantRepository.create(tenantData);
    } catch (error) {
      this.logger.error(`Error inserting tenant record: ${error}`, error);
      throw new InternalServerErrorException('Failed to insert tenant record');
    }
  }

  async updateTenant(id: string, updateTenantDto: UpdateTenantDto) {
    try {
      const existingTenant = await this.tenantRepository.findById(id);
      if (!existingTenant) {
        return {
          success: false,
          message: 'Tenant not found',
          error: 'Tenant not found',
        };
      }
      // Construct the UpdatedOrganizationData with existing values
      const updatedOrganizationData: UpdatedOrganizationData = {
        name: updateTenantDto.name ?? existingTenant.name,
        alias: existingTenant.alias,
        description: `Organization for ${updateTenantDto.name ?? existingTenant.name}`,
        redirectUrl: `https://${updateTenantDto.domain ?? existingTenant.host_domain}`,
        domains: [
          {
            name: updateTenantDto.domain ?? existingTenant.host_domain,
            verified: false,
          },
        ],
        attributes: {}, 
      };

      // Update organization in Keycloak
      await this.keycloakTenantService.updateOrganization(
        existingTenant.id,
        updatedOrganizationData
      );

      // Update tenant data
      const { ownerFirstName, ownerLastName, domain, ...updateData } =
        updateTenantDto;
      const updatedTenantData = {
        ...existingTenant,
        ...updateData,
        host_domain: domain,
      };

      const updatedTenant = await this.tenantRepository.update(
        id,
        updatedTenantData
      );

      this.logger.log(
        `Tenant updated successfully: ${JSON.stringify(updatedTenant)}`
      );

      return updatedTenant;
    } catch (error) {
      this.logger.error(`Error updating tenant: ${error}`, error);
      return {
        success: false,
        message: 'Failed to update tenant',
      };
    }
  }


}
