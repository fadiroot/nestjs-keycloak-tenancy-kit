import { Injectable } from '@nestjs/common';
import { SocialLinkTypesRepository } from '../repositories/socialLinkTypes.repository';
import { socialLinkTypes } from '../interfaces/socialLinkTypes';

@Injectable()
export class SocialLinkTypesService {
    constructor(
        private readonly socialLinkTypesRepository: SocialLinkTypesRepository
    ) { }

    async getAllSocialLinkTypes(): Promise<socialLinkTypes.selectable[]> {
        return this.socialLinkTypesRepository.findAll();
    }

    async getSocialLinkTypeById(id: string): Promise<socialLinkTypes.selectable | null> {
        return this.socialLinkTypesRepository.findById(id);
    }
} 