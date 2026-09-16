import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('[ErrorBoundary]', error.message);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-ox-gold/20 bg-ox-gold/5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ox-gold-soft">
              <path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[15px] font-semibold text-white">Something went wrong</p>
            <p className="mt-1 text-[13px] text-white/40">An unexpected error occurred. Try reloading.</p>
          </div>
          <button
            onClick={this.handleReset}
            className="pressable rounded-xl border border-ox-gold/30 bg-ox-gold/10 px-5 py-2.5 text-[13px] font-medium text-ox-gold-soft transition-all hover:bg-ox-gold/20"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
