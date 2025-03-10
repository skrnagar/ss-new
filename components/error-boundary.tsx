"use client";

import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ErrorBoundary({
  children,
  fallback = (
    <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
      Something went wrong. Please try again.
    </div>
  ),
}: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);

  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      console.error("Error caught by boundary:", event.error);

      // Check for ChunkLoadError specifically
      const isChunkError = event.error && 
        (event.error.toString().includes('ChunkLoadError') || 
         event.error.toString().includes('Loading chunk'));

      if (isChunkError) {
        setErrorInfo("Failed to load a required component. This might be due to network issues.");
      }

      setHasError(true);
      event.preventDefault();
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason && 
         (event.reason.toString().includes('ChunkLoadError') || 
          event.reason.toString().includes('Loading chunk'))) {
        setErrorInfo("Failed to load a required component. This might be due to network issues.");
        setHasError(true);
        event.preventDefault();
      }
    };

    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const handleRetry = () => {
    setHasError(false);
    setErrorInfo(null);
    // Force reload the current page to refresh all chunks
    window.location.reload();
  };

  if (hasError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <h3 className="text-red-800 font-medium mb-2">Something went wrong</h3>
        <p className="text-red-700 mb-3">
          {errorInfo || "We encountered an error loading this component."}
        </p>
        <Button
          variant="outline"
          onClick={handleRetry}
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          Reload Page
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}

export default ErrorBoundary;