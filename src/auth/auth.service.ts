import { BadRequestException, Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { LoginDto, SendEmailForOtp, SignUpDto } from './dtos/auth.dto';
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
import { RefreshTokenModel } from './schemas/refresh-token.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    @InjectModel(OtpModel.name) private OtpModel: Model<OtpModel>,
    @InjectModel(RefreshTokenModel.name) private RefreshTokenModel: Model<RefreshTokenModel>,
    private readonly authConfig: ConfigService,
    private readonly jwtService: JwtService,
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

  async generateToken(userId) {
    const accessToken = this.jwtService.sign({userId}, {expiresIn: '1h'})
    const refreshToken = this.jwtService.sign({userId}, {expiresIn: '3d'})

    await this.saveStoreRefreshToken(refreshToken, userId);

    return {
      accessToken,
      refreshToken
    }
  }

  async saveStoreRefreshToken (token: string, userId) {
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + 3)

    await this.RefreshTokenModel.create({token: userId, expiryDate})
  }
}
