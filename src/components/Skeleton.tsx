"use client";

export function SkeletonCard() {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="h-28 bg-white/[0.03] shimmer" />
      <div className="p-3.5 pt-3 space-y-3">
        <div className="h-4 bg-white/[0.04] rounded-lg w-4/5 shimmer" />
        <div className="h-3 bg-white/[0.03] rounded-lg w-3/5 shimmer" />
        <div className="flex gap-3">
          <div className="h-7 bg-white/[0.04] rounded-lg w-12 shimmer" />
          <div className="h-7 bg-white/[0.04] rounded-lg w-12 shimmer" />
        </div>
        <div className="h-1.5 bg-white/[0.03] rounded-full w-full shimmer" />
        <div className="flex justify-between">
          <div className="h-3 bg-white/[0.03] rounded w-16 shimmer" />
          <div className="h-3 bg-white/[0.03] rounded w-16 shimmer" />
          <div className="h-3 bg-white/[0.03] rounded w-12 shimmer" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonPosition() {
  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-white/[0.04] rounded-lg w-3/4 shimmer" />
          <div className="flex gap-2">
            <div className="h-5 bg-white/[0.04] rounded w-10 shimmer" />
            <div className="h-5 bg-white/[0.03] rounded w-16 shimmer" />
          </div>
        </div>
        <div className="space-y-1.5 text-right">
          <div className="h-4 bg-white/[0.04] rounded w-14 ml-auto shimmer" />
          <div className="h-3 bg-white/[0.03] rounded w-20 ml-auto shimmer" />
        </div>
      </div>
      <div className="h-3 bg-white/[0.03] rounded w-2/3 shimmer" />
    </div>
  );
}
