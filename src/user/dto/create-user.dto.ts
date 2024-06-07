import { IsNotEmpty, IsEmail, IsPhoneNumber, Length } from 'class-validator';

export class CreateUserDto {

  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

}
