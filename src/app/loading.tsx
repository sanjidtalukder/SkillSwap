import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="container flex min-h-[70vh] flex-col items-center justify-center space-y-6 p-8">
      <Skeleton className="h-10 w-64 rounded-lg" />
      <Skeleton className="h-6 w-96 rounded-md" />
      <div className="grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    </div>
  );
}
