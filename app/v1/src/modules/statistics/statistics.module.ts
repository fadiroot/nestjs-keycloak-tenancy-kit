import { Module } from "@nestjs/common";
import { StatisticsService } from "./statistics.service";
import { StatisticsController } from "./statistics.controller";
import { StatisticsRepository } from "./statistics.repository";

@Module({
    imports: [], 
    providers: [StatisticsService , StatisticsRepository],
    controllers: [StatisticsController]
})
export class StatisticsModule {}
