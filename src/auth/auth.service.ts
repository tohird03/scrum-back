import { BadRequestException, Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { SendEmailForOtp, SignUpDto } from './dtos/auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { ErrorTxt } from 'src/constants/error.txt';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { randomInt } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { OtpModel } from './schemas/otp.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    @InjectModel(OtpModel.name) private OtpModel: Model<OtpModel>,
    private readonly authConfig: ConfigService,
  ) {}

  mailTransport() {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.authConfig.get<string>('MAIL_SENDER_USER'),
        pass: this.authConfig.get<string>('MAIL_SENDER_PASS'),
      },
    });

    return transporter;
  }

  async sendEmailForOtp(signUpData: SendEmailForOtp) {
    const { email } = signUpData;

    const findUseEmail = await this.UserModel.findOne({ email });

    if (findUseEmail) {
      throw new BadRequestException(ErrorTxt.UserAlreadyExit);
    }

    const otp = randomInt(100000, 999999);
    const transporter = this.mailTransport();

    const sendOtpOptions = {
      from: this.authConfig.get<string>('MAIL_SENDER_USER'),
      to: email,
      subject: 'Verification code',
      text: `Your OTP code is ${otp}`,
    };

    await this.OtpModel.create({
      email,
      otp,
      createdAt: new Date(),
    });

    try {
      await transporter.sendMail(sendOtpOptions);
    } catch (error) {
      throw new InternalServerErrorException('Failed to send OTP');
    }
  }

  async verifyOtp(userData: SignUpDto) {
    const { email, otp: enteredOtp, password } = userData;

    const otpRecord = await this.OtpModel.findOne({ email });
    if (!otpRecord || otpRecord.otp !== enteredOtp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    const hashPassword = await bcrypt.hash(password, 10)

    await this.UserModel.create({
      ...userData,
      password: hashPassword,
    });
    await this.OtpModel.deleteOne({email});
  }
}
