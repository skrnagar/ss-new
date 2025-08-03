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
  const [animationPhase, setAnimationPhase] = useState(0); // 0: initial, 1: building, 2: final

  useEffect(() => {
    setIsVisible(true);
    
    // Phase 1: Start building animation (0.5s)
    const timer1 = setTimeout(() => {
      setAnimationPhase(1);
    }, 500);
    
    // Phase 2: Complete logo (1.5s total)
    const timer2 = setTimeout(() => {
      setAnimationPhase(2);
    }, 1500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
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
        variant === "glitch" && animationPhase === 2 && "animate-glitch",
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

      {/* 3D Base Block - appears in phase 1 */}
      <rect
        x="15"
        y="15"
        width="70"
        height="70"
        rx="8"
        fill="url(#blueGradient)"
        filter="url(#shadow3D)"
        opacity={animationPhase >= 1 ? "0.1" : "0"}
        className="transition-opacity duration-500 ease-in-out"
      />

      {/* Main 3D S Shape - Blue - builds in phase 1 */}
      <g filter="url(#glow)">
        {/* Primary S curve - Blue */}
        <path
          d="M25 30 Q35 25 45 30 Q55 35 65 30 Q75 25 85 30 L85 35 Q75 40 65 35 Q55 30 45 35 Q35 40 25 35 Z"
          fill="url(#blueGradient)"
          stroke="#1E40AF"
          strokeWidth="0.5"
          opacity={animationPhase >= 1 ? "1" : "0"}
          className="transition-opacity duration-500 ease-in-out"
        />
        
        {/* Secondary S curve - White - appears in phase 2 */}
        <path
          d="M25 40 Q35 35 45 40 Q55 45 65 40 Q75 35 85 40 L85 45 Q75 50 65 45 Q55 40 45 45 Q35 50 25 45 Z"
          fill="url(#whiteGradient)"
          stroke="#E2E8F0"
          strokeWidth="0.5"
          opacity={animationPhase >= 2 ? "1" : "0"}
          className="transition-opacity duration-500 ease-in-out"
        />
        
        {/* Connecting 3D blocks - appear in phase 2 */}
        <rect 
          x="30" y="25" width="8" height="8" rx="2" 
          fill="url(#blueGradient)" 
          opacity={animationPhase >= 2 ? "0.8" : "0"}
          className="transition-opacity duration-300 ease-in-out"
        />
        <rect 
          x="62" y="25" width="8" height="8" rx="2" 
          fill="url(#blueGradient)" 
          opacity={animationPhase >= 2 ? "0.8" : "0"}
          className="transition-opacity duration-300 ease-in-out"
        />
        <rect 
          x="30" y="47" width="8" height="8" rx="2" 
          fill="url(#whiteGradient)" 
          opacity={animationPhase >= 2 ? "0.8" : "0"}
          className="transition-opacity duration-300 ease-in-out"
        />
        <rect 
          x="62" y="47" width="8" height="8" rx="2" 
          fill="url(#whiteGradient)" 
          opacity={animationPhase >= 2 ? "0.8" : "0"}
          className="transition-opacity duration-300 ease-in-out"
        />
        
        {/* Center connecting block - appears in phase 2 */}
        <rect 
          x="45" y="35" width="10" height="10" rx="2" 
          fill="url(#blueGradient)" 
          opacity={animationPhase >= 2 ? "0.9" : "0"}
          className="transition-opacity duration-300 ease-in-out"
        />
      </g>

      {/* 3D Highlights - appear in phase 2 */}
      <path
        d="M25 30 Q35 25 45 30"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1"
        opacity={animationPhase >= 2 ? "0.6" : "0"}
        className="transition-opacity duration-300 ease-in-out"
      />
      <path
        d="M25 40 Q35 35 45 40"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1"
        opacity={animationPhase >= 2 ? "0.6" : "0"}
        className="transition-opacity duration-300 ease-in-out"
      />

      {/* Initial loading animation - simple dots in phase 0 */}
      {animationPhase === 0 && (
        <g>
          <circle cx="30" cy="40" r="3" fill="#2563EB" className="animate-pulse">
            <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
          </circle>
          <circle cx="50" cy="40" r="3" fill="#2563EB" className="animate-pulse">
            <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" begin="0.2s" />
          </circle>
          <circle cx="70" cy="40" r="3" fill="#2563EB" className="animate-pulse">
            <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" begin="0.4s" />
          </circle>
        </g>
      )}
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
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95",
          animationPhase === 1 && "animate-logo-build",
          animationPhase === 2 && "animate-logo-fade-in"
        )}>
          {logoSVG}
        </div>
      </div>

      {/* Loading text */}
      {showText && (
        <div className={cn(
          "mt-4 text-center transition-all duration-500 ease-in-out",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
          animationPhase === 2 && "animate-logo-fade-in"
        )}>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {animationPhase === 0 ? "Loading..." : animationPhase === 1 ? "Building..." : text}
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
  duration = 2000,
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
