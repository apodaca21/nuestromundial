import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { ApoWatermark } from '../../components/ApoWatermark'
import { pageX } from '../../lib/layout'
import {
  createBracketPickState,
  type BracketPickState,
} from './bracketEngine'
import { InteractiveBracketTree } from './components/InteractiveBracketTree'
import { GroupDragBoard, GroupLegend } from './components/GroupDragBoard'
import { ThirdPlaceRanking } from './components/ThirdPlaceRanking'
import {
  buildInitialGroups,
  syncThirdPlaceOrder,
} from './groupData'
import {
  generateBracketTree,
  resolveManualStandings,
} from './groupPhaseLogic'
import type { DragStep, GroupStandings, ThirdPlaceEntry } from './types'

const STEPS: { id: DragStep; label: string }[] = [
  { id: 'groups', label: 'Paso 1 · Grupos' },
  { id: 'thirds', label: 'Paso 2 · Terceros' },
  { id: 'bracket', label: 'Paso 3 · Llaves' },
]

function isStepUnlocked(
  step: DragStep,
  groupsConfirmed: boolean,
  hasBracket: boolean,
): boolean {
  if (step === 'groups') return true
  if (step === 'thirds') return groupsConfirmed
  return hasBracket
}

export function GroupPhaseFlow() {
  const [dragStep, setDragStep] = useState<DragStep>('groups')
  const [groupsConfirmed, setGroupsConfirmed] = useState(false)
  const [groups, setGroups] = useState<GroupStandings[]>(() => buildInitialGroups())
  const [thirdPlaceOrder, setThirdPlaceOrder] = useState<ThirdPlaceEntry[]>(() =>
    syncThirdPlaceOrder(buildInitialGroups(), []),
  )
  const [bracketState, setBracketState] = useState<BracketPickState | null>(null)

  useEffect(() => {
    setThirdPlaceOrder((prev) => syncThirdPlaceOrder(groups, prev))
  }, [groups])

  const handleConfirmGroups = () => {
    setGroupsConfirmed(true)
    setDragStep('thirds')
  }

  const handleGenerateBracket = useCallback(() => {
    const result = resolveManualStandings(groups, thirdPlaceOrder)
    const r32 = generateBracketTree(result.classified)
    setBracketState(createBracketPickState(r32))
    setDragStep('bracket')
  }, [groups, thirdPlaceOrder])

  const handleStepChange = (step: DragStep) => {
    if (!isStepUnlocked(step, groupsConfirmed, bracketState !== null)) return
    setDragStep(step)
  }

  const visibleSteps = STEPS.filter((step) =>
    isStepUnlocked(step.id, groupsConfirmed, bracketState !== null),
  )

  return (
    <div className="flex flex-col">
      <ApoWatermark />

      <div className={`${pageX} py-3 pb-8 sm:py-5 sm:pb-10`}>
        <header className="mb-4 text-center sm:mb-5">
          <h1 className="font-display text-3xl tracking-wide text-stone-900 sm:text-4xl">
            BRACKET
          </h1>
          <p className="mt-1 px-2 text-sm text-stone-500">
            Arma grupos, elige terceros y simula el cuadro completo
          </p>
        </header>

        <div
          className="mb-4 flex gap-2"
          role="tablist"
          aria-label="Pasos del bracket"
        >
          {visibleSteps.map((step) => (
            <button
              key={step.id}
              type="button"
              role="tab"
              aria-selected={dragStep === step.id}
              onClick={() => handleStepChange(step.id)}
              className={`min-h-10 flex-1 rounded-xl border px-1.5 py-2 text-[10px] font-black uppercase leading-tight tracking-wide transition sm:text-[11px] ${
                dragStep === step.id
                  ? 'border-[#6b00ff]/40 bg-[#6b00ff]/8 text-[#6b00ff]'
                  : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300'
              }`}
            >
              {step.label}
            </button>
          ))}
        </div>

        {dragStep === 'groups' ? (
          <div className="space-y-4">
            <GroupLegend />
            <GroupDragBoard groups={groups} onGroupsChange={setGroups} />
            <button
              type="button"
              onClick={handleConfirmGroups}
              className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#6b00ff] to-violet-600 px-4 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-[#6b00ff]/30 transition active:scale-[0.98]"
            >
              Confirmar grupos → Rankear terceros
            </button>
          </div>
        ) : null}

        {dragStep === 'thirds' ? (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setDragStep('groups')}
              className="inline-flex items-center gap-1 text-xs font-bold text-stone-500 transition hover:text-[#6b00ff]"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
              Volver a grupos
            </button>

            <div className="rounded-2xl border border-stone-200 bg-white p-3.5 shadow-sm sm:p-4">
              <h2 className="mb-1 text-base font-black uppercase tracking-tight text-stone-900">
                Zona de supervivencia
              </h2>
              <p className="mb-4 text-xs leading-snug text-stone-500">
                Ordena a los 12 terceros lugares de mejor a peor. Solo los
                primeros 8 siguen vivos.
              </p>
              <ThirdPlaceRanking
                order={thirdPlaceOrder}
                onOrderChange={setThirdPlaceOrder}
              />
            </div>

            <button
              type="button"
              onClick={handleGenerateBracket}
              className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-4 text-sm font-black uppercase tracking-wide text-amber-950 shadow-lg shadow-amber-500/35 transition active:scale-[0.98]"
            >
              Confirmar terceros → Ver llaves
            </button>
          </div>
        ) : null}

        {dragStep === 'bracket' && bracketState ? (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setDragStep('thirds')}
              className="inline-flex items-center gap-1 text-xs font-bold text-stone-500 transition hover:text-[#6b00ff]"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
              Volver a terceros
            </button>

            <InteractiveBracketTree
              state={bracketState}
              onStateChange={setBracketState}
            />

            <button
              type="button"
              onClick={handleGenerateBracket}
              className="flex min-h-11 w-full items-center justify-center rounded-xl border border-stone-200 bg-white text-xs font-black uppercase tracking-wide text-stone-600 transition hover:border-[#6b00ff]/35 hover:text-[#6b00ff]"
            >
              Reiniciar llaves
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
