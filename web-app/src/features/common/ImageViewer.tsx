import React, { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ImageViewerProps {
  src: string;
  alt?: string;
  className?: string;
  previewClassName?: string;
  dialogClassName?: string;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  src,
  alt = "Image",
  className,
  previewClassName,
  dialogClassName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPreviewLoaded, setIsPreviewLoaded] = useState(false);
  const [isDialogLoaded, setIsDialogLoaded] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className={cn("cursor-pointer relative", className)}>
          {!isPreviewLoaded && (
            <Skeleton className={cn("w-full h-48", previewClassName)} />
          )}
          <img
            src={src}
            alt={alt}
            className={cn(
              "w-full h-auto object-cover transition-all duration-200 hover:scale-105",
              isPreviewLoaded ? "opacity-100" : "opacity-0 absolute inset-0",
              previewClassName
            )}
            loading="lazy"
            onLoad={() => setIsPreviewLoaded(true)}
            onError={() => setIsPreviewLoaded(true)}
          />
        </div>
      </DialogTrigger>
      <DialogContent
        className={cn(
          "max-w-[95vw] max-h-[95vh] p-0 bg-transparent border-none",
          dialogClassName
        )}
      >
        <div className="flex items-center justify-center w-full h-full relative">
          {!isDialogLoaded && (
            <Skeleton className="w-full h-[80vh] max-w-4xl" />
          )}
          <img
            src={src}
            alt={alt}
            className={cn(
              "max-w-full max-h-full object-contain transition-opacity duration-200",
              isDialogLoaded ? "opacity-100" : "opacity-0 absolute inset-0"
            )}
            onClick={(e) => e.stopPropagation()}
            onLoad={() => setIsDialogLoaded(true)}
            onError={() => setIsDialogLoaded(true)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewer;
