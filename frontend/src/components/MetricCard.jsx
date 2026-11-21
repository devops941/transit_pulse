import React from 'react';
import { Card } from 'react-bootstrap';

export const MetricCard = ({
  label,
  value,
  subtext,
  icon: Icon,
  variant = 'primary',
  badge,
}) => {
  return (
    <Card className="tp-card h-100">
      <Card.Body className="d-flex flex-column justify-content-between p-3">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <span className="metric-card-label">{label}</span>
          {Icon && (
            <div className={`p-2 rounded bg-${variant} bg-opacity-10 text-${variant}`}>
              <Icon size={18} />
            </div>
          )}
        </div>
        <div>
          <div className="d-flex align-items-baseline gap-2">
            <span className="metric-card-val">{value}</span>
            {badge}
          </div>
          {subtext && <div className="text-muted small mt-1">{subtext}</div>}
        </div>
      </Card.Body>
    </Card>
  );
};

export default MetricCard;
