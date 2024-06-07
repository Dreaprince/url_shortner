import { IsNotEmpty, IsEmail, IsPhoneNumber, Length } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  password: string;

  @IsEmail()
  username: string;


}
