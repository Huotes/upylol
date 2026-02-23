import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-shimmer shimmer-bg rounded-md",
        className,
      )}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="animate-fade-in rounded-xl border border-border bg-bg-card p-5">
      <Skeleton className="mb-3 h-5 w-32" />
      <Skeleton className="mb-2 h-4 w-full" />
      <Skeleton className="mb-2 h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="animate-fade-in rounded-xl border border-border bg-bg-card p-5">
      <div className="flex items-center gap-5">
        <Skeleton className="h-20 w-20 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-5 w-64" />
        </div>
      </div>
    </div>
  );
}

export function RadarSkeleton() {
  return (
    <div className="animate-fade-in rounded-xl border border-border bg-bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-16 w-16 rounded-full" />
      </div>
      <div className="flex items-center justify-center">
        <Skeleton className="h-72 w-72 rounded-full" />
      </div>
    </div>
  );
}
