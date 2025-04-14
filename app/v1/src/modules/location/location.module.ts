import { Module } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { LocationRepository } from './location.repository';
import { UserModule } from '../user/user.module';

@Module({
  imports: [ UserModule],
  controllers: [LocationController],
  providers: [LocationService, LocationRepository],
  exports:[LocationService]
})
export class LocationModule {}
