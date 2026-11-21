import React from 'react';
import { Alert, Button } from 'react-bootstrap';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const ErrorMessage = ({ message = 'Failed to load data.', onRetry }) => {
  return (
    <Alert variant="danger" className="d-flex align-items-center justify-content-between my-3 p-3">
      <div className="d-flex align-items-center gap-2">
        <AlertCircle size={20} className="text-danger flex-shrink-0" />
        <div>
          <strong className="d-block">Data Loading Error</strong>
          <span className="small">{message}</span>
        </div>
      </div>
      {onRetry && (
        <Button variant="outline-danger" size="sm" onClick={onRetry} className="d-flex align-items-center gap-1">
          <RefreshCw size={14} /> Retry
        </Button>
      )}
    </Alert>
  );
};

export default ErrorMessage;
