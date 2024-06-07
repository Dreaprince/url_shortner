import { Controller, Get, Post, Body} from '@nestjs/common';
import { ShortenUrlService} from './shorten-url.service';
import { CreateUrlDto } from './dto/create-url.dto';



@Controller('shorten-url')
export class ShortenUrlController {
  constructor(private readonly shortenUrlService: ShortenUrlService) { }

  @Post('/create')
  async signup(@Body() createUrlDto: CreateUrlDto) {
    try {
      return this.shortenUrlService.create(createUrlDto);
    } catch (error) {
      throw error;
    }
  }

  @Get()
  findAll() {
    try {
      return this.shortenUrlService.findAll();
    } catch (error) {
      throw error;
    } 
  }

}
