import { CardSkeleton } from "@/components/ui/Skeleton";

export default function PlayerLoading() {
  return (
    <div className="space-y-4">
      <CardSkeleton />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
}
