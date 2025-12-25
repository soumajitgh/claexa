export const STORAGE_PROVIDER_TOKEN = 'StorageProviderInterface';

export interface UploadResult {
  key: string;
  // Could also include things like versionId, eTag, etc. if needed
}

export interface StorageProviderInterface {
  /**
   * Uploads a raw buffer to the storage.
   */
  upload(
    buffer: Buffer,
    mimetype: string,
    destinationPath: string,
  ): Promise<UploadResult>;

  /**
   * Downloads an object from storage as a buffer.
   */
  download(key: string): Promise<Buffer>;

  /**
   * Generates a pre-signed URL for a client-side upload.
   */
  getUploadUrl(key: string, mimetype: string): Promise<string>;

  /**
   * Generates a pre-signed URL for viewing/downloading.
   */
  getDownloadUrl(key: string): Promise<string>;

  /**
   * Deletes an object from storage permanently.
   */
  deleteObject(key: string): Promise<void>;
}
