import type { ReactNode } from 'react';
import { Component } from 'react';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  message?: string;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error): void {
    console.error('Runtime rendering failure', error);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="fatal-state" role="alert">
          <h1>Something went wrong</h1>
          <p>The editor hit a runtime problem. Refresh the page or reload your project file.</p>
          {this.state.message ? <pre>{this.state.message}</pre> : null}
        </div>
      );
    }

    return this.props.children;
  }
}
