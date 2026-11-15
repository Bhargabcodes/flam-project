import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="skeleton-view">
      <div className="skeleton-title"></div>
      <div className="skeleton-bar"></div>
      <div className="skeleton-list">
        {[1, 2, 3].map(i => <div key={i} className="skeleton-item"></div>)}
      </div>
    </div>
  );
};
