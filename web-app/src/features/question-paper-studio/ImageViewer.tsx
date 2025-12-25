import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { mediaService } from "@/api/media";
import { ImageViewer } from "@/features/common/ImageViewer";
import { cn } from "@/lib/utils";

interface QuestionImageViewerProps {
  mediaId: string;
  alt?: string;
  className?: string;
  previewClassName?: string;
  dialogClassName?: string;
  fallbackText?: string;
}

export const QuestionImageViewer: React.FC<QuestionImageViewerProps> = ({
  mediaId,
  alt = "Question image",
  className,
  previewClassName,
  dialogClassName,
  fallbackText = "Image not available",
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    data: downloadUrl,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ["media-download-url", mediaId],
    queryFn: () => mediaService.getDownloadUrl(mediaId),
    enabled: !!mediaId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  useEffect(() => {
    if (downloadUrl) {
      setImageUrl(downloadUrl);
      setError(null);
    } else if (queryError) {
      setError("Failed to load image");
    }
  }, [downloadUrl, queryError]);

  // Show loading state
  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <div className="animate-pulse bg-gray-200 rounded-lg w-full h-48 flex items-center justify-center">
          <span className="text-gray-500 text-sm">Loading image...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !imageUrl) {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <div className="bg-gray-100 rounded-lg w-full h-48 flex items-center justify-center border-2 border-dashed border-gray-300">
          <span className="text-gray-500 text-sm text-center px-4">
            {fallbackText}
          </span>
        </div>
      </div>
    );
  }

  // Show image viewer
  return (
    <ImageViewer
      src={imageUrl}
      alt={alt}
      className={className}
      previewClassName={previewClassName}
      dialogClassName={dialogClassName}
    />
  );
};

export default QuestionImageViewer;
