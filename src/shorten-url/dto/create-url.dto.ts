import { IsNotEmpty, IsEmail, IsPhoneNumber, Length } from 'class-validator';

export class CreateUrlDto {

  @IsEmail()
  name: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  website: string;

}
