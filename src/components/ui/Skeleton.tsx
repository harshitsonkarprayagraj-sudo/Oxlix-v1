import type { ReactNode } from 'react';

interface SkeletonProps {
  className?: string;
  rounded?: string;
  children?: ReactNode;
}

export function Skeleton({ className = '', rounded = 'rounded-xl', children }: SkeletonProps) {
  return (
    <div className={[rounded, 'skeleton overflow-hidden', className].join(' ')}>
      {children}
    </div>
  );
}

export function SkeletonIntelligenceCard() {
  return (
    <div className="rounded-3xl bg-ox-card border border-white/[0.06] p-5 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton rounded="rounded-xl" className="h-10 w-10" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-2.5 w-16" />
        </div>
        <Skeleton rounded="rounded-full" className="h-6 w-14" />
      </div>
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-3 w-4/6" />
    </div>
  );
}

export function SkeletonCreatorCard() {
  return (
    <div className="rounded-3xl bg-ox-card border border-white/[0.06] p-5 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton rounded="rounded-full" className="h-12 w-12" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-2.5 w-20" />
        </div>
      </div>
      <Skeleton rounded="rounded-2xl" className="h-32 w-full" />
      <div className="flex gap-4">
        <Skeleton rounded="rounded-full" className="h-8 w-16" />
        <Skeleton rounded="rounded-full" className="h-8 w-16" />
      </div>
    </div>
  );
}
