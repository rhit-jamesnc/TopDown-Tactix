import { Component } from 'react';
import type { ErrorInfo, } from 'react';
import type { ErrorBoundaryState, ErrorBoundaryProp } from '../../../../../shared/types/props';


export class ErrorBoundary extends Component<ErrorBoundaryProp, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.log('Error: ' + error);
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="error-panel">
          <p>{this.props.fallbackMessage}</p>
        </div>
      );
    }
    return this.props.children;
  }
}