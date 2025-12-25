"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface RetroGridProps extends React.HTMLAttributes<HTMLDivElement> {
  gridColor?: string;
  gridOpacity?: number;
  gridSize?: number;
  gridLineWidth?: number;
  className?: string;
  children?: React.ReactNode;
}

export const RetroGrid: React.FC<RetroGridProps> = ({
  gridColor = "rgba(100, 100, 255, 0.3)",
  gridOpacity = 0.3,
  gridSize = 40,
  gridLineWidth = 1,
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg",
        className
      )}
      style={{
        backgroundImage: `
          linear-gradient(to right, ${gridColor} ${gridLineWidth}px, transparent ${gridLineWidth}px),
          linear-gradient(to bottom, ${gridColor} ${gridLineWidth}px, transparent ${gridLineWidth}px)
        `,
        backgroundSize: `${gridSize}px ${gridSize}px`,
        opacity: gridOpacity
      }}
      {...props}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
};