import { memo } from "react";
import { Skeleton } from "./Skeleton";
import { Card, CardHeader, CardContent, CardFooter } from "./Card";

export interface CardSkeletonProps {
  count?: number;
}

export const CardSkeleton = memo(function CardSkeleton({ count = 1 }: CardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="w-full">
          <CardHeader className="space-y-2">
            <Skeleton className="h-4 w-1/4 rounded-full" />
            <Skeleton className="h-6 w-3/4 rounded-md" />
            <Skeleton className="h-4 w-full rounded-md" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-5/6 rounded-md" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </CardContent>
          <CardFooter className="justify-between border-t border-border/40 pt-4">
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </CardFooter>
        </Card>
      ))}
    </>
  );
});
