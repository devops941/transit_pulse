import React from 'react';

export const ReliabilityBadge = ({ score, showScore = true }) => {
  if (score === undefined || score === null) {
    return <span className="glass-badge badge-tier-poor">N/A</span>;
  }

  let tierClass = 'badge-tier-poor';
  let tierLabel = 'Poor';
  let dotColor = '#ef4444';

  if (score >= 80) {
    tierClass = 'badge-tier-excellent';
    tierLabel = 'Excellent';
    dotColor = '#10b981';
  } else if (score >= 65) {
    tierClass = 'badge-tier-good';
    tierLabel = 'Good';
    dotColor = '#0284c7';
  } else if (score >= 50) {
    tierClass = 'badge-tier-moderate';
    tierLabel = 'Moderate';
    dotColor = '#f59e0b';
  }

  return (
    <span className={`glass-badge ${tierClass} d-inline-flex align-items-center gap-1`}>
      <span className="badge-pulse-dot" style={{ backgroundColor: dotColor }}></span>
      <span>{tierLabel}</span>
      {showScore && <span className="opacity-75 ms-1">({score.toFixed(1)})</span>}
    </span>
  );
};

export default ReliabilityBadge;
