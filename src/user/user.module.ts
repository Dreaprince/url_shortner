import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Company } from 'src/company/entities/company.entity';
import { Region } from 'src/region/entities/region.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Company, Region])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
