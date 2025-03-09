"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      console.error("Error caught by boundary:", event.error);
      setHasError(true);
      event.preventDefault();
    };

    window.addEventListener("error", errorHandler);
    return () => window.removeEventListener("error", errorHandler);
  }, []);

  if (hasError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <h3 className="text-red-800 font-medium mb-2">Something went wrong</h3>
        <p className="text-red-700 mb-3">We encountered an error loading this component.</p>
        <Button
          variant="outline"
          onClick={() => setHasError(false)}
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}

export default ErrorBoundary;
