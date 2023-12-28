import { Injectable, Inject } from '@nestjs/common';
import axios from 'axios';
import Bottleneck from 'bottleneck';
import NodeCache = require('node-cache');
import { Db } from 'mongodb';

@Injectable()
export class WeatherService {
  private readonly limiter: Bottleneck;
  private readonly cache: NodeCache;
  private baseUrl = 'https://api.openweathermap.org/data/2.5/weather';

  constructor(
    @Inject('DATABASE_CONNECTION')
    private db: Db,
  ) {
    this.limiter = new Bottleneck({
      // 60 requests per minute, openweathermap api limit
      minTime: (1000 * 60) / 60,
    });

    this.cache = new NodeCache({ stdTTL: 60 * 120 }); // Cache for 2 hour
  }

  async getWeatherApiKey(): Promise<string> {
    try {
      const response = await this.db.collection('BotConfig').findOne({});
      return response.apiKey;
    } catch (error) {
      throw error;
    }
  }

  async weatherDataToMessage(weatherData: any): Promise<string> {
    const message =
      `Today's weather in ${weatherData.name}, ${weatherData.sys.country}:\n` +
      `Status: ${weatherData.weather[0].main}, ${weatherData.weather[0].description}\n` +
      `Temperature: ${weatherData.main.temp}°C\n` +
      `Feels like: ${weatherData.main.feels_like}°C\n` +
      `Min: ${weatherData.main.temp_min}°C, Max: ${weatherData.main.temp_max}°C\n` +
      `Humidity: ${weatherData.main.humidity}%\n` +
      `Wind: ${weatherData.wind.speed}m/s\n` +
      `Pressure: ${weatherData.main.pressure}hPa`;

    return message;
  }

  async getWeatherByCity(city: string, weatherApiKey: string): Promise<string> {
    try {
      // Check if the weather data for the city is in the cache
      const cachedWeather = this.cache.get(city);
      if (cachedWeather) {
        return cachedWeather as string;
      }
      const response = await this.limiter.schedule(() =>
        axios.get(
          `${this.baseUrl}?q=${city}&appid=${weatherApiKey}&exclude=minutely,hourly,daily,alerts&units=metric`,
        ),
      );
      const weatherMessage = await this.weatherDataToMessage(response.data);
      this.cache.set(city, weatherMessage);
      return weatherMessage;
    } catch (error) {
      throw error;
    }
  }

  async updateWeatherApiKey(apiKey: string): Promise<any> {
    try {
      const collection = this.db.collection('BotConfig');
      const config = await collection.findOne({});
      if (config) {
        return await collection.updateOne({}, { $set: { apiKey: apiKey } });
      } else {
        return await collection.insertOne({ apiKey: apiKey });
      }
    } catch (error) {
      throw error;
    }
  }
}
