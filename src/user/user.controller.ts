import { Controller, Get, Post, Body, Patch, Param, Delete, Request, Query, Req, HttpException, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post('/signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    try {
      return this.userService.signup(createUserDto);
    } catch (error) {
      throw error;
    }
  }

  @Post('/login')
  async login(@Body() loginDto: LoginDto) {
    try {
      return this.userService.login(loginDto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Post('/change-password')
  async changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    try {
      return this.userService.changePassword(changePasswordDto);
    } catch (error) {
      throw error;
    }
  }


  @Patch('reset-password/:token')//:token/user/reset-password
  async resetPassword(@Param('token') token: string,@Body('password') newPassword: string,) {
    try {
      return this.userService.resetPassword(token, newPassword);
    } catch (error) {
      throw error;
    }
  }

}
