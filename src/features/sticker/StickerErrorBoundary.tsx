import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  message: string
}

export class StickerErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message || 'Error inesperado',
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[StickerGenerator]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-4 my-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-center">
          <p className="text-sm font-black uppercase text-red-800">
            Algo falló con la estampa
          </p>
          <p className="mt-2 text-xs text-red-700">{this.state.message}</p>
          <button
            type="button"
            className="mt-4 rounded-xl bg-[#6b00ff] px-4 py-2 text-xs font-bold uppercase text-white"
            onClick={() => this.setState({ hasError: false, message: '' })}
          >
            Reintentar
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
