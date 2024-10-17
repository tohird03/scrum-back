import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { VideoModule } from './modules/video/video.module';
import { CoursesService } from './modules/courses/courses.service';
import { CoursesModule } from './modules/courses/courses.module';
import { BlogModule } from './modules/blog/blog.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: 'mongodb://localhost:27017/scrum',
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true
    }),
    JwtModule.registerAsync({
      global: true,
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
      }),
    }),
    AuthModule,
    VideoModule,
    CoursesModule,
    BlogModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
