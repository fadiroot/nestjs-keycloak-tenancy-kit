import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as qs from 'qs';
import { ConfigService } from '@nestjs/config';
import { opendirSync } from 'fs';
import { response } from 'express';
import FormData from 'form-data';
import { InviteUserDto } from '../dto/inviteUser.dto';
import { handleKeycloakError } from '../utilis/handleKeycloakError';

export interface Domain {
  name: string;
  verified: boolean;
}

export interface OrganizationData {
  name: string;
  alias: string;
  description: string;
  redirectUrl: string;
  domains: Domain[];
  attributes: Record<string, any>;
}
export interface UpdatedOrganizationData {
  name: string;
  alias: string;
  description: string;
  redirectUrl: string;
  domains: Domain[];
  attributes: Record<string, any>;
}
interface UserData {
  username: string;
  email: string;
  enabled: boolean;
  firstName?: string;
  lastName?: string;
}

@Injectable()
export class KeycloakTenantService {
  private readonly keycloakUrl: string;
  private readonly realm: string;
  private readonly adminUsername: string;
  private readonly adminPassword: string;
  private readonly adminClientId: string;
  private readonly grantType: string;
  private readonly clientSecret: string;

  constructor(
    private configService: ConfigService , 

  ) {
    this.keycloakUrl = this.configService.get<string>('KEYCLOAK_URL');
    this.realm = this.configService.get<string>('KEYCLOAK_REALM');
    this.adminUsername = this.configService.get<string>('KEYCLOAK_ADMIN');
    this.adminPassword = this.configService.get<string>('KEYCLOAK_ADMIN_PASSWORD');
    this.adminClientId = this.configService.get<string>('KEYCLOAK_CLIENT_ID');
    this.grantType = this.configService.get<string>('GRANT_TYPE');
    this.clientSecret = this.configService.get<string>('KEYCLOAK_CLIENT_SECRET')
  }

  private async getAdminToken(): Promise<string> {
    const tokenUrl = `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/token`;
    const data = qs.stringify({
      grant_type: this.grantType,
      username: this.adminUsername,
      password: this.adminPassword,
      client_secret: this.clientSecret,
      client_id: this.adminClientId,

    });
    console.log(data)

    try {
      const response = await axios.post(tokenUrl, data, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      return response.data.access_token;
    } catch (error) {
      handleKeycloakError(error, 'get admin token');
    }
  }

  async createOrganization( 
    organizationData: OrganizationData,
 
  ): Promise<axios.AxiosResponse> {
    const token = await this.getAdminToken();
    const createOrganizationUrl = `${this.keycloakUrl}/admin/realms/${this.realm}/organizations`;

    try {
      const response = await axios.post(
        createOrganizationUrl,
        organizationData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
    
      return response;
    } catch (error) {
      handleKeycloakError(error, 'create organization');
    }
  }

  async inviteUserToOrganization(inviteUserDto: InviteUserDto){
    const { organizationId, email, firstName, lastName } = inviteUserDto;
    try {
      const token = await this.getAdminToken();
      const inviteUserUrl = `${this.keycloakUrl}/admin/realms/${this.realm}/organizations/${organizationId}/members/invite-user`;
      const formData = new FormData();
      formData.append('email', email.trim());
      formData.append('firstName', firstName.trim());
      formData.append('lastName', lastName.trim());

      const invitedUser = await axios({
        method: 'post',
        url: inviteUserUrl,
        data: formData,
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${token}`,
          Accept: 'application/json, text/plain, */*',
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      });
      return invitedUser
      
    } catch (error) {
      handleKeycloakError(error, 'invite user to organization');
    }
  }

  async updateOrganization(
    organizationId: string,
    updatedOrganizationData: UpdatedOrganizationData
  ): Promise<void> {
    const token = await this.getAdminToken();
    const updateOrganizationUrl = `${this.keycloakUrl}/admin/realms/${this.realm}/organizations/${organizationId}`;

    try {
      const updatePayload = {
        name: updatedOrganizationData.name,
        alias: updatedOrganizationData.alias,
        description: updatedOrganizationData.description,
        redirectUrl: updatedOrganizationData.redirectUrl,
        domains: updatedOrganizationData.domains,
        attributes: updatedOrganizationData.attributes || {},
      };

      const response = await axios.put(updateOrganizationUrl, updatePayload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status !== 204) {
        throw new Error(
          `Failed to update organization: Unexpected status ${response.status}`
        );
      }
    } catch (error) {
      handleKeycloakError(error, 'update organization');
    }
  }

  async updateUser(
    userId: string,
    userData: {
      firstName?: string;
      lastName?: string;
      email?: string;
      enabled?: boolean;
    }
  ): Promise<void> {
    const token = await this.getAdminToken();
    const updateUserUrl = `${this.keycloakUrl}/admin/realms/${this.realm}/users/${userId}`;

    try {
      const updatePayload = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        enabled: userData.enabled,
        emailVerified: true,
      };

      const response = await axios.put(updateUserUrl, updatePayload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status !== 204) {
        throw new Error(
          `Failed to update user: Unexpected status ${response.status}`
        );
      }
    } catch (error) {
      handleKeycloakError(error, 'update user');
    }
  }

  async deleteMemberFromOrganization(
    organizationId: string,
    memberId: string
  ): Promise<void> {
    const token = await this.getAdminToken();
    const deleteUrl = `${this.keycloakUrl}/admin/realms/${this.realm}/organizations/${organizationId}/members/${memberId}`;

    try {
      const response = await axios.delete(deleteUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status !== 204) {
        throw new Error(
          `Failed to delete member: Unexpected status ${response.status}`
        );
      }
    } catch (error) {
      handleKeycloakError(error, 'delete member from organization');
    }
  }

  async deleteOrganization(organizationId: string): Promise<void> {
    const token = await this.getAdminToken();
    const deleteUrl = `${this.keycloakUrl}/admin/realms/${this.realm}/organizations/${organizationId}`;

    try {
      const response = await axios.delete(deleteUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status !== 204) {
        throw new Error(
          `Failed to delete organization: Unexpected status ${response.status}`
        );
      }
    } catch (error) {
      handleKeycloakError(error, 'delete organization');
    }
  }

  async getOrganizationsByUser( token:string){
    const organizationsOfUserUrl = `${this.keycloakUrl}/realms/${this.realm}/account/organizations`
    try {
      const response = await axios.get(organizationsOfUserUrl ,
      {
        headers : {
          Authorization : `Bearer ${token}` , 
          'Content-Type' : 'application/json'
        }
      })
      return response.data
    }catch(error){
      handleKeycloakError(error, 'get organizations of user ')

    }
  }
}
