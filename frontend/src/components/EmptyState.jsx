import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { Inbox } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No Data Available',
  description = 'No records match the selected criteria or filters.',
  actionText,
  onAction,
}) => {
  return (
    <Card className="tp-card text-center py-5 my-3 border-dashed">
      <Card.Body>
        <div className="d-inline-flex p-3 rounded-circle bg-light text-muted mb-3">
          <Icon size={32} />
        </div>
        <h5 className="fw-bold text-dark">{title}</h5>
        <p className="text-muted small mx-auto mb-3" style={{ maxWidth: '420px' }}>
          {description}
        </p>
        {actionText && onAction && (
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionText}
          </Button>
        )}
      </Card.Body>
    </Card>
  );
};

export default EmptyState;
