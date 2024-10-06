import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';

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
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
