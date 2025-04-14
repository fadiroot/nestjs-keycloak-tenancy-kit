import { Controller, Get, Post, Body, Put, Param } from "@nestjs/common";
import { ApiTags, ApiResponse, ApiOperation, ApiBearerAuth, ApiSecurity } from "@nestjs/swagger";
import { JobTitleService } from "../services/jobTitle.service";
import { JobTitleDto } from "../dto/createJobTitle.dto";
import { jobTitle } from "../interfaces/jobTitle.interface";
import { JOB_TITLE_PATH } from "../user.constants";

@ApiTags(JOB_TITLE_PATH)
@ApiBearerAuth('access-token')
@ApiSecurity('organization-kc-id')
@Controller(JOB_TITLE_PATH)
export class JobTitleController {
    constructor(private readonly jobTitleService: JobTitleService) {}

    @Get()
    @ApiOperation({ summary: 'Get all job titles' })
    @ApiResponse({
        status: 200,
        description: 'List of all job titles',
        type: [JobTitleDto],
    })
    async getAllJobTitles(): Promise<jobTitle.selectable[]> {
        return this.jobTitleService.getAllJobTitles();
    }

    @Post()
    @ApiOperation({ summary: 'Create a new job title' })
    @ApiResponse({
        status: 201,
        description: 'The newly created job title',
        type: JobTitleDto,
    })
    async createJobTitle(@Body() jobTitleDto: JobTitleDto) {
        return await this.jobTitleService.createJobTitle(jobTitleDto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a job title' })
    @ApiResponse({
        status: 200,
        description: 'The updated job title',
        type: JobTitleDto,
    })
    async updateJobTitle(@Param('id') id: string, @Body() jobTitleDto: JobTitleDto) {
        return await this.jobTitleService.updateJobTitle(id, jobTitleDto);
    }
}