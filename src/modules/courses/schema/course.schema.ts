import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class Course extends Document {
  @Prop({required: true, maxlength: 20})
  name: string;

  @Prop({required: true, max: 64})
  description: string

  @Prop({required: true})
  banner: string;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
