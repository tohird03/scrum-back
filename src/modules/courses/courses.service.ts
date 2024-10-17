import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { Course } from './schema/course.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CourseDto } from './dtos/courses.dto';

@Injectable()
export class CoursesService {
  constructor(@InjectModel(Course.name) private CoursesModel: Model<Course>) {}

  // Get all courses
  async getCourses() {
    try {
      return await this.CoursesModel.find();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch courses');
    }
  }

  // Add new course
  async addCourse(courseCreateData: CourseDto) {
    try {
      await this.CoursesModel.create(courseCreateData);
      return 'Successfully created course';
    } catch (error) {
      throw new InternalServerErrorException('Failed to create course');
    }
  }

  // Delete course
  async deleteCourse(courseId: string) {
    try {
      const deletedCourse = await this.CoursesModel.findByIdAndDelete(courseId);
      if (!deletedCourse) {
        throw new NotFoundException('Course not found');
      }
      return 'Successfully deleted course';
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete course');
    }
  }

  // Update course
  async updateCourse(courseId: string, updateCourseData: CourseDto) {
    try {
      const updatedCourse = await this.CoursesModel.findByIdAndUpdate(
        courseId,
        updateCourseData,
        { new: true }
      );
      if (!updatedCourse) {
        throw new NotFoundException('Course not found');
      }
      return updatedCourse;
    } catch (error) {
      throw new InternalServerErrorException('Failed to update course');
    }
  }
}
