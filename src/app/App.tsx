import { useEffect, useState } from 'react'
import { AuthProvider } from '../context/AuthContext'
import { AppShell } from '../layout/AppShell.tsx'
import { initTournamentStore } from '../lib/tournamentStore'

export default function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    void initTournamentStore().finally(() => setReady(true))
  }, [])

  if (!ready) {
    return (
      <div className="flex min-h-[100dvh] w-full items-center justify-center bg-[#faf9f7] px-safe text-sm font-bold text-stone-500">
        Cargando torneo…
      </div>
    )
  }

  return (
    <AuthProvider>
      <div className="h-[100dvh] max-h-[100dvh] w-full overflow-hidden bg-stone-200/50 md:bg-stone-200">
        <AppShell />
      </div>
    </AuthProvider>
  )
}
