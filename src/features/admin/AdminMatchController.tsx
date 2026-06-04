import { useEffect, useState } from 'react'
import { TeamFlag } from '../../components/ui/TeamFlag'
import { formatMatchDateTime } from '../../lib/format'
import { fieldInput } from '../../lib/layout'
import {
  getStoredResult,
  reopenMatch,
  saveMatchResult,
} from '../../lib/tournamentStore'
import type { Match } from '../../types/match'

interface AdminMatchControllerProps {
  match: Match
  onSaved?: () => void
}

export function AdminMatchController({ match, onSaved }: AdminMatchControllerProps) {
  const stored = getStoredResult(match.id)
  const isFinished = match.status === 'finished' && stored !== undefined

  const [homeScore, setHomeScore] = useState(stored?.homeScore ?? 0)
  const [awayScore, setAwayScore] = useState(stored?.awayScore ?? 0)
  const [editing, setEditing] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const home = match.homeTeam
  const away = match.awayTeam

  useEffect(() => {
    const r = getStoredResult(match.id)
    setHomeScore(r?.homeScore ?? 0)
    setAwayScore(r?.awayScore ?? 0)
    setEditing(false)
    setMessage('')
    setError('')
  }, [match.id])

  if (!home || !away) {
    return null
  }

  const readOnly = isFinished && !editing

  const handleSave = () => {
    setError('')
    setMessage('')

    if (homeScore === awayScore) {
      setError('Debe haber un ganador (sin empate en eliminatorias).')
      return
    }

    const result = saveMatchResult({
      matchId: match.id,
      homeScore,
      awayScore,
      homeTeamCode: home.code,
      awayTeamCode: away.code,
    })

    setEditing(false)
    setMessage(
      `Guardado ${result.homeScore}-${result.awayScore}. Ganador: ${result.winner}. Asigna manualmente el siguiente cruce si aplica.`,
    )
    onSaved?.()
  }

  const handleReopen = () => {
    reopenMatch(match.id)
    setEditing(true)
    setMessage('Partido reabierto. Puedes cambiar el marcador.')
    onSaved?.()
  }

  return (
    <section className="rounded-xl bg-[#faf9f7] p-3">
      <h3 className="mb-3 text-sm font-black uppercase text-stone-900">
        2. Marcador
      </h3>
      <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-stone-400">
        {match.phaseLabel}
        {match.matchNumber ? ` · Partido ${match.matchNumber}` : ''}
      </p>
      <p className="mb-1 text-xs text-stone-500">
        {formatMatchDateTime(match.kickoffAt)}
      </p>

      <div className="mb-4 flex items-center justify-center gap-3">
        <div className="flex flex-col items-center gap-1">
          <TeamFlag teamCode={home.code} flagEmoji={home.flagEmoji} size="sm" />
          <span className="text-xs font-black">{home.code}</span>
        </div>
        <span className="text-sm font-black text-stone-400">vs</span>
        <div className="flex flex-col items-center gap-1">
          <TeamFlag teamCode={away.code} flagEmoji={away.flagEmoji} size="sm" />
          <span className="text-xs font-black">{away.code}</span>
        </div>
      </div>

      {readOnly ? (
        <div className="mb-4 rounded-xl bg-stone-50 py-4 text-center">
          <p className="text-3xl font-black text-stone-900">
            {homeScore} – {awayScore}
          </p>
          <p className="mt-1 text-xs font-bold text-[#006847]">
            Final · Ganador {stored?.winnerCode}
          </p>
          {stored?.updatedAt && (
            <p className="mt-1 text-[10px] text-stone-400">
              Actualizado{' '}
              {new Date(stored.updatedAt).toLocaleString('es-MX', {
                dateStyle: 'short',
                timeStyle: 'short',
              })}
            </p>
          )}
        </div>
      ) : (
        <div className="mb-4 grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase text-stone-600">
              Goles {home.name}
            </span>
            <input
              type="number"
              min={0}
              value={homeScore}
              onChange={(e) => setHomeScore(Number(e.target.value))}
              className={`${fieldInput} text-lg font-black`}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase text-stone-600">
            Goles {away.name}
          </span>
          <input
            type="number"
            min={0}
            value={awayScore}
            onChange={(e) => setAwayScore(Number(e.target.value))}
            className={`${fieldInput} text-lg font-black`}
            />
          </label>
        </div>
      )}

      {error && (
        <p className="mb-3 text-xs font-bold text-[#ff004d]">{error}</p>
      )}
      {message && (
        <p className="mb-3 text-xs font-bold text-[#006847]">{message}</p>
      )}

      <div className="flex flex-col gap-2">
        {!readOnly && (
          <button
            type="button"
            onClick={handleSave}
            className="w-full rounded-xl bg-[#6b00ff] py-3 text-sm font-black uppercase tracking-wide text-white"
          >
            {isFinished ? 'Guardar cambios' : 'Guardar resultado'}
          </button>
        )}
        {isFinished && !editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="w-full rounded-xl border border-[#6b00ff] py-3 text-sm font-black uppercase text-[#6b00ff]"
          >
            Editar marcador
          </button>
        )}
        {isFinished && (
          <button
            type="button"
            onClick={handleReopen}
            className="w-full rounded-xl border border-stone-200 py-2 text-xs font-bold uppercase text-stone-500"
          >
            Reabrir partido
          </button>
        )}
      </div>
    </section>
  )
}
