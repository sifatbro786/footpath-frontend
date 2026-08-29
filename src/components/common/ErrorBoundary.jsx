import { Component } from "react";

/**
 * Top-level crash guard.
 *
 * React unmounts the entire tree when a render throws, so without this a single
 * bad product payload blanks the whole site. Class component because error
 * boundaries have no hooks equivalent.
 *
 * Phase 10 wires `componentDidCatch` to Sentry.
 */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        // Kept as console for now — replaced by a real reporter in Phase 10.
        console.error("Uncaught render error:", error, info?.componentStack);
    }

    handleReload = () => {
        // Full reload rather than setState: whatever state caused the throw is
        // still in memory, so re-rendering the same tree usually throws again.
        window.location.reload();
    };

    render() {
        if (!this.state.hasError) return this.props.children;

        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4 py-16 text-center">
                <span className="font-label text-xs uppercase tracking-[0.28em] text-muted">
                    Something went wrong
                </span>
                <h1 className="mt-4 font-display text-3xl font-semibold text-ink sm:text-4xl">
                    This page didn&apos;t load
                </h1>
                <p className="mt-3 max-w-md text-sm text-ink-soft">
                    An unexpected error stopped the page from rendering. Reloading usually clears
                    it.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <button
                        type="button"
                        onClick={this.handleReload}
                        className="inline-flex items-center justify-center rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-paper transition-colors hover:bg-brand-dark"
                    >
                        Reload the page
                    </button>
                    <a
                        href="/"
                        className="inline-flex items-center justify-center rounded-lg border border-line bg-paper px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-ink/30 hover:bg-paper-dim"
                    >
                        Back to home
                    </a>
                </div>
            </div>
        );
    }
}

export default ErrorBoundary;
