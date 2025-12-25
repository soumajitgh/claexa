import {
  Media,
  MediaOriginType,
  MediaStatus,
  UploadStatus,
  User,
} from '@entities';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PosthogService } from 'src/libs/posthog/posthog.service';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import {
  STORAGE_PROVIDER_TOKEN,
  StorageProviderInterface,
  UploadResult,
} from './providers/storage.interface';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    @Inject(STORAGE_PROVIDER_TOKEN)
    private readonly storageProvider: StorageProviderInterface,
    private readonly posthog: PosthogService,
  ) {}

  /**
   * Generates a pre-signed URL for uploading and creates a corresponding media record in the database.
   */
  async getPresignedUrlForUpload(params: {
    originalName: string;
    mimetype: string;
    user: User;
    originType: MediaOriginType;
  }): Promise<{ url: string; record: Media }> {
    const { originalName, mimetype, user, originType } = params;
    const key = `${originType}/${user.id}/${uuidv4()}-${originalName}`;

    const media = this.mediaRepository.create({
      key,
      originalName,
      mimetype,
      uploadedBy: user,
      originType,
      uploadStatus: UploadStatus.PENDING,
      size: 0, // Will be 0 until upload is confirmed by client
    });
    await this.mediaRepository.save(media);

    const url = await this.storageProvider.getUploadUrl(key, mimetype);
    // Capture event for presigned upload URL creation
    await this.posthog.captureIdentifiedEvent(
      user.email,
      'media_presign_upload_created',
      {
        media_id: media.id,
        origin_type: originType,
        mimetype,
      },
    );
    return {
      url,
      record: media,
    };
  }

  /**
   * Uploads a file buffer and, if specified, creates a media record.
   */
  async uploadFile(params: {
    buffer: Buffer;
    originalName: string;
    mimetype: string;
    user: User;
    originType: MediaOriginType;
    options: { createRecord: boolean };
  }): Promise<Media | UploadResult> {
    const { buffer, originalName, mimetype, user, originType, options } =
      params;
    const key = `${originType}/${user.id}/${uuidv4()}-${originalName}`;
    const uploadResult = await this.storageProvider.upload(
      buffer,
      mimetype,
      key,
    );

    // Capture event for direct upload
    await this.posthog.captureIdentifiedEvent(
      user.email,
      'media_uploaded_direct',
      {
        origin_type: originType,
        mimetype,
        created_record: Boolean(options.createRecord),
      },
    );

    if (options.createRecord) {
      const newMedia = this.mediaRepository.create({
        key: uploadResult.key,
        originalName,
        mimetype,
        size: buffer.length,
        uploadedBy: user,
        originType,
        uploadStatus: UploadStatus.COMPLETED,
      });
      const saved = await this.mediaRepository.save(newMedia);
      await this.posthog.captureIdentifiedEvent(
        user.email,
        'media_record_created',
        {
          media_id: saved.id,
          origin_type: originType,
        },
      );
      return saved;
    }

    return uploadResult;
  }

  /**
   * Gets a pre-signed URL for a media record from the database.
   */
  async getDownloadUrl(mediaId: string): Promise<string> {
    const media = await this.mediaRepository.findOneBy({ id: mediaId });
    if (!media) {
      throw new NotFoundException('Media not found');
    }
    const url = await this.storageProvider.getDownloadUrl(media.key);
    if (media.uploadedBy?.email) {
      await this.posthog.captureIdentifiedEvent(
        media.uploadedBy.email,
        'media_download_url_requested',
        {
          media_id: media.id,
        },
      );
    }
    return url;
  }

  /**
   * Finds a media record by ID.
   */
  async findById(mediaId: string): Promise<Media> {
    const media = await this.mediaRepository.findOne({
      where: { id: mediaId },
      relations: ['uploadedBy'],
    });
    if (!media) {
      throw new NotFoundException('Media not found');
    }
    return media;
  }

  /**
   * Updates the size of a media record after upload confirmation.
   * @deprecated Use completeUpload instead
   */
  async updateMediaSize(mediaId: string, size: number): Promise<Media> {
    const media = await this.findById(mediaId);
    media.size = size;
    return this.mediaRepository.save(media);
  }

  /**
   * Completes the upload by updating both size and upload status in a single transaction.
   */
  async completeUpload(
    mediaId: string,
    size: number,
    uploadStatus: UploadStatus,
  ): Promise<Media> {
    const media = await this.findById(mediaId);
    media.size = size;
    media.uploadStatus = uploadStatus;
    const saved = await this.mediaRepository.save(media);
    if (media.uploadedBy?.email) {
      await this.posthog.captureIdentifiedEvent(
        media.uploadedBy.email,
        'media_upload_completed',
        {
          media_id: saved.id,
          size,
          upload_status: uploadStatus,
        },
      );
    }
    return saved;
  }

  /**
   * Soft deletes a media record by marking its status as DELETED.
   * Throws 404 if the media does not exist or is already deleted.
   */
  async delete(
    mediaId: string,
    options: { permanent?: boolean } = { permanent: false },
  ): Promise<void> {
    const media = await this.mediaRepository.findOneBy({ id: mediaId });
    if (!media) {
      throw new NotFoundException('Media not found');
    }

    if (media.status === MediaStatus.DELETED) {
      throw new NotFoundException('Media not found');
    }

    const shouldPermanentlyDelete = Boolean(options?.permanent);

    if (shouldPermanentlyDelete) {
      await this.storageProvider.deleteObject(media.key);
      await this.mediaRepository.remove(media);
      if (media.uploadedBy?.email) {
        await this.posthog.captureIdentifiedEvent(
          media.uploadedBy.email,
          'media_deleted_permanent',
          {
            media_id: media.id,
          },
        );
      }
      return;
    }

    media.status = MediaStatus.DELETED;
    await this.mediaRepository.save(media);
    if (media.uploadedBy?.email) {
      await this.posthog.captureIdentifiedEvent(
        media.uploadedBy.email,
        'media_deleted_soft',
        {
          media_id: media.id,
        },
      );
    }
  }
}
