import React from 'react';

export const ShopCardSkeleton = () => (
  <div className="bg-white rounded-3xl overflow-hidden border border-stone-200 animate-pulse">
    <div className="h-44 bg-stone-200" />
    <div className="p-4 space-y-3">
      <div className="h-5 bg-stone-200 rounded-md w-3/4" />
      <div className="h-3 bg-stone-200 rounded-md w-full" />
      <div className="h-3 bg-stone-200 rounded-md w-1/2" />
      <div className="pt-3 border-t border-stone-100 flex justify-between">
        <div className="h-4 bg-stone-200 rounded-md w-1/4" />
        <div className="h-4 bg-stone-200 rounded-md w-1/4" />
      </div>
    </div>
  </div>
);

export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-3xl p-4 border border-stone-200 animate-pulse space-y-3">
    <div className="h-36 bg-stone-200 rounded-2xl" />
    <div className="h-4 bg-stone-200 rounded-md w-2/3" />
    <div className="h-3 bg-stone-200 rounded-md w-full" />
    <div className="flex justify-between items-center pt-2">
      <div className="h-5 bg-stone-200 rounded-md w-1/3" />
      <div className="h-8 bg-stone-200 rounded-xl w-16" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="bg-white rounded-2xl border border-stone-200 p-4 animate-pulse space-y-4">
    <div className="h-6 bg-stone-200 rounded w-1/4 mb-4" />
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex space-x-4 items-center">
        <div className="h-4 bg-stone-200 rounded w-1/6" />
        <div className="h-4 bg-stone-200 rounded w-2/6" />
        <div className="h-4 bg-stone-200 rounded w-1/6" />
        <div className="h-4 bg-stone-200 rounded w-2/6" />
      </div>
    ))}
  </div>
);
