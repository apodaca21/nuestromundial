import { useEffect, useMemo, useRef, useState } from 'react'
import { useScheduleTick } from '../../hooks/useScheduleTick'
import { useStoreSubscription } from '../../hooks/useStoreSubscription'
import { lockAdmin } from '../../lib/adminAccess'
import { isSupabaseConfigured } from '../../services/persistence/supabasePersistence'
import {
  canAdminConfigureMatch,
  canAdminControlMatch,
  getAllMatches,
  groupMatchesByPhase,
  isKnockoutPhase,
  matchHasBothTeams,
} from '../../lib/schedule'
import {
  getTournamentRevision,
  subscribeTournament,
} from '../../lib/tournamentStore'
import { pageX } from '../../lib/layout'
import { AdminKnockoutSetup } from './AdminKnockoutSetup'
import { AdminMatchController } from './AdminMatchController'

interface AdminScreenProps {
  onExit?: () => void
}

export function AdminScreen({ onExit }: AdminScreenProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const editorRef = useRef<HTMLDivElement | null>(null)
  const now = useScheduleTick()
  const tournamentRev = useStoreSubscription(
    subscribeTournament,
    getTournamentRevision,
  )

  const matches = useMemo(
    () => getAllMatches(now),
    [now, tournamentRev],
  )

  const phaseGroups = useMemo(() => groupMatchesByPhase(matches), [matches])

  const finished = useMemo(
    () =>
      matches.filter((m) => m.status === 'finished' && m.homeScore !== undefined),
    [matches],
  )

  const pendingKo = matches.filter(
    (m) => isKnockoutPhase(m.phase) && !matchHasBothTeams(m),
  ).length

  const handleSelect = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id))
  }

  useEffect(() => {
    if (!selectedId) return
    const t = window.setTimeout(() => {
      editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 80)
    return () => window.clearTimeout(t)
  }, [selectedId])

  return (
    <div className={`${pageX} py-4 pb-8 sm:py-5`}>
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h1 className="text-xl font-black uppercase tracking-tighter text-stone-900">
            Control de partidos
          </h1>
          <p className="mt-1 text-xs text-stone-500">
            Toca un partido de la lista y justo abajo elige local, visitante y
            marcador.
          </p>
          <p className="mt-1 text-[10px] font-bold uppercase text-stone-400">
            Almacenamiento:{' '}
            {isSupabaseConfigured() ? 'local + Supabase (pendiente sync)' : 'local'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            lockAdmin()
            onExit?.()
          }}
          className="shrink-0 rounded-lg border border-stone-200 px-2 py-1 text-[10px] font-bold uppercase text-stone-500"
        >
          Salir
        </button>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl border border-stone-200 bg-white py-2">
          <p className="text-lg font-black text-[#6b00ff]">{pendingKo}</p>
          <p className="text-[10px] font-bold uppercase text-stone-400">Sin cruce</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white py-2">
          <p className="text-lg font-black text-stone-700">
            {matches.filter(canAdminControlMatch).length}
          </p>
          <p className="text-[10px] font-bold uppercase text-stone-400">Activos</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white py-2">
          <p className="text-lg font-black text-stone-600">{finished.length}</p>
          <p className="text-[10px] font-bold uppercase text-stone-400">Finales</p>
        </div>
      </div>

      {!selectedId && (
        <p className="mb-4 rounded-xl border border-[#6b00ff]/30 bg-[#6b00ff]/5 px-4 py-3 text-center text-sm font-bold text-[#6b00ff]">
          ↓ Toca un partido para abrir los selectores de equipos
        </p>
      )}

      <h2 className="mb-2 text-xs font-black uppercase tracking-widest text-stone-400">
        Todos los partidos
      </h2>

      <div className="space-y-4">
        {phaseGroups.map((group) => (
          <div key={group.phase}>
            <h3 className="mb-2 text-sm font-black uppercase text-stone-800">
              {group.label}
            </h3>
            <ul className="space-y-2">
              {group.matches.map((m) => {
                const configured = matchHasBothTeams(m)
                const isFinished = m.status === 'finished'
                const isSelected = m.id === selectedId

                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(m.id)}
                      className={`w-full rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${
                        isSelected
                          ? 'border-[#6b00ff] bg-[#6b00ff]/10 ring-2 ring-[#6b00ff]/30'
                          : 'border-stone-200 bg-white'
                      }`}
                    >
                      {configured ? (
                        <span className="font-bold text-stone-800">
                          {m.homeTeam?.name} vs {m.awayTeam?.name}
                        </span>
                      ) : (
                        <span className="font-bold text-stone-500">
                          {m.homeLabel ?? 'Local'} vs {m.awayLabel ?? 'Visitante'}
                        </span>
                      )}
                      {m.matchNumber && (
                        <span className="ml-2 text-[10px] text-stone-400">
                          #{m.matchNumber}
                        </span>
                      )}
                      {isFinished && m.homeScore !== undefined && (
                        <span className="mt-1 block text-xs font-black text-[#006847]">
                          Final {m.homeScore}–{m.awayScore}
                        </span>
                      )}
                      {!configured && isKnockoutPhase(m.phase) && !isSelected && (
                        <span className="mt-1 block text-[10px] font-bold text-[#6b00ff]">
                          Toca para asignar equipos
                        </span>
                      )}
                      {isSelected && (
                        <span className="mt-1 block text-[10px] font-black uppercase text-[#6b00ff]">
                          ▼ Configura abajo
                        </span>
                      )}
                    </button>

                    {isSelected && (
                      <div
                        ref={editorRef}
                        className="mt-2 space-y-3 rounded-xl border-2 border-[#6b00ff] bg-white p-3 shadow-sm"
                      >
                        {canAdminConfigureMatch(m) && (
                          <AdminKnockoutSetup match={m} />
                        )}
                        {matchHasBothTeams(m) ? (
                          <AdminMatchController match={m} />
                        ) : (
                          <p className="text-center text-sm text-stone-600">
                            Elige <strong>local</strong> y <strong>visitante</strong>{' '}
                            en los menús de arriba, luego pulsa{' '}
                            <strong>Guardar cruce</strong>.
                          </p>
                        )}
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
