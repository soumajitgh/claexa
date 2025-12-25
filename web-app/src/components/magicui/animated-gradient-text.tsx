"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AnimatedGradientTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  className?: string;
}

export const AnimatedGradientText: React.FC<AnimatedGradientTextProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <span
      className={cn(
        "animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:300%_100%] bg-clip-text text-transparent",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};