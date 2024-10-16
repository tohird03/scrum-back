import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Video extends Document {
  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  contentType: string;

  @Prop({required: true})
  videoBuffer: Buffer;
}

export const VideoSchema = SchemaFactory.createForClass(Video);
