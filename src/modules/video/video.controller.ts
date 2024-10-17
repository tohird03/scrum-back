import { Body, Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors, Headers, NotFoundException } from '@nestjs/common';
import { VideoService } from './video.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadVideo(
    @UploadedFile() file: { buffer: Buffer; mimetype: string; originalname: string },
    @Body('title') title: string,
    @Body('description') description: string
  ) {
    return this.videoService.uploadVideo(file, title, description);
  }

  @Get(':id')
  async streamVideo(@Param('id') id: string, @Res() res: Response, @Headers('range') range: string) {
    const video = await this.videoService.findVideoById(id);
    if (!video) {
      throw new NotFoundException('Video not found');
    }

    const videoPath = path.resolve('videos', video.url);
    const videoSize = fs.statSync(videoPath).size;

    // Range so'rovini qabul qilish
    const CHUNK_SIZE = 10 ** 6; // 1MB
    const start = Number(range.replace(/\D/g, ''));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${videoSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': end - start + 1,
      'Content-Type': video.contentType,
    });

    const stream = fs.createReadStream(videoPath, { start, end });
    stream.pipe(res);
  }
}
