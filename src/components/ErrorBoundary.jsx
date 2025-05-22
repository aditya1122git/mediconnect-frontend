import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error("Error caught by ErrorBoundary:", error);
    console.error("Component stack:", errorInfo.componentStack);
    
    // Update state with error details
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="error-container" style={{
          padding: '20px',
          margin: '20px',
          borderRadius: '5px',
          backgroundColor: '#fff0f0',
          border: '1px solid #ffcccc'
        }}>
          <h1 style={{ color: '#cc0000' }}>Something went wrong</h1>
          
          {/* Environment check - only show details in development */}
          {process.env.NODE_ENV !== 'production' && (
            <div>
              <h2>Error Details:</h2>
              <p style={{ color: '#333' }}>{this.state.error && this.state.error.toString()}</p>
              
              <h3>Component Stack:</h3>
              <pre style={{ 
                backgroundColor: '#f5f5f5', 
                padding: '10px', 
                overflow: 'auto',
                maxHeight: '300px',
                fontSize: '14px',
                lineHeight: '1.4'
              }}>
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
              
              <div style={{ marginTop: '20px' }}>
                <button 
                  onClick={() => window.location.reload()} 
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#0066cc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Reload Application
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    // If there's no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;