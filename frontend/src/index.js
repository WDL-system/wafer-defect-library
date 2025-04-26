// index.js (Create React App entry point)
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Error Boundary Component
class RootErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div style={{
            backgroundColor: '#f0f0f0',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            margin: '20px',
            textAlign: 'center'
        }}>
          <h2>Something went wrong.</h2>
          <p>Please try refreshing the page.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
if (process.env.NODE_ENV === 'development') {
  root.render(
    <React.StrictMode>
      <RootErrorBoundary>
        <Suspense fallback={<div>Loading...</div>}>
          <App />
        </Suspense>
      </RootErrorBoundary>
    </React.StrictMode>
  );
} else {
  root.render(
    <RootErrorBoundary>
       <Suspense fallback={<div>Loading...</div>}>
        <App />
       </Suspense>
    </RootErrorBoundary>
  );
}
reportWebVitals();
