"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface LogoLoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "pulse" | "rotate" | "glitch" | "line" | "bounce" | "fade";
  className?: string;
  showText?: boolean;
  text?: string;
  duration?: number;
}

export function LogoLoader({
  size = "md",
  variant = "default",
  className,
  showText = true,
  text = "Loading...",
  duration = 2000,
}: LogoLoaderProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  // Modern 3D Logo SVG with blue and white gradients
  const logoSVG = (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "w-full h-full transition-all duration-700 ease-in-out",
        variant === "glitch" && "animate-glitch",
        variant === "line" && "animate-line-draw",
        variant === "bounce" && "animate-bounce",
        variant === "fade" && "animate-pulse"
      )}
    >
      <defs>
        {/* Blue gradient for primary elements */}
        <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="50%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#1E40AF" />
        </linearGradient>
        
        {/* White gradient for secondary elements */}
        <linearGradient id="whiteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>
        
        {/* 3D shadow effect */}
        <filter id="shadow3D">
          <feDropShadow dx="2" dy="2" stdDeviation="2" floodColor="#1E40AF" floodOpacity="0.3"/>
        </filter>
        
        {/* Glow effect */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* 3D Base Block */}
      <rect
        x="15"
        y="15"
        width="70"
        height="70"
        rx="8"
        fill="url(#blueGradient)"
        filter="url(#shadow3D)"
        opacity="0.1"
      />

      {/* Main 3D S Shape - Blue */}
      <g filter="url(#glow)">
        {/* Primary S curve - Blue */}
        <path
          d="M25 30 Q35 25 45 30 Q55 35 65 30 Q75 25 85 30 L85 35 Q75 40 65 35 Q55 30 45 35 Q35 40 25 35 Z"
          fill="url(#blueGradient)"
          stroke="#1E40AF"
          strokeWidth="0.5"
        />
        
        {/* Secondary S curve - White */}
        <path
          d="M25 40 Q35 35 45 40 Q55 45 65 40 Q75 35 85 40 L85 45 Q75 50 65 45 Q55 40 45 45 Q35 50 25 45 Z"
          fill="url(#whiteGradient)"
          stroke="#E2E8F0"
          strokeWidth="0.5"
        />
        
        {/* Connecting 3D blocks */}
        <rect x="30" y="25" width="8" height="8" rx="2" fill="url(#blueGradient)" opacity="0.8"/>
        <rect x="62" y="25" width="8" height="8" rx="2" fill="url(#blueGradient)" opacity="0.8"/>
        <rect x="30" y="47" width="8" height="8" rx="2" fill="url(#whiteGradient)" opacity="0.8"/>
        <rect x="62" y="47" width="8" height="8" rx="2" fill="url(#whiteGradient)" opacity="0.8"/>
        
        {/* Center connecting block */}
        <rect x="45" y="35" width="10" height="10" rx="2" fill="url(#blueGradient)" opacity="0.9"/>
      </g>

      {/* 3D Highlights */}
      <path
        d="M25 30 Q35 25 45 30"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1"
        opacity="0.6"
      />
      <path
        d="M25 40 Q35 35 45 40"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1"
        opacity="0.6"
      />
    </svg>
  );

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className="relative">
        {/* Main logo container - clean, no background */}
        <div className={cn(
          "relative",
          sizeClasses[size],
          variant === "rotate" && "animate-spin",
          variant === "pulse" && "animate-pulse",
          "transition-all duration-500 ease-in-out",
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}>
          {logoSVG}
        </div>
      </div>

      {/* Loading text */}
      {showText && (
        <div className={cn(
          "mt-4 text-center transition-all duration-500 ease-in-out",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        )}>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {text}
          </p>
        </div>
      )}
    </div>
  );
}

// Full screen loader component
export function FullScreenLoader({
  variant = "glitch",
  text = "Loading Safety Shaper...",
  duration = 3000,
}: Omit<LogoLoaderProps, "size" | "showText">) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 z-50 flex items-center justify-center">
      <div className="text-center">
        <LogoLoader
          size="xl"
          variant={variant}
          text={text}
          duration={duration}
          showText={true}
        />
      </div>
    </div>
  );
}

// Inline loader component
export function InlineLoader({
  variant = "default",
  size = "sm",
  className,
}: Omit<LogoLoaderProps, "showText" | "text">) {
  return (
    <LogoLoader
      size={size}
      variant={variant}
      className={className}
      showText={false}
    />
  );
}

export default LogoLoader;
