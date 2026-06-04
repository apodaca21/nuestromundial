import { useEffect, useState } from 'react'
import { getAllTeamsSorted } from '../../data/teams'
import { fieldInput } from '../../lib/layout'
import { assignMatchTeams, getBracketAssignments } from '../../lib/tournamentStore'
import type { Match } from '../../types/match'

interface AdminKnockoutSetupProps {
  match: Match
}

export function AdminKnockoutSetup({ match }: AdminKnockoutSetupProps) {
  const teams = getAllTeamsSorted()
  const slots = getBracketAssignments()[match.id]

  const [homeCode, setHomeCode] = useState(slots?.homeTeamCode ?? '')
  const [awayCode, setAwayCode] = useState(slots?.awayTeamCode ?? '')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const s = getBracketAssignments()[match.id]
    setHomeCode(s?.homeTeamCode ?? '')
    setAwayCode(s?.awayTeamCode ?? '')
    setSaved(false)
  }, [match.id])

  const handleSave = () => {
    if (!homeCode || !awayCode) return
    if (homeCode === awayCode) return
    assignMatchTeams(match.id, homeCode, awayCode)
    setSaved(true)
  }

  const handleClear = () => {
    assignMatchTeams(match.id, null, null)
    setHomeCode('')
    setAwayCode('')
    setSaved(false)
  }

  return (
    <section className="rounded-xl bg-[#faf9f7] p-3">
      <h3 className="mb-1 text-sm font-black uppercase text-stone-900">
        1. Elegir equipos
      </h3>
      <p className="mb-3 text-xs text-stone-500">
        Elige local y visitante. Referencia FIFA:{' '}
        <span className="font-bold">{match.homeLabel}</span> vs{' '}
        <span className="font-bold">{match.awayLabel}</span>
      </p>

      <div className="mb-3 grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase text-stone-500">
            Local
          </span>
          <select
            value={homeCode}
            onChange={(e) => {
              setHomeCode(e.target.value)
              setSaved(false)
            }}
            className={`${fieldInput} border-2 border-stone-300 font-bold`}
          >
            <option value="">— Seleccionar —</option>
            {teams.map((t) => (
              <option key={t.code} value={t.code}>
                {t.name} ({t.code})
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase text-stone-500">
            Visitante
          </span>
          <select
            value={awayCode}
            onChange={(e) => {
              setAwayCode(e.target.value)
              setSaved(false)
            }}
            className={`${fieldInput} border-2 border-stone-300 font-bold`}
          >
            <option value="">— Seleccionar —</option>
            {teams.map((t) => (
              <option key={t.code} value={t.code} disabled={t.code === homeCode}>
                {t.name} ({t.code})
              </option>
            ))}
          </select>
        </label>
      </div>

      {homeCode && awayCode && homeCode === awayCode && (
        <p className="mb-2 text-xs font-bold text-[#ff004d]">
          Local y visitante deben ser distintos.
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          disabled={!homeCode || !awayCode || homeCode === awayCode}
          onClick={handleSave}
          className="flex-1 rounded-xl bg-[#6b00ff] py-3 text-sm font-black uppercase text-white disabled:opacity-40"
        >
          Guardar cruce
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="rounded-xl border border-stone-200 px-3 py-2.5 text-xs font-bold text-stone-500"
        >
          Limpiar
        </button>
      </div>

      {saved && (
        <p className="mt-2 text-xs font-bold text-[#006847]">
          Cruce guardado. Ya puedes registrar el marcador abajo.
        </p>
      )}
    </section>
  )
}
