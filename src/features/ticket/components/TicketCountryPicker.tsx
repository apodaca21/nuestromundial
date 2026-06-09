import { TeamFlag } from '../../../components/ui/TeamFlag'
import { getTeamColors } from '../../../lib/teamVisuals'
import { TICKET_COUNTRIES } from '../ticketCountries'

interface TicketCountryPickerProps {
  value: string
  onChange: (code: string) => void
}

export function TicketCountryPicker({ value, onChange }: TicketCountryPickerProps) {
  return (
    <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-5 sm:gap-2">
      {TICKET_COUNTRIES.map((country) => {
        const active = value === country.code
        const colors = getTeamColors(country.code)

        return (
          <button
            key={country.code}
            type="button"
            onClick={() => onChange(country.code)}
            className={`flex w-full min-h-11 flex-col items-center gap-1 rounded-xl border-2 px-1 py-2 touch-manipulation transition-all active:scale-[0.97] ${
              active
                ? 'bg-stone-50 shadow-md'
                : 'border-stone-200 bg-white hover:border-stone-300'
            }`}
            style={
              active
                ? {
                    borderColor: colors.primary,
                    boxShadow: `0 4px 14px ${colors.primary}22`,
                  }
                : undefined
            }
            aria-pressed={active}
            aria-label={country.label}
            title={country.label}
          >
            <TeamFlag
              teamCode={country.code}
              flagEmoji={country.flag}
              size="sm"
              width={36}
              height={24}
              loading="eager"
            />
            <span
              className={`w-full truncate text-center text-[8px] font-bold uppercase leading-tight sm:text-[9px] ${
                active ? 'text-stone-900' : 'text-stone-500'
              }`}
            >
              {country.code}
            </span>
          </button>
        )
      })}
    </div>
  )
}
