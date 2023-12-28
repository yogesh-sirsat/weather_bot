import { Module } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [WeatherService],
  exports: [WeatherService],
  controllers: [WeatherController],
})
export class WeatherModule {}
