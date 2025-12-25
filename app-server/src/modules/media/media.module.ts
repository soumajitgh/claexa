import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PosthogModule } from 'src/libs/posthog/posthog.module';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import {
  createS3BucketFactory,
  createS3ClientFactory,
  S3_BUCKET_TOKEN,
  S3_CLIENT_TOKEN,
} from './providers/s3-client.factory';
import { S3StorageProvider } from './providers/s3.storage.provider';
import { STORAGE_PROVIDER_TOKEN } from './providers/storage.interface';

@Module({
  imports: [
    ConfigModule,
    PosthogModule, // Make sure ConfigModule is global or imported here
  ],
  controllers: [MediaController],
  providers: [
    MediaService,
    {
      provide: S3_CLIENT_TOKEN,
      useFactory: createS3ClientFactory,
      inject: [ConfigService],
    },
    {
      provide: S3_BUCKET_TOKEN,
      useFactory: createS3BucketFactory,
      inject: [ConfigService],
    },
    {
      provide: STORAGE_PROVIDER_TOKEN,
      useFactory: (s3Client, bucket) => new S3StorageProvider(s3Client, bucket),
      inject: [S3_CLIENT_TOKEN, S3_BUCKET_TOKEN],
    },
  ],
  exports: [MediaService, STORAGE_PROVIDER_TOKEN], // Export storage token for other modules
})
export class MediaModule {}
