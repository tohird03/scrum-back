import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Video } from './schemas/video.schema';

@Injectable()
export class VideoService {
  constructor(@InjectModel(Video.name) private videoModel: Model<Video>) {}

  async uploadVideo(file: { buffer: Buffer; mimetype: string }, title: string, description: string) {
    try {
      const video = new this.videoModel({
        title,
        description,
        contentType: file.mimetype,
        videoBuffer: file.buffer,
      });

      await video.save()
      return "Success uploaded";
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Video model not found');
      } else {
        throw new InternalServerErrorException('Error occurred while uploading video');
      }
    }
  }
}
