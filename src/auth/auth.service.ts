import { Injectable } from '@nestjs/common';
import { SignUpDto } from './dtos/auth.dto';

@Injectable()
export class AuthService {
  async signUp(signUpDto: SignUpDto) {
    
  }
}
