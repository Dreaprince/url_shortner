import { Controller, Get, Post, Body, Patch, Param, Delete, Request, Query, Req, HttpException, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFilterDto } from './dto/user-filter.dto';
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

  @Get('/fetch-users')
  async getUsers(@Query() userFilterDto: UserFilterDto, @Query('page') page: number, @Query('limit') limit: number) {
    try {
      return await this.userService.getUsers(userFilterDto, page, limit);
    } catch (error) {
      throw error;
    }

  }

  @Get('/me')
  async getUser(@Request() req) {
    try {
      const userId = req.decoded.userId;
      return this.userService.getUser(userId);
    } catch (error) {
      throw error;
    }

  }

  @Patch('/update-users')
  async updateUser(@Body() updateUserDto: UpdateUserDto) {
    try {
      return this.userService.updateUser(updateUserDto);
    } catch (error) {
      throw error;
    }
  }

  @Delete('/delete-user/:userId')
  async deleteUser(@Param('userId') userId: string) {
    try {
      return this.userService.deleteUser(userId);
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

  @Post('/forgot-password')
  async forgotPassword(@Body('email') email: string) {
    try {
      return await this.userService.forgotPassword(email);
    } catch (error) {
      throw error;
    }
  }
}
