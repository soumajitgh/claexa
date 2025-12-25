import { Media, MediaOriginType, UploadStatus, User } from '@entities';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface Base64ImageData {
  base64_image: string;
  caption?: string;
}

@Injectable()
export class Base64MediaConverter {
  /**
   * Converts base64 image data to Media entity
   * @param base64Data - The base64 image data
   * @param user - The user who owns the media
   * @returns Media - The media entity
   */
  convertBase64ToMedia(base64Data: Base64ImageData, user: User): Media {
    const { base64_image } = base64Data;

    // Extract mime type and data from base64 string
    const matches = base64_image.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      throw new Error(
        'Invalid base64 image format. Expected format: data:image/type;base64,data',
      );
    }

    const [, mimeType, base64String] = matches;

    // Validate mime type
    if (!mimeType.startsWith('image/')) {
      throw new Error(`Invalid mime type: ${mimeType}. Expected image/*`);
    }

    // Decode base64 to get buffer size
    const buffer = Buffer.from(base64String, 'base64');
    const size = buffer.length;

    // Generate unique filename
    const fileExtension = this.getFileExtensionFromMimeType(mimeType);
    const originalName = `ai-generated-${uuidv4()}.${fileExtension}`;
    const key = `${MediaOriginType.GENERATED}/${user.id}/${uuidv4()}-${originalName}`;

    // Create media entity
    const media = new Media();
    media.key = key;
    media.originalName = originalName;
    media.mimetype = mimeType;
    media.size = size;
    media.uploadedBy = user;
    media.originType = MediaOriginType.GENERATED;
    media.uploadStatus = UploadStatus.COMPLETED; // Since we have the data, mark as completed
    // Note: caption is not stored in Media entity, it's only available in Base64ImageData

    return media;
  }

  /**
   * Converts array of base64 image data to Media entities
   * @param base64Images - Array of base64 image data
   * @param user - The user who owns the media
   * @returns Media[] - Array of media entities
   */
  convertBase64ArrayToMedia(
    base64Images: Base64ImageData[],
    user: User,
  ): Media[] {
    return base64Images.map((base64Data) =>
      this.convertBase64ToMedia(base64Data, user),
    );
  }

  /**
   * Gets file extension from mime type
   * @param mimeType - The mime type
   * @returns string - The file extension
   */
  private getFileExtensionFromMimeType(mimeType: string): string {
    const extensionMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/svg+xml': 'svg',
      'image/bmp': 'bmp',
      'image/tiff': 'tiff',
    };

    const extension = extensionMap[mimeType];
    if (!extension) {
      throw new Error(`Unsupported mime type: ${mimeType}`);
    }

    return extension;
  }

  /**
   * Validates base64 image data
   * @param base64Data - The base64 image data
   * @returns boolean - True if valid
   */
  validateBase64Image(base64Data: Base64ImageData): boolean {
    try {
      const { base64_image } = base64Data;

      // Check if it's a valid base64 image format
      const matches = base64_image.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) {
        return false;
      }

      const [, mimeType] = matches;

      // Check if it's an image mime type
      if (!mimeType.startsWith('image/')) {
        return false;
      }

      // Try to decode base64
      const base64String = matches[2];
      Buffer.from(base64String, 'base64');

      return true;
    } catch {
      return false;
    }
  }
}
