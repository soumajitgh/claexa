import { ENDPOINTS } from "./core/endpoints";
import { apiClient } from "./core/client";

// ============================================================================
// Types
// ============================================================================

/**
 * Supported document types for upload
 */
export enum DocumentType {
    PDF = 'application/pdf',
    IMAGE_JPEG = 'image/jpeg',
    IMAGE_PNG = 'image/png',
    IMAGE_WEBP = 'image/webp',
    DOC = 'application/msword',
    DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    XLS = 'application/vnd.ms-excel',
    XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    PPT = 'application/vnd.ms-powerpoint',
    PPTX = 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    TXT = 'text/plain',
    CSV = 'text/csv',
}

/**
 * Upload status states
 */
export enum UploadStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed',
}

/**
 * Media states
 */
export type MediaState = 'PENDING' | 'SUCCESS' | 'FAILED';

/**
 * Media upload request payload
 */
export interface MediaUploadRequest {
    originalName: string;
    mimetype: string;
}

/**
 * Media record information
 */
export interface MediaRecord {
    id: string;
    fileName: string;
    size: number;
    mimeType: string;
    bucketName: string;
    objectName: string;
    altText: string | null;
    description: string | null;
    state: MediaState;
    createdAt: string;
    updatedAt: string;
}

/**
 * Media upload response with presigned URL
 */
export interface MediaUploadResponse {
    url: string;
    record: MediaRecord;
}

/**
 * Complete upload request payload
 */
export interface CompleteUploadRequest {
    size: number;
    uploadStatus: 'pending' | 'completed' | 'failed';
}

/**
 * Generate signed URL payload (legacy)
 */
export interface GenerateSignedUrlPayload {
    filename: string;
    mimeType: string;
    size: number;
}

/**
 * Generate signed URL response (legacy)
 */
export interface GenerateSignedUrlResponse extends MediaRecord {
    uploadUrl: string;
}

/**
 * Update media state payload (legacy)
 */
export interface UpdateMediaStatePayload {
    state: 'SUCCESS' | 'FAILED';
}

interface DownloadUrlResponse {
    url: string;
}

// ============================================================================
// Service
// ============================================================================

const downloadUrlCache = new Map<string, string>();

export const mediaService = {
    /**
     * Get upload URL for media file
     */
    async uploadUrl(data: MediaUploadRequest): Promise<MediaUploadResponse> {
        const response = await apiClient.post<MediaUploadResponse>(
            ENDPOINTS.media.uploadUrl,
            data,
        );
        return response.data as MediaUploadResponse;
    },

    /**
     * Upload file to the provided URL
     */
    async uploadFile(url: string, file: File): Promise<void> {
        await fetch(url, {
            method: "PUT",
            body: file,
            headers: { "Content-Type": file.type },
        });
    },

    /**
     * Complete upload process
     */
    async completeUpload(
        id: string,
        data: CompleteUploadRequest,
    ): Promise<MediaRecord> {
        const response = await apiClient.post<MediaRecord>(
            ENDPOINTS.media.completeUpload(id),
            data,
        );
        return response as unknown as MediaRecord;
    },

    /**
     * Get download URL for media file with caching
     */
    async getDownloadUrl(
        id: string,
        { forceRefresh = false }: { forceRefresh?: boolean } = {},
    ): Promise<string> {
        // Check cache first unless force refresh is requested
        if (!forceRefresh) {
            const cached = downloadUrlCache.get(id);
            if (cached) return cached;
        }

        // Fetch new URL
        const response = await apiClient.get<DownloadUrlResponse>(
            ENDPOINTS.media.downloadUrl(id),
        );
        const url = response.data.url;

        // Cache the URL
        downloadUrlCache.set(id, url);
        return url;
    },

    /**
     * Prefetch download URLs for multiple media files
     */
    async prefetchDownloadUrls(ids: string[]): Promise<void> {
        const uncached = ids.filter((id) => !downloadUrlCache.has(id));
        if (!uncached.length) return;

        await Promise.all(
            uncached.map(
                (id) => this.getDownloadUrl(id).catch(() => null), // Ignore errors for prefetch
            ),
        );
    },

    /**
     * Invalidate cached download URL
     */
    invalidateDownloadUrl(id: string): void {
        downloadUrlCache.delete(id);
    },

    /**
     * Clear all cached download URLs
     */
    clearDownloadUrlCache(): void {
        downloadUrlCache.clear();
    },
};
