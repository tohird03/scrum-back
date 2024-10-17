import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Video } from './schemas/video.schema';
import path from 'path';
import * as fs from 'fs';

@Injectable()
export class VideoService {
  constructor(@InjectModel(Video.name) private videoModel: Model<Video>) {}

  async uploadVideo(
    file: {
      originalname: any;
      buffer: Buffer;
      mimetype: string
    },
    title: string,
    description: string
  ) {
    try {
      const videoFileName = `${Date.now()}-${file.originalname}`;
      const videoPath = path.resolve('videos', videoFileName);

      const video = new this.videoModel({
        title,
        description,
        contentType: file.mimetype,
        videoBuffer: file.buffer,
        url: videoPath,
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

  async findVideoById(id: string): Promise<Video> {
    const video = await this.videoModel.findById(id).exec();
    if (!video) {
      throw new NotFoundException('Video not found');
    }
    return video;
  }
}
