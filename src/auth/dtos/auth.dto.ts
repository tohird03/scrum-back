import { IsEmail, IsEmpty, IsInt, IsString, Length, Matches, MinLength } from "class-validator";

export class SendEmailForOtp {
  @IsEmail()
  email: string;
}

export class SignUpDto {
  @IsString()
  firstName: string

  @IsString()
  lastName: string

  @IsEmail()
  email: string

  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[0-9])/, {message: 'Password must contain at least one number'})
  password: string

  @IsInt()
  otp: number;
}
