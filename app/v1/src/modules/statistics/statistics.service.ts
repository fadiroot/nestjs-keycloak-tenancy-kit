import { Injectable, BadRequestException } from "@nestjs/common";
import { UserService } from "../user/user.service";
import { DatabaseException } from "../../common/exceptions/application.exceptions";
import { entitiesTablesAndColumnsNames } from "./enums/entityEnum";
import { StatisticsRepository } from "./statistics.repository";
import { I18nService } from "nestjs-i18n/dist/services/i18n.service";


@Injectable()
export class StatisticsService {
    constructor(
        private readonly statisticsRepository: StatisticsRepository,
        private readonly i18n: I18nService,

      
    ){}
    
   



  async statisticsOfUsers(entity: string) {
    const entityConfig = entitiesTablesAndColumnsNames.find(
      (element) => element.entity === entity
    );
    const { table, column } = entityConfig;
    try {
      const data = await this.statisticsRepository.statisticsOfUsers(table, column);
      return data;
    } catch (error: any) {
      throw new DatabaseException(this.i18n, 'count', 'users', error);
    }
  }
    
      
}