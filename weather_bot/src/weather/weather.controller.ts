import { Controller } from '@nestjs/common';
import { Put, Body } from '@nestjs/common';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private weatherService: WeatherService) {}

  @Put('/api-key')
  async updateWeatherApiKey(@Body() body: { apiKey: string }) {
    const apiKey = body.apiKey;
    return await this.weatherService.updateWeatherApiKey(apiKey);
  }
}
