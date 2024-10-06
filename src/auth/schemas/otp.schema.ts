import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class OtpModel extends Document {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  otp: number;

  @Prop({ default: Date.now, expires: '3m' })
  createdAt: Date;
}

export const OtpSchema = SchemaFactory.createForClass(OtpModel)
