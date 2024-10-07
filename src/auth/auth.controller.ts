import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { LoginDto, SendEmailForOtp, SignUpDto } from './dtos/auth.dto';
import { AuthService } from './auth.service';

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
}
