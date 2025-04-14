import { Inject, Injectable } from "@nestjs/common";
import { JobTitleRepository } from "../repositories/jobTitle.repository";
import { jobTitle } from "../interfaces/jobTitle.interface"; // Adjust path as necessary
import { JobTitleDto } from "../dto/createJobTitle.dto";
@Injectable()
export class JobTitleService {
    constructor(
        private readonly jobTitleRepository: JobTitleRepository,
    ) {}

    async getAllJobTitles() {
        return await this.jobTitleRepository.getAllJobTitles();
    }

    async createJobTitle(jobTitleDto: JobTitleDto) {
        try {
            const existingTitle = await this.jobTitleRepository.findByTitle(jobTitleDto.jobTitle);
            if (existingTitle) {
                throw new Error('Job title already exists');
            }

            return await this.jobTitleRepository.createJobTitle(jobTitleDto);
        } catch (error) {
            throw new Error(`Failed to create job title: ${error}`);
        }
    }

    async updateJobTitle(id: string, jobTitleDto: JobTitleDto) {
        try {
            const existingTitle = await this.jobTitleRepository.findByTitle(jobTitleDto.jobTitle);
            if (!existingTitle) {
                throw new Error('This title is already used by another record');
            }

            const updatedTitle = await this.jobTitleRepository.updateJobTitle(id, jobTitleDto);
            if (!updatedTitle) {
                throw new Error('Job title not found');
            }

            return updatedTitle;
        } catch (error) {
            throw new Error(`Failed to update job title: ${error}`);
        }
    }
}