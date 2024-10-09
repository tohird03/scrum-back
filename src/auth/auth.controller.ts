import { Body, Controller, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import {SendEmailForOtp, SignUpDto } from './dtos/auth.dto';
import { AuthService } from './auth.service';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { LoginDto } from './dtos/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService){}

  // Send OTP
  @Post('send-otp')
  @UsePipes(new ValidationPipe())
  async sendOtp(@Body() sendEmailForOtp: SendEmailForOtp) {
    return this.authService.sendEmailForOtp(sendEmailForOtp)
  }

  // VERIFY OTP AND CREATE USER
  @Post('verify-otp')
  @UsePipes(new ValidationPipe())
  async verifyOtp(@Body() verifyUser: SignUpDto) {
    return this.authService.verifyOtp(verifyUser)
  }

  // /login POST
  @Post('login')
  @UsePipes(new ValidationPipe())
  async login(@Body() loginData: LoginDto) {
    return this.authService.loginUser(loginData)
  }

  // /refresh-token POST
  @Post('refresh-token')
  @UsePipes(new ValidationPipe())
  async refreshTokenI(@Body() refreshTokenData: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenData?.refreshToken)
  }
}
