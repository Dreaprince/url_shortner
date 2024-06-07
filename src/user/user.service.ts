import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository, LessThan } from 'typeorm';
import { generateId, hashPassword, makeid } from 'src/util/utility';
import { sign } from 'jsonwebtoken';
import { LoginDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { ChangePasswordDto } from './dto/change-password.dto';
import { config as dotenvConfig } from 'dotenv';
dotenvConfig();

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async validatePassword(plainPassword: string, hashedPassword: string) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  async updateAccessToken(userId: string, accessToken: string): Promise<void> {
    await this.userRepository.update({ userId }, { accessToken });
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    await this.userRepository.update({ userId }, { password: newPassword });
  }

  async signup(createUserDto: CreateUserDto) {
    try {

      const { email, password } = createUserDto

      // Check if email already exists
      const existingEmail = await this.userRepository.findOneBy({ email });
      if (existingEmail) {
        throw new ConflictException('Email already exists.');
      }

      const hashedPassword = await hashPassword(password);
      const userId = generateId(6);

      const accessToken = sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      const newUser = new User();
      newUser.email = email;
      newUser.password = hashedPassword;
      newUser.accessToken = accessToken;

      // Save the new user entity to the database
      await this.userRepository.save(newUser);

      newUser.password = password;
      const userData = { ...newUser };

      // Remove sensitive data from the response
      delete userData.password;

      return {
        statusCode: "00",
        message: "Sign-up successful",
        data: userData
      };
    } catch (error) {
      console.log("Error occurred while signing up user: ", error);
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;
    let company: any;

    try {
      const user = await this.userRepository.findOneBy({ email: username });
      if (!user) {
        throw new BadRequestException("Incorrect Username/Password");
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        throw new BadRequestException("Incorrect Username/Password");
      }

      const accessToken = sign(
        {
          userId: user.userId,
          email: user.email,
          passwordReset: user.passwordReset
        },
        // process.env.JWT_SECRET,
        "wb5Bx7U8bIKefg4PWBcNUoxibGFk92QY",
        {
          expiresIn: "1d"
        }
      );

      await this.updateAccessToken(user.userId, accessToken);

      return {
        // status: true,
        // code: "00",
        statusCode: '00',
        message: "Login Successful",
        data: {
          userId: user.userId,
          email: user.email,
          token: accessToken,
          passwordReset: user.passwordReset
        }
      };
    } catch (error) {
      console.error("Error occurred while logging in user: ", error);
      //throw new Error("Incorrect Username/Password");
      throw new BadRequestException("Incorrect Username/Password");
    }
  }

  async changePassword(changePasswordDto: ChangePasswordDto) {
    const { userId, oldPassword, newPassword } = changePasswordDto;

    try {
      const user = await this.userRepository.findOneBy({ userId });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const validPassword = await this.validatePassword(oldPassword, user.password);
      if (!validPassword) {
        throw new BadRequestException('Old password incorrect');
      }

      const hashedPassword = await hashPassword(newPassword);

      await this.updatePassword(userId, hashedPassword);

      return {
        // status: true,
        // code: "00",
        statusCode: "00",
        message: "Password Changed Successfully",
        data: {
          email: user.email,
        }
      };
    } catch (error) {
      console.error("Error occurred while changing password: ", error);
      throw error;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<any> {
    try {

      const currentDate = new Date(); // Get the current date

      // Find the user with the given token
      const user = await this.userRepository.findOneBy({
        passwordResetToken: token,
        passwordResetExpires: LessThan(currentDate)
      });

      // Check if the user exists and the token is valid
      if (!user) {
        throw new NotFoundException('Token has expired or is invalid');
      }

      // Hash the new password
      const hashedPassword = await hashPassword(newPassword);

      // Reset password and update token details
      await this.userRepository.update(
        { userId: user.userId },
        {
          password: hashedPassword,
          passwordReset: false,
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      );

      // Fetch the updated user details
      const updatedUser = await this.userRepository.findOneBy({ userId: user.userId });

      return {
        // status: true,
        // code: '00',
        statusCode: "00",
        message: 'Password Reset Successful',
        data: {
          userId: updatedUser.userId,
          email: updatedUser.email,
          passwordReset: updatedUser.passwordReset,
        },
      };
    } catch (error) {
      console.error('Error occurred while resetting password:', error);
      throw error;
    }
  }


}
