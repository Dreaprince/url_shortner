import { config as dotenvConfig } from 'dotenv';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthMiddleware } from './auth/middleware';
import * as cors from 'cors';
import { AuthModule } from './auth/auth.module';
import { User } from './user/entities/user.entity';
import { ShortenUrl } from './shorten-url/entities/shorten-url.entity';
import { UserModule } from './user/user.module';
import { ShortenUrlModule } from './shorten-url/shorten-url.module';
import { AuditLog } from './audit-log/entities/audit-log.entity';


dotenvConfig();

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [User, ShortenUrl, AuditLog,], 
    synchronize: true
  }),
  UserModule,
  ShortenUrlModule,
  AuthModule
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
    .apply(cors()) // Apply CORS middleware first
    .forRoutes('*');
    consumer
      .apply(AuthMiddleware)
      .exclude('/user/signup')
      .forRoutes('*');
  }
}



