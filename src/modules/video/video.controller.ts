import { Body, Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors, Headers, NotFoundException } from '@nestjs/common';
import { VideoService } from './video.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { Readable } from 'stream';

@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) { }

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

    const videoBuffer = video?.videoBuffer;
    if (!videoBuffer) {
      throw new NotFoundException('Video buffer not found');
    }

    const videoSize = videoBuffer.length;

    // Range so'rovini qabul qilish
    const CHUNK_SIZE = 10 ** 6; // 1MB
    let start = 0;
    let end = Math.min(CHUNK_SIZE - 1, videoSize - 1);

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      start = parseInt(parts[0], 10);
      end = parts[1] ? parseInt(parts[1], 10) : Math.min(start + CHUNK_SIZE - 1, videoSize - 1);
    }

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${videoSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': end - start + 1,
      'Content-Type': video.contentType,
    });


    // Bufferdan oqim yaratish
    const stream = new Readable();
    stream.push(videoBuffer.slice(start, end + 1));
    stream.push(null); // Oqim tugadi

    stream.pipe(res);
  }
}
