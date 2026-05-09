import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("Unhandled app error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4 dark:bg-slate-950">
          <div className="max-w-md rounded-lg bg-white p-6 shadow dark:bg-slate-900 dark:text-slate-100">
            <h2 className="text-xl font-semibold">Something went wrong</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              The page crashed unexpectedly. Please refresh and try again.
            </p>
            <button className="mt-4 rounded bg-blue-600 px-4 py-2 text-white" onClick={() => window.location.reload()}>
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
