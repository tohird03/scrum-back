import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { SignUpDto } from './dtos/auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { Model } from 'mongoose';
import { ErrorTxt } from 'src/constants/error.txt';
import * as bcrypt from 'bcrypt'
import * as nodemailer from 'nodemailer';
import { randomInt } from 'crypto';
import { ConfigService } from '@nestjs/config';

let otpStore = [];

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private UserModel: Model<User>, private readonly authConfig: ConfigService) {}

  mailTransport() {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.authConfig.get<string>('MAIL_SENDER_USER'),
        pass: this.authConfig.get<string>('MAIL_SENDER_PASS'),
      },
   });

    return transporter
  }

  async signUp(signUpData: SignUpDto) {
    const {email, password} = signUpData;

    const findUseEmail = await this.UserModel.findOne({email})

    if(findUseEmail) {
      throw new BadRequestException(ErrorTxt.UserAlreadyExit)
    }

    const otp = randomInt(100000, 999999);
    const transporter = this.mailTransport()
    const options = {
      to: email,
      subject: `Your OTP code is ${otp}`
    }

    try {
      await transporter.sendMail(options)
    } catch (error) {
      throw new Error(error)
    }

    const hashPass = await bcrypt.hash(password, 10)

    await this.UserModel.create({
      ...signUpData,
      password: hashPass
    })

    return '200'
  }
}
