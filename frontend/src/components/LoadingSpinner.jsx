import React from 'react';
import { Spinner } from 'react-bootstrap';

export const LoadingSpinner = ({ message = 'Loading transit analytics...' }) => {
  return (
    <div className="text-center py-5">
      <Spinner animation="border" variant="primary" role="status" style={{ width: '2.5rem', height: '2.5rem' }}>
        <span className="visually-hidden">Loading...</span>
      </Spinner>
      <div className="mt-3 text-muted fw-medium small">{message}</div>
    </div>
  );
};

export default LoadingSpinner;
