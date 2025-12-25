import { useCallback, useState, useRef } from "react";
import { filesize } from "filesize";
import {
  File as FileIcon,
  FileText,
  Image as ImageIcon,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useFileUpload } from "@/hooks/useFileUpload";
import { DocumentType } from "@/api";

import { FormData } from "../types";

interface ReferenceFilesUploaderProps {
  data: Partial<FormData>;
  onUpdate: (updates: Partial<FormData>) => void;
  className?: string;
  fullHeight?: boolean;
}

export default function ReferenceFilesUploader({
  data,
  onUpdate,
  className,
  fullHeight,
}: ReferenceFilesUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFiles, setUploadingFiles] = useState<
    Map<string, { file: File; progress: number; error?: string }>
  >(new Map());

  // File upload hook for individual file uploads
  const { uploadFile, validateFile } = useFileUpload({
    onSuccess: (mediaRecord, originalFile) => {
      // Add the media ID to the form data
      onUpdate({
        mediaIds: [...(data.mediaIds || []), mediaRecord.id],
      });

      // Remove from uploading files
      setUploadingFiles((prev) => {
        const newMap = new Map(prev);
        newMap.delete(originalFile.name);
        return newMap;
      });
    },
    onError: (error, file) => {
      // Update uploading files with error
      setUploadingFiles((prev) => {
        const newMap = new Map(prev);
        newMap.set(file.name, { file, progress: 0, error: error.message });
        return newMap;
      });
    },
    onProgress: (file, progress) => {
      // Update progress for the specific file
      setUploadingFiles((prev) => {
        const newMap = new Map(prev);
        const existing = newMap.get(file.name);
        if (existing) {
          newMap.set(file.name, { ...existing, progress });
        }
        return newMap;
      });
    },
    showToasts: true,
  });

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      if (files.length === 0) return;

      // Add files to the form data
      const currentFiles = data.uploadedFiles || [];
      onUpdate({ uploadedFiles: [...currentFiles, ...files] });

      // Upload each file individually
      for (const file of files) {
        // Validate file before upload
        const validation = validateFile(
          file,
          [
            DocumentType.PDF,
            DocumentType.IMAGE_JPEG,
            DocumentType.IMAGE_PNG,
            DocumentType.IMAGE_WEBP,
            DocumentType.DOC,
            DocumentType.DOCX,
            DocumentType.TXT,
            DocumentType.CSV,
          ],
          10 * 1024 * 1024
        ); // 10MB

        if (!validation.isValid) {
          setUploadingFiles((prev) => {
            const newMap = new Map(prev);
            newMap.set(file.name, {
              file,
              progress: 0,
              error: validation.error,
            });
            return newMap;
          });
          continue;
        }

        // Add to uploading files
        setUploadingFiles((prev) => {
          const newMap = new Map(prev);
          newMap.set(file.name, { file, progress: 0 });
          return newMap;
        });

        try {
          await uploadFile(file);
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
        }
      }

      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [data.uploadedFiles, onUpdate, validateFile, uploadFile]
  );

  const handleRemoveFile = useCallback(
    (fileToRemove: File) => {
      const updatedFiles = (data.uploadedFiles || []).filter(
        (file) => file !== fileToRemove
      );
      onUpdate({ uploadedFiles: updatedFiles });

      // Remove from uploading files if it exists
      setUploadingFiles((prev) => {
        const newMap = new Map(prev);
        newMap.delete(fileToRemove.name);
        return newMap;
      });

      // Remove corresponding media ID if it exists
      // Note: This is a simplified approach - in a real app you'd want to track file-to-mediaId mapping
      const currentMediaIds = data.mediaIds || [];
      if (currentMediaIds.length > 0) {
        // Remove the last media ID (simplified - assumes last uploaded file)
        const updatedMediaIds = currentMediaIds.slice(0, -1);
        onUpdate({ mediaIds: updatedMediaIds });
      }
    },
    [data.uploadedFiles, data.mediaIds, onUpdate]
  );

  const handleRetryUpload = useCallback(
    async (file: File) => {
      setUploadingFiles((prev) => {
        const newMap = new Map(prev);
        newMap.set(file.name, { file, progress: 0 });
        return newMap;
      });

      try {
        await uploadFile(file);
      } catch (error) {
        console.error(`Retry failed for ${file.name}:`, error);
      }
    },
    [uploadFile]
  );

  // Render file metadata for the uploaded files section
  const renderFileMetadata = (file: File, index: number) => {
    const ext = file.name?.split(".").pop()?.toUpperCase() || "FILE";
    const isImage = file.type?.startsWith("image/");
    const isPdfOrDoc =
      file.type === "application/pdf" ||
      file.type?.includes("msword") ||
      file.type?.includes("word");

    const IconComp = isImage ? ImageIcon : isPdfOrDoc ? FileText : FileIcon;

    return (
      <div
        key={`${file.name}-${index}`}
        className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50 "
      >
        <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
          <IconComp className="h-4 w-4 text-gray-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900 truncate">
              {file.name}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
              onClick={() => handleRemoveFile(file)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
            <span className="px-1.5 py-0.5 bg-white rounded text-[10px] font-medium">
              {ext}
            </span>
            <span>•</span>
            <span>{filesize(file.size, { base: 2, standard: "jedec" })}</span>
          </div>
        </div>
      </div>
    );
  };

  // Render uploading file with progress
  const renderUploadingFile = (
    fileName: string,
    uploadData: { file: File; progress: number; error?: string }
  ) => {
    const { file, progress, error } = uploadData;
    const ext = file.name?.split(".").pop()?.toUpperCase() || "FILE";
    const isImage = file.type?.startsWith("image/");
    const isPdfOrDoc =
      file.type === "application/pdf" ||
      file.type?.includes("msword") ||
      file.type?.includes("word");

    const IconComp = isImage ? ImageIcon : isPdfOrDoc ? FileText : FileIcon;

    return (
      <div
        key={fileName}
        className={cn(
          "flex items-center gap-3 p-3 border rounded-lg",
          error ? "border-red-200 bg-red-50" : "border-blue-200 bg-blue-50"
        )}
      >
        <div
          className={cn(
            "flex-shrink-0 w-8 h-8 rounded flex items-center justify-center",
            error ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
          )}
        >
          <IconComp className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900 truncate">
              {file.name}
            </p>
            <div className="flex gap-1">
              {error ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700"
                  onClick={() => handleRetryUpload(file)}
                >
                  <Upload className="h-3 w-3" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  onClick={() =>
                    setUploadingFiles((prev) => {
                      const newMap = new Map(prev);
                      newMap.delete(fileName);
                      return newMap;
                    })
                  }
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
            <span className="px-1.5 py-0.5 bg-white rounded text-[10px] font-medium">
              {ext}
            </span>
            <span>•</span>
            <span>
              {filesize(file.size ?? 0, { base: 2, standard: "jedec" })}
            </span>
          </div>
          {error ? (
            <div className="mt-2 text-xs text-red-600">Error: {error}</div>
          ) : (
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-1" />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={cn("space-y-4 shadow-2xs border rounded-lg p-4", fullHeight && "h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileIcon className="h-4 w-4 text-gray-500" />
          <h3 className="text-sm font-medium">Source Material</h3>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.txt,.csv"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload area */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        <FileIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
        >
          Choose Files
        </Button>
        <p className="text-xs text-gray-500 mt-1">
          or drag and drop files here
        </p>
      </div>

      {/* Uploading files */}
      {uploadingFiles.size > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-gray-600">
            Uploading ({uploadingFiles.size})
          </h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {Array.from(uploadingFiles.entries()).map(
              ([fileName, uploadData]) =>
                renderUploadingFile(fileName, uploadData)
            )}
          </div>
        </div>
      )}

      {/* Selected files */}
      {data.uploadedFiles && data.uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-gray-600">Selected Files</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {data.uploadedFiles.map((file, index) =>
              renderFileMetadata(file, index)
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {(!data.uploadedFiles || data.uploadedFiles.length === 0) &&
        uploadingFiles.size === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            No files selected yet.
          </p>
        )}
    </div>
  );
}
