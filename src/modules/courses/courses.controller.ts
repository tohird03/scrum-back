import { Body, Controller, Delete, Get, Param, Patch, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CourseDto } from './dtos/courses.dto';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  // GET All courses
  @Get()
  @UsePipes(new ValidationPipe())
  async getCourses() {
    return this.coursesService.getCourses()
  }

  // Add new course
  @Post()
  @UsePipes(new ValidationPipe())
  async addNewCourse(@Body() newCourseDto: CourseDto
) {
    return this.coursesService.addCourse(newCourseDto)
  }

  // Delete course
  @Delete(":courseId")
  @UsePipes(new ValidationPipe())
  async deleteCourse(@Param('courseId') courseId: string) {
    return this.coursesService.deleteCourse(courseId)
  }

  // Update course
  @Patch(":courseId")
  @UsePipes(new ValidationPipe())
  async updateCourse(
    @Param('courseId') courseId: string,
    @Body() updateCourseData: CourseDto
  ) {
    return this.coursesService.updateCourse(courseId, updateCourseData)
  }
}
