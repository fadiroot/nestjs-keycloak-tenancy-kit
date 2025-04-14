import { Controller, Get, Param, ParseEnumPipe, HttpStatus } from "@nestjs/common";
import { STATISTICS_PATH } from "./statistics.constants";
import { ApiBearerAuth, ApiSecurity, ApiTags, ApiParam, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { StatisticsService } from "./statistics.service";
import { EntityEnum } from "./enums/entityEnum";
import { I18nService } from "nestjs-i18n";
import { SuccessResponse } from "../../common/utils/response/response.util";
import { HandleErrors } from "../../common/decorators/error-handler.decorator";

@ApiTags(STATISTICS_PATH)
@ApiBearerAuth('access-token')
@ApiSecurity('organization-kc-id')
@Controller(STATISTICS_PATH)
export class StatisticsController {
    constructor (
        private statisticsService: StatisticsService,
        private readonly i18n: I18nService
    ){}

    @Get(':entity')
    @HandleErrors({
        resource: STATISTICS_PATH,
        operation: 'get',
        i18nKey: 'statistics.getStatistics.error.retrievalFailed',
    })
    @ApiOperation({ summary: 'Get statistics by entity' })
    @ApiParam({ 
        name: 'entity', 
        required: true, 
        description: 'The entity to retrieve statistics for',
        enum: EntityEnum
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Statistics retrieved successfully',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid entity',
    })
    async getStatisticsOfEmployeesByEntity(
        @Param('entity', new ParseEnumPipe(EntityEnum)) entity: EntityEnum
    ){  
        
        const statistics = await this.statisticsService.statisticsOfUsers(entity);
        return new SuccessResponse(
            await this.i18n.t('statistics.getStatistics.success'),
            statistics
        );
    }
} 