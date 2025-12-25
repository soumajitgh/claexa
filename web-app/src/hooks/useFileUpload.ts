import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { mediaService, DocumentType, MediaRecord } from "@/api";

export interface UseFileUploadOptions {
  onSuccess?: (file: MediaRecord, originalFile: File) => void;
  onError?: (error: Error, file: File) => void;
  onProgress?: (file: File, progress: number) => void;
  showToasts?: boolean;
}

export interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  uploadedFile: MediaRecord | null;
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const { onSuccess, onError, onProgress, showToasts = true } = options;
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    uploadedFile: null,
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      setUploadState(prev => ({ ...prev, isUploading: true, progress: 0, error: null }));

      try {
        // Step 1: Get upload URL
        setUploadState(prev => ({ ...prev, progress: 20 }));
        onProgress?.(file, 20);
        const uploadUrlResponse = await mediaService.uploadUrl({
          originalName: file.name,
          mimetype: file.type,
        });

        // Step 2: Upload file to the presigned URL
        setUploadState(prev => ({ ...prev, progress: 60 }));
        onProgress?.(file, 60);
        await mediaService.uploadFile(uploadUrlResponse.url, file);

        // Step 3: Complete the upload
        setUploadState(prev => ({ ...prev, progress: 90 }));
        onProgress?.(file, 90);
        const completedRecord = await mediaService.completeUpload(
          uploadUrlResponse.record.id,
          {
            uploadStatus: "completed",
            size: file.size,
          },
        );

        // Normalize response to a MediaRecord shape
        let normalized: MediaRecord;
        const response = completedRecord as unknown as { record?: MediaRecord; data?: MediaRecord };

        if (response?.record) {
          normalized = response.record;
        } else if (response?.data) {
          normalized = response.data;
        } else {
          normalized = completedRecord as MediaRecord;
        }

        // Fallback if backend returns 204 No Content
        if (!normalized || !normalized.id) {
          normalized = {
            id: uploadUrlResponse.record.id,
            fileName: uploadUrlResponse.record.fileName ?? file.name,
            mimeType: uploadUrlResponse.record.mimeType ?? file.type,
            size: file.size,
            state: "SUCCESS",
            bucketName: uploadUrlResponse.record.bucketName,
            objectName: uploadUrlResponse.record.objectName,
            altText: null,
            description: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } as MediaRecord;
        }

        setUploadState(prev => ({
          ...prev,
          progress: 100,
          isUploading: false,
          uploadedFile: normalized
        }));
        onProgress?.(file, 100);

        return normalized;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Upload failed";
        setUploadState(prev => ({
          ...prev,
          isUploading: false,
          error: errorMessage,
          progress: 0
        }));
        throw error;
      }
    },
    onSuccess: (data, file) => {
      if (showToasts) {
        toast.success(`File uploaded successfully!`);
      }
      onSuccess?.(data, file);
    },
    onError: (error, file) => {
      const errorMessage = error instanceof Error ? error.message : "Upload failed";

      if (showToasts) {
        toast.error(`Upload failed: ${errorMessage}`);
      }

      onError?.(error instanceof Error ? error : new Error(errorMessage), file);
    },
  });

  const uploadFile = async (file: File) => {
    return uploadMutation.mutateAsync(file);
  };

  const validateFile = (
    file: File,
    acceptedTypes: DocumentType[],
    maxFileSize: number,
  ): { isValid: boolean; error?: string } => {
    const acceptedMimeTypes = acceptedTypes.map((type) => type.valueOf());

    // Check file type
    if (!acceptedMimeTypes.includes(file.type)) {
      const extensions = getFileExtensions(acceptedTypes);
      return {
        isValid: false,
        error: `File type ${file.type} is not supported. Accepted types: ${extensions.join(", ")}`,
      };
    }

    // Check file size
    if (file.size > maxFileSize) {
      return {
        isValid: false,
        error: `File size ${formatFileSize(file.size)} exceeds the maximum allowed size of ${formatFileSize(maxFileSize)}`,
      };
    }

    return { isValid: true };
  };

  const reset = () => {
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null,
      uploadedFile: null,
    });
  };

  return {
    uploadFile,
    validateFile,
    uploadState,
    reset,
    isUploading: uploadMutation.isPending,
  };
}

// Helper functions
function getFileExtensions(documentTypes: DocumentType[]): string[] {
  const extensionMap: Record<DocumentType, string[]> = {
    [DocumentType.PDF]: [".pdf"],
    [DocumentType.IMAGE_JPEG]: [".jpg", ".jpeg"],
    [DocumentType.IMAGE_PNG]: [".png"],
    [DocumentType.IMAGE_WEBP]: [".webp"],
    [DocumentType.DOC]: [".doc"],
    [DocumentType.DOCX]: [".docx"],
    [DocumentType.XLS]: [".xls"],
    [DocumentType.XLSX]: [".xlsx"],
    [DocumentType.PPT]: [".ppt"],
    [DocumentType.PPTX]: [".pptx"],
    [DocumentType.TXT]: [".txt"],
    [DocumentType.CSV]: [".csv"],
  };

  const extensions = documentTypes.flatMap((type) => extensionMap[type] || []);
  return [...new Set(extensions)];
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}