import { Controller, Get, Header, Param, Res } from '@nestjs/common';
import { TelegramApiService } from './telegram-api.service';

@Controller('telegram-api')
export class TelegramApiController {
  constructor(private readonly telegramApiService: TelegramApiService) {}

  @Get('getUserByUsername/:username')
  getUserByUsername(@Param('username') username: string) {
    return this.telegramApiService.getUserByUsername(username);
  }

  @Get('getUserAvatar/:username')
  @Header('Content-Type', 'image/jpeg')
  getUserAvatar(
    @Param('username') username: string,
  ) {
    return this.telegramApiService.getUserAvatar(username);
  }
}
