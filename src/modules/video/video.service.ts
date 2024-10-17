import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Video } from './schemas/video.schema';

@Injectable()
export class VideoService {
  constructor(@InjectModel(Video.name) private videoModel: Model<Video>) {}

  async uploadVideo(
    file: {
      originalname: string;
      buffer: Buffer;
      mimetype: string;
    },
    title: string,
    description: string
  ) {
    try {
      const video = new this.videoModel({
        title,
        description,
        contentType: file.mimetype,
      });

      await video.save();
      return "Video successfully uploaded";
    } catch (error) {
      throw new InternalServerErrorException('Error uploading video: ' + error.message);
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
