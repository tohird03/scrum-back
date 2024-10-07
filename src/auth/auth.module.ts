import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { OtpModel, OtpSchema } from './schemas/otp.schema';
import { RefreshTokenModel, RefreshTokenSchema } from './schemas/refresh-token.schema';

@Module({
  imports: [
    JwtModule.register({
      secret: '1234',
      signOptions: { expiresIn: '1h' }
    }),
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: OtpModel.name,
        schema: OtpSchema,
      },
      {
        name: RefreshTokenModel.name,
        schema: RefreshTokenSchema,
      },
    ])
  ],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule { }
