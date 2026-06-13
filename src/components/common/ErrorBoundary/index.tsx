import { Component, type ErrorInfo, type ReactNode } from 'react';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Erro ao renderizar a interface:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <main className="app-fallback">
          <section className="content-card narrow-card glass-panel">
            <p className="eyebrow">Interface</p>
            <h1>Algo quebrou ao carregar a tela.</h1>
            <p className="muted-text">{this.state.error.message}</p>
            <button className="button primary" onClick={() => window.location.reload()}>
              Recarregar
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
