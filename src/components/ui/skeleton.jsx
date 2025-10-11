import React from 'react';

export const Skeleton = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse rounded bg-slate-700 ${className}`}
      {...props}
    />
  );
};
