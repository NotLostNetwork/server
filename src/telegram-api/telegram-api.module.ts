import { Module } from '@nestjs/common';
import { TelegramApiService } from './telegram-api.service';
import { TelegramApiController } from './telegram-api.controller';

@Module({
  controllers: [TelegramApiController],
  providers: [TelegramApiService],
})
export class TelegramApiModule {}
