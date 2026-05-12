"use client";

import { Progress } from "@/components/ui/progress";

export function ProfileCompletionBar({
  percent,
  className = "",
}: {
  percent: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Profile strength</span>
        <span className="font-medium text-foreground">{percent}%</span>
      </div>
      <Progress value={percent} className="h-2" />
    </div>
  );
}
