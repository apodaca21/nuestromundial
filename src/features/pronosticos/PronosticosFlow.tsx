import { useEffect, useState } from 'react'
import { MatchDetailScreen } from './MatchDetailScreen'
import { MatchScheduleScreen } from './MatchScheduleScreen'

interface PronosticosFlowProps {
  onDetailOpenChange?: (open: boolean) => void
}

export function PronosticosFlow({ onDetailOpenChange }: PronosticosFlowProps) {
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null)

  useEffect(() => {
    onDetailOpenChange?.(selectedMatchId !== null)
  }, [selectedMatchId, onDetailOpenChange])

  if (selectedMatchId) {
    return (
      <MatchDetailScreen
        matchId={selectedMatchId}
        onBack={() => setSelectedMatchId(null)}
      />
    )
  }

  return <MatchScheduleScreen onSelectMatch={setSelectedMatchId} />
}
