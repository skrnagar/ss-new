import { Skeleton } from "@/components/ui/skeleton";

export function PostSkeleton() {
  return (
    <div className="space-y-4 rounded-md border p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div>
          <Skeleton className="h-4 w-32 mb-1" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <Skeleton className="h-40 w-full rounded-md" />
      <div className="flex justify-between">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );
}

export default PostSkeleton;

import React from "react";

type LoadingSkeletonsProps = {
  count?: number;
  className?: string;
  height?: number;
  width?: string | number;
  circle?: boolean;
  inline?: boolean;
};

export function LoadingSkeletons({
  count = 1,
  className = "",
  height = 20,
  width = "100%",
  circle = false,
  inline = false,
}: LoadingSkeletonsProps) {
  const skeletons = Array.from({ length: count }, (_, index) => (
    <Skeleton
      key={index}
      className={`${className} ${circle ? "rounded-full" : "rounded-md"}`}
      style={{
        height: height,
        width: width,
        display: inline ? "inline-block" : "block",
        marginBottom: inline ? 0 : 8,
      }}
    />
  ));

  return <>{skeletons}</>;
}
