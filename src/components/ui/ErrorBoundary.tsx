import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message || 'Erro inesperado.' };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B0B0D] text-[#F5F2EB] flex items-center justify-center p-6">
          <div className="max-w-lg w-full rounded-xl border border-white/10 bg-[#131317] p-8 space-y-4">
            <h2 className="font-display text-2xl font-semibold text-[#F5F2EB]">
              Ocorreu uma instabilidade momentânea
            </h2>
            <p className="text-sm text-[#A19E95] leading-relaxed">
              Não foi possível concluir a operação solicitada. Você pode recarregar a página para tentar novamente.
            </p>
            <pre className="text-xs text-[#A19E95] bg-black/40 border border-white/10 rounded-lg p-3 overflow-auto max-h-36">
              {this.state.message}
            </pre>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-lg bg-[#C6A15B] text-[#0B0B0D] text-sm font-semibold hover:bg-[#D8B573] transition-colors"
            >
              Recarregar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
