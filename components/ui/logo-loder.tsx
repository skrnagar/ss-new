"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface LogoLoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "pulse" | "rotate" | "morph" | "wave" | "flow";
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
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    if (variant === "pulse" || variant === "morph" || variant === "flow") {
      const interval = setInterval(() => {
        setProgress((prev) => (prev + 1) % 100);
      }, duration / 100);
      
      return () => clearInterval(interval);
    }
  }, [variant, duration]);

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  const variantClasses = {
    default: "animate-pulse",
    pulse: "animate-pulse",
    rotate: "animate-spin",
    morph: "animate-pulse",
    wave: "animate-bounce",
    flow: "animate-pulse",
  };

  // Stylized "S" logo SVG paths
  const logoSVG = (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "w-full h-full transition-all duration-700 ease-in-out",
        variant === "morph" && "animate-pulse",
        variant === "wave" && "animate-bounce",
        variant === "flow" && "animate-pulse"
      )}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="1">
            {variant === "morph" && (
              <animate
                attributeName="stop-opacity"
                values="1;0.5;1"
                dur={`${duration}ms`}
                repeatCount="indefinite"
              />
            )}
          </stop>
          <stop offset="100%" stopColor="#1E40AF" stopOpacity="1">
            {variant === "morph" && (
              <animate
                attributeName="stop-opacity"
                values="1;0.5;1"
                dur={`duration}ms`}
                repeatCount="indefinite"
              />
            )}
          </stop>
        </linearGradient>
        
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Background circle for morph variant */}
      {variant === "morph" && (
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="url(#logoGradient)"
          strokeWidth="2"
          strokeDasharray={`${progress * 2.83} ${283 - progress * 2.83}`}
          className="transition-all duration-300 ease-out"
          style={{ animationDuration: `${duration}ms` }}
        />
      )}

      {/* Main stylized "S" logo */}
      <g filter="url(#glow)">
        {/* Top curve of the S */}
        <path
          d="M25 20 Q35 15 45 20 Q55 25 65 20 Q75 15 85 20 L85 25 Q75 30 65 25 Q55 20 45 25 Q35 30 25 25 Z"
          fill={variant === "morph" ? "url(#logoGradient)" : "#3B82F6"}
          className={cn(
            "transition-all duration-1000 ease-in-out",
            variant === "pulse" && "animate-pulse",
            variant === "morph" && "animate-pulse",
            variant === "flow" && "animate-pulse"
          )}
        >
          {variant === "flow" && (
            <animate
              attributeName="opacity"
              values="1;0.7;1"
              dur={`${duration}ms`}
              repeatCount="indefinite"
            />
          )}
        </path>

        {/* Bottom curve of the S */}
        <path
          d="M25 75 Q35 80 45 75 Q55 70 65 75 Q75 80 85 75 L85 70 Q75 65 65 70 Q55 75 45 70 Q35 65 25 70 Z"
          fill={variant === "morph" ? "url(#logoGradient)" : "#3B82F6"}
          className={cn(
            "transition-all duration-1000 ease-in-out",
            variant === "pulse" && "animate-pulse",
            variant === "morph" && "animate-pulse",
            variant === "flow" && "animate-pulse"
          )}
        >
          {variant === "flow" && (
            <animate
              attributeName="opacity"
              values="0.7;1;0.7"
              dur={`${duration}ms`}
              repeatCount="indefinite"
            />
          )}
        </path>

        {/* Middle connecting stroke */}
        <path
          d="M35 45 Q50 40 65 45 Q50 50 35 45"
          fill={variant === "morph" ? "url(#logoGradient)" : "#3B82F6"}
          stroke={variant === "morph" ? "url(#logoGradient)" : "#3B82F6"}
          strokeWidth="2"
          className={cn(
            "transition-all duration-1000 ease-in-out",
            variant === "pulse" && "animate-pulse",
            variant === "morph" && "animate-pulse",
            variant === "flow" && "animate-pulse"
          )}
        >
          {variant === "flow" && (
            <animate
              attributeName="stroke-width"
              values="2;4;2"
              dur={`${duration}ms`}
              repeatCount="indefinite"
            />
          )}
        </path>
      </g>

      {/* Flow animation overlay for flow variant */}
      {variant === "flow" && (
        <g>
          <path
            d="M20 20 Q30 15 40 20 Q50 25 60 20 Q70 15 80 20"
            fill="none"
            stroke="#60A5FA"
            strokeWidth="1"
            strokeDasharray="5,5"
            opacity="0.6"
          >
            <animate
              attributeName="stroke-dashoffset"
              values="0;10"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>
          <path
            d="M20 80 Q30 85 40 80 Q50 75 60 80 Q70 85 80 80"
            fill="none"
            stroke="#60A5FA"
            strokeWidth="1"
            strokeDasharray="5,5"
            opacity="0.6"
          >
            <animate
              attributeName="stroke-dashoffset"
              values="10;0"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>
        </g>
      )}
    </svg>
  );

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className="relative">
        {/* Background glow effect */}
        <div className={cn(
          "absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-blue-700/20 blur-xl",
          variant === "pulse" && "animate-pulse",
          variant === "morph" && "animate-pulse",
          variant === "flow" && "animate-pulse"
        )} />
        
        {/* Main logo container */}
        <div className={cn(
          "relative",
          sizeClasses[size],
          variantClasses[variant],
          "transition-all duration-500 ease-in-out",
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}>
          {logoSVG}
        </div>

        {/* Progress ring for morph variant */}
        {variant === "morph" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(59, 130, 246, 0.2)"
                  strokeWidth="2"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="url(#logoGradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={`${progress * 2.83} ${283 - progress * 2.83}`}
                  className="transition-all duration-300 ease-out"
                />
              </svg>
            </div>
          </div>
        )}
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
          {variant === "morph" && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {progress}%
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Full screen loader component
export function FullScreenLoader({
  variant = "morph",
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
