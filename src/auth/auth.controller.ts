import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { SignUpDto } from './dtos/auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService){}

  // /sign-up POST
  @Post('sign-up')
  @UsePipes(new ValidationPipe())
  signUp(@Body() signUpdata: SignUpDto) {
    return 'Salom'
  }


  // /login POST


  // /refresh-token POST
}
