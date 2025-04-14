import {
    Controller,
    Get,
    Param,
    HttpCode,
    HttpStatus
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBearerAuth,
    ApiSecurity
} from '@nestjs/swagger';
import { SocialLinkTypesService } from '../services/socialLinkTypes.service';
import { socialLinkTypes } from '../interfaces/socialLinkTypes';
import { SOCIAL_LINK_TYPES_PATH } from '../user.constants';

@ApiTags(SOCIAL_LINK_TYPES_PATH)
@ApiBearerAuth('access-token')
@ApiSecurity('organization-kc-id')
@Controller(SOCIAL_LINK_TYPES_PATH)
export class SocialLinkTypesController {
    constructor(
        private readonly socialLinkTypesService: SocialLinkTypesService
    ) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get all social link types',
        description: 'Retrieves a list of all available social link types'
    })
    @ApiResponse({
        status: 200,
        description: 'Successfully retrieved social link types',
    })
    async getAllSocialLinkTypes(): Promise<socialLinkTypes.selectable[]> {
        return this.socialLinkTypesService.getAllSocialLinkTypes();
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get social link type by ID',
        description: 'Retrieves a specific social link type by its unique identifier'
    })
    @ApiParam({
        name: 'id',
        description: 'Unique identifier of the social link type',
        type: 'string'
    })
    @ApiResponse({
        status: 200,
        description: 'Successfully retrieved social link type',
    })
    @ApiResponse({
        status: 404,
        description: 'Social link type not found'
    })
    async getSocialLinkTypeById(
        @Param('id') id: string
    ): Promise<socialLinkTypes.selectable | null> {
        return this.socialLinkTypesService.getSocialLinkTypeById(id);
    }
} 