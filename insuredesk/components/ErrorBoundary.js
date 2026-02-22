'use client';

import { Component } from 'react';
import { Button } from 'react-bootstrap';

/**
 * Error Boundary Component
 * Catches JavaScript errors in child components and displays fallback UI
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so next render shows fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
    
    // Store error details
    this.state = {
      hasError: true,
      error: error,
      errorInfo: errorInfo
    };
    
    // TODO: Log to error reporting service in production
    // Example: Sentry.captureException(error);
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null 
    });
    
    // Optionally reload the page
    if (this.props.resetOnError) {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom error UI
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8f9fa',
          padding: '20px'
        }}>
          <div style={{
            maxWidth: '600px',
            width: '100%',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            padding: '40px',
            textAlign: 'center'
          }}>
            {/* Error Icon */}
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#fee',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <i className="bi bi-exclamation-triangle" style={{
                fontSize: '40px',
                color: '#dc3545'
              }}></i>
            </div>

            {/* Error Message */}
            <h2 style={{ 
              marginBottom: '16px',
              color: '#212529',
              fontSize: '24px',
              fontWeight: '600'
            }}>
              Oops! Something went wrong
            </h2>
            
            <p style={{ 
              marginBottom: '24px',
              color: '#6c757d',
              fontSize: '16px',
              lineHeight: '1.6'
            }}>
              We're sorry for the inconvenience. An unexpected error occurred while processing your request.
            </p>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div style={{
                backgroundColor: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px',
                textAlign: 'left'
              }}>
                <strong style={{ color: '#dc3545', display: 'block', marginBottom: '8px' }}>
                  Error Details (Development):
                </strong>
                <code style={{ 
                  fontSize: '12px',
                  color: '#495057',
                  display: 'block',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {this.state.error.toString()}
                </code>
                
                {this.state.errorInfo?.componentStack && (
                  <details style={{ marginTop: '12px' }}>
                    <summary style={{ cursor: 'pointer', color: '#0d6efd' }}>
                      Component Stack
                    </summary>
                    <pre style={{ 
                      fontSize: '11px',
                      color: '#495057',
                      marginTop: '8px',
                      maxHeight: '200px',
                      overflow: 'auto'
                    }}>
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <Button 
                variant="primary" 
                onClick={this.handleReset}
                style={{ minWidth: '120px' }}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Try Again
              </Button>
              
              <Button 
                variant="outline-secondary" 
                onClick={() => window.location.href = '/home'}
                style={{ minWidth: '120px' }}
              >
                <i className="bi bi-house me-2"></i>
                Go Home
              </Button>
            </div>

            {/* Help Text */}
            <p style={{ 
              marginTop: '24px',
              color: '#6c757d',
              fontSize: '14px'
            }}>
              If this problem persists, please contact support or try refreshing the page.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Error Fallback Component (functional alternative for simple cases)
 */
export function ErrorFallback({ error, resetError }) {
  return (
    <div className="container mt-5">
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Something went wrong
        </h4>
        <p>An unexpected error occurred. Please try again.</p>
        
        {process.env.NODE_ENV === 'development' && error && (
          <div className="mt-3">
            <strong>Error:</strong>
            <pre className="mt-2 p-2 bg-light border rounded">
              <code>{error.message}</code>
            </pre>
          </div>
        )}
        
        <hr />
        <div className="d-flex gap-2">
          <Button variant="primary" size="sm" onClick={resetError}>
            <i className="bi bi-arrow-clockwise me-1"></i>
            Try Again
          </Button>
          <Button variant="outline-secondary" size="sm" onClick={() => window.location.href = '/home'}>
            <i className="bi bi-house me-1"></i>
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ErrorBoundary;
