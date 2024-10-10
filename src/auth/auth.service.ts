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
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dtos/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    @InjectModel(OtpModel.name) private OtpModel: Model<OtpModel>,
    private readonly authConfig: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  // Nodemailer config
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

  // POST: Send otp to email
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

  // POST: Otp verify
  async verifyOtp(userData: SignUpDto) {
    const { email, otp: enteredOtp, password } = userData;

    const otpRecord = await this.OtpModel.findOneAndDelete({ email });
    if (!otpRecord || otpRecord.otp !== enteredOtp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    const hashPassword = await bcrypt.hash(password, 10)

    await this.UserModel.create({
      ...userData,
      password: hashPassword,
    });
  }

  // POST: Login user
  async loginUser(loginData: LoginDto) {
    const {email, password} = loginData;

    const findUser = await this.UserModel.findOne({email})

    if(!findUser) {
      throw new UnauthorizedException(ErrorTxt.UserNotFound);
    }

    const passCompare = await bcrypt.compare(password, findUser.password);

    if(!passCompare) {
      throw new UnauthorizedException(ErrorTxt.AuthWrongPass);
    }

    return this.generateToken(findUser?._id)
  }

   // POST: Refresh token
   async refreshToken(token: string) {
    const findUser = await this.UserModel.findOne({refreshToken: token})

    if(!findUser?.refreshToken) {
      throw new UnauthorizedException(ErrorTxt.AuthInvalidRefreshToken)
    }

    return this.generateToken(findUser?._id)
  }

  // Generate token, accessToken and refreshToken
  async generateToken(userId) {
    const accessToken = this.jwtService.sign({userId}, {expiresIn: '1h'})
    const refreshToken = this.jwtService.sign({userId}, {expiresIn: '3d'})

    await this.UserModel.updateOne(
      {_id: userId},
      {$set: {refreshToken}},
      {upsert: true}
    )

    return {
      accessToken,
      refreshToken
    }
  }
}
