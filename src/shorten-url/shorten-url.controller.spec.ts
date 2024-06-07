import { Test, TestingModule } from '@nestjs/testing';
import { ShortenUrlController } from './shorten-url.controller';
import { ShortenUrlService } from './shorten-url.service';


describe('UserController', () => {
  let controller: ShortenUrlController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShortenUrlController],
      providers: [ShortenUrlService],
    }).compile();

    controller = module.get<ShortenUrlController>(ShortenUrlController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
