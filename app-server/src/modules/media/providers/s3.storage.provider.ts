import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { S3_BUCKET_TOKEN, S3_CLIENT_TOKEN } from './s3-client.factory';
import { StorageProviderInterface, UploadResult } from './storage.interface';

@Injectable()
export class S3StorageProvider implements StorageProviderInterface {
  private readonly logger = new Logger(S3StorageProvider.name);

  constructor(
    @Inject(S3_CLIENT_TOKEN) private readonly client: S3Client,
    @Inject(S3_BUCKET_TOKEN) private readonly bucket: string,
  ) {}

  async upload(
    buffer: Buffer,
    mimetype: string,
    key: string,
  ): Promise<UploadResult> {
    this.logger.debug(
      `Uploading object to S3: key=${key}, contentType=${mimetype}, size=${buffer?.byteLength ?? 0}`,
    );
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
      });
      await this.client.send(command);
      this.logger.debug(`Upload successful: key=${key}`);
      return { key };
    } catch (error) {
      this.logger.error(
        `Upload failed: key=${key}`,
        (error as any)?.stack ?? String(error),
      );
      throw error;
    }
  }

  async download(key: string): Promise<Buffer> {
    this.logger.debug(`Downloading object from S3: key=${key}`);
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      const response = await this.client.send(command);
      const bytes = await response.Body.transformToByteArray();
      const buffer = Buffer.from(bytes);
      this.logger.debug(
        `Download successful: key=${key}, size=${buffer.byteLength}`,
      );
      return buffer;
    } catch (error) {
      this.logger.error(
        `Download failed: key=${key}`,
        (error as any)?.stack ?? String(error),
      );
      throw error;
    }
  }

  async getUploadUrl(key: string, mimetype: string): Promise<string> {
    this.logger.debug(
      `Generating upload URL: key=${key}, contentType=${mimetype}`,
    );
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: mimetype,
      });
      const url = await getSignedUrl(this.client, command, { expiresIn: 3600 });
      this.logger.debug(`Generated upload URL: key=${key}`);
      return url;
    } catch (error) {
      this.logger.error(
        `Failed to generate upload URL: key=${key}`,
        (error as any)?.stack ?? String(error),
      );
      throw error;
    }
  }

  async getDownloadUrl(key: string): Promise<string> {
    this.logger.debug(`Generating download URL: key=${key}`);
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      const url = await getSignedUrl(this.client, command, { expiresIn: 3600 });
      this.logger.debug(`Generated download URL: key=${key}`);
      return url;
    } catch (error) {
      this.logger.error(
        `Failed to generate download URL: key=${key}`,
        (error as any)?.stack ?? String(error),
      );
      throw error;
    }
  }

  async deleteObject(key: string): Promise<void> {
    this.logger.debug(`Deleting object from S3: key=${key}`);
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      await this.client.send(command);
      this.logger.debug(`Deleted object: key=${key}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete object: key=${key}`,
        (error as any)?.stack ?? String(error),
      );
      throw error;
    }
  }
}
