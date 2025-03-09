
"use client";

import { Button } from "@/components/ui/button";
import * as React from "react";
import { useState, useEffect } from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  { hasError: boolean; error: Error | null }
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error);
    console.error("Component stack:", errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

function ErrorFallback({ error }: { error: Error | null }) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    // Force reload the page
    window.location.reload();
  };

  const isChunkError = error?.message?.includes("ChunkLoadError") || 
                        error?.message?.includes("Loading chunk");

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 border">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          {isChunkError ? "Content Loading Error" : "Something went wrong"}
        </h2>
        <p className="text-gray-700 mb-4">
          {isChunkError
            ? "We're having trouble loading some resources. This could be due to a network issue or temporary server problem."
            : error?.message || "An unexpected error occurred."}
        </p>
        <div className="flex gap-4">
          <Button
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full"
          >
            {isRetrying ? "Reloading..." : "Reload Page"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Client component to handle runtime errors
export function ClientErrorBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
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
      } else {
        setErrorInfo(event.error?.message || "An unexpected error occurred");
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

    window.addEventListener("error", errorHandler);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    
    return () => {
      window.removeEventListener("error", errorHandler);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
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
