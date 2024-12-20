import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TelegramApiModule } from './telegram-api/telegram-api.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TelegramApiModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
