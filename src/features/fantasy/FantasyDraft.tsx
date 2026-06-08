import { useCallback, useEffect, useMemo, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { pageX } from '../../lib/layout'
import { POSITIONS } from './draftData'
import { getPositionById } from './draftPositions'
import {
  calcTeamRating,
  pickRandomOptions,
} from './fantasyDraftLogic'
import type { DraftPlayer, PackState, SelectedPlayer } from './types'
import { DraftLobby } from './components/DraftLobby'
import { DraftPitch } from './components/DraftPitch'
import { InteractiveDraftPitch } from './components/InteractiveDraftPitch'
import { TeamRating } from './components/TeamRating'
import { WorldCupSimulation } from './components/WorldCupSimulation'

const TOTAL_PICKS = POSITIONS.length

export function FantasyDraft() {
  const [hasStarted, setHasStarted] = useState(false)
  const [activePositionId, setActivePositionId] = useState<string | null>(null)
  const [packState, setPackState] = useState<PackState>('IDLE')
  const [openingPhase, setOpeningPhase] = useState<'early' | 'late'>('early')
  const [currentOptions, setCurrentOptions] = useState<DraftPlayer[]>([])
  const [selectedByPosition, setSelectedByPosition] = useState<
    Record<string, SelectedPlayer>
  >({})

  const selectedTeam = useMemo(
    () => Object.values(selectedByPosition),
    [selectedByPosition],
  )
  const filledCount = selectedTeam.length
  const isComplete = filledCount === TOTAL_PICKS

  const activePosition = activePositionId
    ? getPositionById(activePositionId)
    : undefined

  const handlePackClick = useCallback(
    (positionId: string) => {
      if (selectedByPosition[positionId]) return
      if (activePositionId !== null) return

      setActivePositionId(positionId)
      setOpeningPhase('early')
      setPackState('OPENING')
    },
    [selectedByPosition, activePositionId],
  )

  useEffect(() => {
    if (packState !== 'OPENING' || !activePositionId) return

    const phaseTimer = window.setTimeout(() => {
      setOpeningPhase('late')
    }, 500)

    const revealTimer = window.setTimeout(() => {
      const position = getPositionById(activePositionId)
      if (position) {
        setCurrentOptions(pickRandomOptions(position.players))
      }
      setPackState('REVEALED')
    }, 1000)

    return () => {
      window.clearTimeout(phaseTimer)
      window.clearTimeout(revealTimer)
    }
  }, [packState, activePositionId])

  const handleSelectPlayer = useCallback(
    (player: DraftPlayer) => {
      if (!activePositionId || !activePosition || packState !== 'REVEALED') return

      setSelectedByPosition((prev) => ({
        ...prev,
        [activePositionId]: {
          ...player,
          positionId: activePosition.id,
          positionName: activePosition.name,
        },
      }))
      setCurrentOptions([])
      setActivePositionId(null)
      setPackState('IDLE')
      setOpeningPhase('early')
    },
    [activePositionId, activePosition, packState],
  )

  const handlePlayAgain = useCallback(() => {
    setHasStarted(false)
    setActivePositionId(null)
    setPackState('IDLE')
    setOpeningPhase('early')
    setCurrentOptions([])
    setSelectedByPosition({})
  }, [])

  const handleStart = useCallback(() => {
    setHasStarted(true)
  }, [])

  const teamRating = calcTeamRating(selectedTeam)

  return (
    <div className={`${pageX} py-6 sm:py-8`}>
      <header className="mb-4 text-center">
        <h1 className="font-display text-3xl tracking-wide text-stone-900 sm:text-4xl">
          Fantasy Draft
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          Arma tu 11 inicial abriendo sobres
        </p>
      </header>

      {!hasStarted ? (
        <DraftLobby onStart={handleStart} />
      ) : isComplete ? (
        <div className="flex flex-col gap-6">
          <TeamRating rating={teamRating} />
          <WorldCupSimulation teamRating={teamRating} />
          <DraftPitch selectedTeam={selectedTeam} />
          <button
            type="button"
            onClick={handlePlayAgain}
            className="mx-auto inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#6b00ff] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#6b00ff]/25 transition-transform active:scale-[0.98]"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Jugar de nuevo
          </button>
        </div>
      ) : (
        <InteractiveDraftPitch
          selectedByPosition={selectedByPosition}
          activePositionId={activePositionId}
          packState={packState}
          openingPhase={openingPhase}
          currentOptions={currentOptions}
          activePositionName={activePosition?.name ?? null}
          onPackClick={handlePackClick}
          onSelectPlayer={handleSelectPlayer}
        />
      )}
    </div>
  )
}
