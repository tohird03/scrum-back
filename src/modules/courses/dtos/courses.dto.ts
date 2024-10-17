import { IsString, IsUrl, MaxLength } from "class-validator";

export class CourseDto {
  @IsString()
  @MaxLength(20)
  name: string

  @IsString()
  @MaxLength(64)
  description: string

  @IsString()
  @IsUrl()
  banner: string
}
