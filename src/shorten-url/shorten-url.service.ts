import { Injectable} from '@nestjs/common';
import { CreateUrlDto,} from './dto/create-url.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository} from 'typeorm';
import { config as dotenvConfig } from 'dotenv';
import { ShortenUrl } from './entities/shorten-url.entity';
dotenvConfig();

@Injectable()
export class ShortenUrlService {
  constructor(
    @InjectRepository(ShortenUrl)
    private readonly shortUrlRepository: Repository<ShortenUrl>,
  ) { }

  async create(createUrlDto: CreateUrlDto) {
    try {

      const newShorten = await this.shortUrlRepository.save(createUrlDto);

      // Return response   
      return {
        statusCode: "00",
        message: "Created  successful",
        data: newShorten
      }

    } catch (error) {
      console.log("Error occurred while creating Shorten url: ", error);
      throw error;
    }
  }

  async findAll() {
    try {
      const urls = await this.shortUrlRepository.find();
       return {
        statusCode: "00",
        message: 'fetch urls successfully',
        data: urls
      }
    } catch (error) {
      console.log("Error occurred while finding url: ", error);
      throw error;
    }
  }


}
