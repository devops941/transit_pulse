import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('TransitPulse ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container className="py-5 text-center">
          <Card className="tp-card mx-auto p-4" style={{ maxWidth: '600px' }}>
            <Card.Body>
              <div className="bg-danger bg-opacity-10 text-danger rounded-circle d-inline-flex p-3 mb-3">
                <AlertTriangle size={36} />
              </div>
              <h3 className="fw-bold text-dark mb-2">Something Went Unexpectedly Wrong</h3>
              <p className="text-muted small mb-4">
                The application encountered an unexpected client-side rendering error.
                Public bus timetable and delay analytics records remain unaffected.
              </p>
              {this.state.error && (
                <div className="bg-light p-3 rounded text-start text-danger small font-monospace mb-4 overflow-auto" style={{ maxHeight: '120px' }}>
                  {this.state.error.message || String(this.state.error)}
                </div>
              )}
              <div className="d-flex justify-content-center gap-3">
                <Button variant="primary" size="sm" onClick={this.handleReload} className="d-flex align-items-center gap-1">
                  <RefreshCw size={14} /> Reload Page
                </Button>
                <Button variant="outline-secondary" size="sm" onClick={this.handleGoHome} className="d-flex align-items-center gap-1">
                  <Home size={14} /> Return to Homepage
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
