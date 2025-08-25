import React from 'react';

export const Skeleton = ({ className = '', ...props }) => (
  <div
    className={`animate-pulse bg-gray-200 rounded ${className}`}
    {...props}
  />
);

export const SkeletonCard = () => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-8 w-24 mb-2" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-12 w-12 rounded-full" />
    </div>
  </div>
);

export const SkeletonGrid = ({ count = 4 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonCard key={index} />
    ))}
  </div>
);

export const SkeletonList = ({ count = 5 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-4 w-16" />
      </div>
    ))}
  </div>
);

export const SkeletonDashboard = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-10 w-24" />
    </div>

    {/* Stats Grid */}
    <SkeletonGrid count={4} />

    {/* Charts and Activity */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="p-6">
          <SkeletonList count={5} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="p-6">
          <SkeletonList count={5} />
        </div>
      </div>
    </div>
  </div>
);
