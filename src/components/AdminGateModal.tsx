import { useState } from 'react'
import { contentMaxWidth, fieldInput } from '../lib/layout'
import { verifyAdminPassword } from '../lib/adminAccess'

interface AdminGateModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AdminGateModal({ open, onClose, onSuccess }: AdminGateModalProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (verifyAdminPassword(password)) {
      setError('')
      setPassword('')
      onSuccess()
      return
    }
    setError('Contraseña incorrecta')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/50 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-center sm:px-safe"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-gate-title"
    >
      <form
        onSubmit={handleSubmit}
        className={`max-h-[90dvh] w-full overflow-y-auto rounded-2xl border border-stone-200 bg-white p-5 shadow-lg sm:max-h-none ${contentMaxWidth}`}
      >
        <h2
          id="admin-gate-title"
          className="mb-1 text-base font-black uppercase tracking-tight text-stone-900"
        >
          Acceso admin
        </h2>
        <p className="mb-4 text-sm text-stone-500">
          Ingresa la contraseña para controlar resultados y el bracket.
        </p>

        <label className="mb-3 flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase text-stone-400">
            Contraseña
          </span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError('')
            }}
            className={fieldInput}
            autoFocus
          />
        </label>

        {error && (
          <p className="mb-3 text-sm font-bold text-[#ff004d]">{error}</p>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 flex-1 rounded-xl border border-stone-200 text-base font-bold text-stone-600"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="min-h-11 flex-1 rounded-xl bg-[#6b00ff] text-base font-black uppercase text-white"
          >
            Entrar
          </button>
        </div>
      </form>
    </div>
  )
}
