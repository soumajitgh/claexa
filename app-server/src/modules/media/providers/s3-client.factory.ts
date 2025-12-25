import { S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

export const S3_CLIENT_TOKEN = 'S3_CLIENT_TOKEN';
export const S3_BUCKET_TOKEN = 'S3_BUCKET_TOKEN';

export const createS3ClientFactory = (
  configService: ConfigService,
): S3Client => {
  const nodeEnv = configService.get('NODE_ENV');

  if (nodeEnv === 'development') {
    // S3 Ninja configuration for development
    return new S3Client({
      region: configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
      },
      endpoint: 'http://localhost:9444',
      forcePathStyle: true, // Required for S3 Ninja
    });
  } else {
    // AWS S3 configuration for production/staging
    return new S3Client({
      region: configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }
};

export const createS3BucketFactory = (configService: ConfigService): string => {
  return configService.get('AWS_S3_BUCKET_NAME');
};
