import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { SignUpDto } from './dtos/auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { Model } from 'mongoose';
import { ErrorTxt } from 'src/constants/error.txt';
import * as bcrypt from 'bcrypt'
import * as nodemailer from 'nodemailer';
import { randomInt } from 'crypto';

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: 'tohirjondoniyorov748@gmail.com',
//     pass: '2003tohir',
//   },
// });

let otpStore = [];

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private UserModel: Model<User>) {}

  async signUp(signUpData: SignUpDto) {
    const {email, password} = signUpData;

    const findUseEmail = await this.UserModel.findOne({email})

    if(findUseEmail) {
      throw new BadRequestException(ErrorTxt.UserAlreadyExit)
    }

    // const otp = randomInt(100000, 999999); // 6 xonali OTP
    // await transporter.sendMail({
    //   from: 'tohirjondoniyorov748@gmail.com',
    //   to: email,
    //   subject: 'Your OTP Code',
    //   text: `Your OTP code is ${otp}`,
    // });

    const hashPass = await bcrypt.hash(password, 10)

    await this.UserModel.create({
      ...signUpData,
      password: hashPass
    })

    return '200'
  }
}
