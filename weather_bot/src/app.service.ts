import { Injectable, Inject } from '@nestjs/common';
import { Ctx, Hears, Help, InjectBot, Start, Update } from 'nestjs-telegraf';
import { Context, Markup, Telegraf } from 'telegraf';
import { WeatherService } from './weather/weather.service';
import { UserService } from './user/user.service';
import { User } from './user/user.interface';
import Bottleneck from 'bottleneck';
import * as cron from 'node-cron';
import { Db } from 'mongodb';

@Update()
@Injectable()
export class AppService {
  private readonly limiter: Bottleneck;

  constructor(
    @Inject('DATABASE_CONNECTION')
    private db: Db,
    @InjectBot() private readonly bot: Telegraf,
    private readonly weatherService: WeatherService,
    private userService: UserService,
  ) {
    this.limiter = new Bottleneck({
      // 30 requests per second, telegram bot message limit
      minTime: 1000 / 30,
    });
  }
  getHello(): string {
    return 'Hello World! You are at Weather Bot Server!';
  }

  async getBotConfig() {
    try {
      const response = await this.db.collection('BotConfig').findOne({});
      return response;
    } catch (error) {
      throw error;
    }
  }

  @Start()
  async startCommand(@Ctx() ctx: Context) {
    const firstName = ctx.message.from.first_name;
    await ctx.reply(
      `Hey ${firstName}, Welcome to the Weather Bot!\n\n` +
        `Type /help to see all the commands`,
    );
  }

  @Help()
  async helpCommand(@Ctx() ctx: Context) {
    await ctx.reply(
      'This is Weather Bot, I give daily weather updates!\n\n' +
        'Commands:\n' +
        '/subscribe - Subscribe for daily weather updates\n' +
        '/unsubscribe - Unsubscribe from daily weather updates\n' +
        '/city <city> - Set city for weather updates\n',
    );
  }

  @Hears('/subscribe')
  async hearsSubscribe(@Ctx() ctx: Context) {
    try {
      const user: User = {
        id: ctx.message.from.id,
        username: ctx.message.from.username || '',
        firstName: ctx.message.from.first_name,
        lastName: ctx.message.from.last_name || '',
      };
      const response = await this.userService.isUserExist(user.id);
      if (response) {
        await ctx.reply('You are already subscribed.');
        return;
      }
      await this.userService.createUser(user);
      await ctx.reply(
        'Subscribed successfully. \n\n' +
          `Set city for weather updates using /city <city>.`,
      );
    } catch (error) {
      console.log(error);
      await ctx.reply('Error subscribing. Please try again.');
    }
  }

  @Hears('/unsubscribe')
  async hearsUnsubscribe(@Ctx() ctx: Context) {
    try {
      const response = await this.userService.isUserExist(ctx.message.from.id);
      if (!response) {
        await ctx.reply('You are not subscribed.');
        return;
      }
      await this.userService.deleteUser(ctx.message.from.id);
      await ctx.reply('Unsubscribed successfully.');
    } catch (error) {
      console.log(error.message);
      await ctx.reply('Error unsubscribing. Please try again.');
    }
  }

  @Hears(/\/city (.+)/)
  async hearsCity(@Ctx() ctx: Context) {
    if ('text' in ctx.message) {
      const cityInput = ctx.message.text.split(' ')[1];
      const city = cityInput.charAt(0).toUpperCase() + cityInput.slice(1);
      try {
        const response = await this.userService.isUserExist(
          ctx.message.from.id,
        );
        if (!response) {
          await ctx.reply(
            'You are not subscribed. Please subscribe using /subscribe.',
          );
          return;
        }
        const weatherApiKey = await this.weatherService.getWeatherApiKey();
        const weather = await this.weatherService.getWeatherByCity(
          city,
          weatherApiKey,
        );
        await this.userService.updateUser(ctx.message.from.id, {
          city: city,
        });
        await ctx.reply(
          'City received. You will receive daily weather updates for this city. \n\n' +
            weather,
          Markup.removeKeyboard(),
        );
      } catch (error) {
        await ctx.reply(`Weather not found for ${city}.`);
      }
    } else {
      await ctx.reply('Please enter a valid city.');
    }
  }

  @Hears(/.*/)
  async hearsInvalid(@Ctx() ctx: Context) {
    await ctx.reply(
      'Invalid command. Please enter a valid command.\n\nUse /help to see all the commands.',
      Markup.removeKeyboard(),
    );
  }

  onModuleInit() {
    // Schedule the task to run every day at 12 PM
    cron.schedule('0 12 * * *', () => this.sendDailyWeatherUpdates());
  }

  async sendDailyWeatherUpdates() {
    try {
      const users = await this.userService.getAllUsers();
      const weatherApiKey = await this.weatherService.getWeatherApiKey();
      const sendMessages = users.map(async (user: User) => {
        const weather = await this.weatherService.getWeatherByCity(
          user.city,
          weatherApiKey,
        );

        this.limiter.schedule(() =>
          this.bot.telegram.sendMessage(user.id, weather).catch((error) => {
            console.error(`Failed to send message to user ${user.id}:`, error);
            // Return a resolved promise to prevent Promise.all from rejecting
            return Promise.resolve();
          }),
        );
      });
      await Promise.all(sendMessages);
    } catch (error) {
      console.log('Error while sending daily weather updates:', error);
    }
  }
}
