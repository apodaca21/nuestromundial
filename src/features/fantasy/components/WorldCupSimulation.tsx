import { Trophy } from 'lucide-react'
import { useState } from 'react'
import {
  simulateFantasyWorldCup,
  type WorldCupSimulationResult,
} from '../fantasyWorldCupSim'

interface WorldCupSimulationProps {
  teamRating: number
}

function MatchRow({
  match,
}: {
  match: WorldCupSimulationResult['groupMatches'][number]
}) {
  const resultColor =
    match.outcome === 'W'
      ? 'text-emerald-700'
      : match.outcome === 'D'
        ? 'text-amber-700'
        : 'text-rose-700'

  return (
    <li className="flex items-center justify-between gap-2 rounded-lg bg-white/80 px-3 py-2 text-sm">
      <span className="min-w-0 truncate text-stone-700">
        <span className="mr-1">{match.opponentFlag}</span>
        {match.opponentName}
      </span>
      <span className="shrink-0 font-bold text-stone-900">
        {match.userScore}-{match.opponentScore}
      </span>
      <span className={`shrink-0 text-xs font-bold uppercase ${resultColor}`}>
        {match.outcome === 'W' ? 'G' : match.outcome === 'D' ? 'E' : 'P'}
      </span>
    </li>
  )
}

export function WorldCupSimulation({ teamRating }: WorldCupSimulationProps) {
  const [result, setResult] = useState<WorldCupSimulationResult | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)

  const handleSimulate = () => {
    setIsSimulating(true)
    window.setTimeout(() => {
      setResult(simulateFantasyWorldCup(teamRating))
      setIsSimulating(false)
    }, 600)
  }

  return (
    <div className="mx-auto w-full max-w-lg rounded-2xl border border-[#6b00ff]/20 bg-gradient-to-b from-[#f8f4ff] to-white p-5 shadow-lg shadow-[#6b00ff]/10">
      <h3 className="text-center font-display text-2xl tracking-wide text-stone-900">
        Simulador Mundial
      </h3>
      <p className="mt-1 text-center text-sm text-stone-500">
        Tu 11 enfrenta selecciones simuladas en un Mundial completo
      </p>

      {!result ? (
        <button
          type="button"
          onClick={handleSimulate}
          disabled={isSimulating}
          className="mt-4 flex w-full min-h-12 items-center justify-center gap-2 rounded-xl bg-[#6b00ff] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[#6b00ff]/25 transition-transform active:scale-[0.98] disabled:opacity-70"
        >
          <Trophy className="h-5 w-5" aria-hidden />
          {isSimulating ? 'Simulando partidos...' : 'Simular mi Mundial'}
        </button>
      ) : (
        <div className="mt-4 space-y-4">
          <div
            className={`rounded-xl px-4 py-5 text-center ${
              result.exitStage === 'champion'
                ? 'bg-gradient-to-br from-amber-100 to-yellow-50 ring-2 ring-amber-300/60'
                : 'bg-white ring-1 ring-stone-200'
            }`}
          >
            <p className="text-4xl">{result.stageEmoji}</p>
            <p className="mt-2 font-display text-xl tracking-wide text-stone-900 sm:text-2xl">
              {result.stageLabel}
            </p>
            <p className="mt-1 text-xs text-stone-500">
              Poder del equipo: {result.userPower}/100
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-stone-500">
              Fase de grupos · {result.groupPoints} pts
            </p>
            <ul className="space-y-1.5">
              {result.groupMatches.map((match) => (
                <MatchRow key={`${match.opponentCode}-${match.phase}`} match={match} />
              ))}
            </ul>
          </div>

          {result.knockoutMatches.length > 0 ? (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-stone-500">
                Eliminatorias
              </p>
              <ul className="space-y-1.5">
                {result.knockoutMatches.map((match) => (
                  <li key={`${match.phase}-${match.opponentCode}`}>
                    <p className="mb-1 text-[0.65rem] font-semibold uppercase text-[#6b00ff]">
                      {match.phase}
                    </p>
                    <MatchRow match={match} />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => {
              setResult(null)
              handleSimulate()
            }}
            className="w-full min-h-11 rounded-xl border border-[#6b00ff]/30 bg-white px-4 py-2.5 text-sm font-bold text-[#6b00ff] transition-colors hover:bg-[#6b00ff]/5"
          >
            Simular de nuevo
          </button>
        </div>
      )}
    </div>
  )
}
