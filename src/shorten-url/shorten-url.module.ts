import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShortenUrlService } from './shorten-url.service';
import { ShortenUrlController } from './shorten-url.controller';
import { ShortenUrl } from './entities/shorten-url.entity';


@Module({
  imports: [TypeOrmModule.forFeature([ShortenUrl])],
  controllers: [ShortenUrlController],
  providers: [ShortenUrlService],
})
export class ShortenUrlModule {}
