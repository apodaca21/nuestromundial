import { forwardRef, useMemo } from 'react'
import { getFlagUrl } from '../../../lib/teamVisuals'
import { getTicketBackgroundTheme } from '../ticketBackground'
import type { TicketCountry } from '../ticketCountries'
import { TicketBarcode } from './TicketBarcode'

interface TicketCanvasProps {
  country: TicketCountry
  playerName: string
  playerImageSrc: string | null
}

export const TicketCanvas = forwardRef<HTMLDivElement, TicketCanvasProps>(
  function TicketCanvas({ country, playerName, playerImageSrc }, ref) {
    const flagSrc = getFlagUrl(country.code, 80)
    const theme = useMemo(
      () => getTicketBackgroundTheme(country.code),
      [country.code],
    )

    return (
      <div className="mx-auto w-full max-w-[min(18rem,100%)] sm:max-w-xs">
        <div
          ref={ref}
          data-ticket-export
          data-country-code={country.code}
          className="relative aspect-[9/16] w-full overflow-hidden rounded-2xl shadow-xl"
          style={{
            backgroundColor: theme.base,
            boxShadow: `0 0 0 1px ${theme.ring}, 0 20px 40px rgba(0,0,0,0.35)`,
          }}
        >
          <div
            className="absolute inset-0"
            style={{ backgroundImage: theme.backgroundImage }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.55)_100%)]"
            aria-hidden
          />

          {[0.22, 0.5, 0.78].map((top) => (
            <span key={`notch-${top}`}>
              <span
                className="absolute left-0 h-5 w-5 -translate-x-1/2 rounded-full bg-[#faf9f7]"
                style={{ top: `${top * 100}%` }}
                aria-hidden
              />
              <span
                className="absolute right-0 h-5 w-5 translate-x-1/2 rounded-full bg-[#faf9f7]"
                style={{ top: `${top * 100}%` }}
                aria-hidden
              />
            </span>
          ))}

          <div className="relative flex h-full flex-col px-5 py-6 text-white sm:px-6 sm:py-7">
            <header className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-zinc-500 sm:text-[11px]">
                FIFA World Cup
              </p>
              <h2 className="mt-1 font-display text-2xl tracking-wide text-zinc-100 sm:text-3xl">
                26 VIP Pass
              </h2>
              <div
                className="mx-auto mt-3 h-px w-20"
                style={{ backgroundColor: theme.accentLine }}
              />
            </header>

            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-1">
              <div
                className="h-[7.5rem] w-[5.5rem] shrink-0 overflow-hidden rounded-lg border-2 bg-zinc-950/80 shadow-inner sm:h-32 sm:w-[6.25rem]"
                style={{ borderColor: theme.playerBorder }}
              >
                {playerImageSrc ? (
                  <img
                    src={playerImageSrc}
                    alt={playerName}
                    data-ticket-player
                    className="h-full w-full object-cover object-center"
                    crossOrigin="anonymous"
                    draggable={false}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center px-2 text-center text-[8px] font-bold uppercase leading-tight tracking-wider text-zinc-600">
                    Elige jugador
                  </div>
                )}
              </div>

              <div
                className="w-full overflow-hidden rounded-xl border backdrop-blur-sm"
                style={{
                  borderColor: theme.playerBorder,
                  backgroundColor: theme.panelBg,
                }}
              >
                <div className="grid grid-cols-2">
                  <div
                    className="flex flex-col items-center gap-1.5 border-r border-dashed px-2 py-3.5 text-center sm:px-3 sm:py-4"
                    style={{ borderColor: theme.playerBorder }}
                  >
                    <img
                      src={flagSrc}
                      alt=""
                      data-team-code={country.code}
                      className="h-6 w-9 rounded-sm object-cover ring-1 ring-white/15"
                      crossOrigin="anonymous"
                      draggable={false}
                    />
                    <p className="text-[7px] font-bold uppercase tracking-[0.24em] text-zinc-500 sm:text-[8px]">
                      Apoyando
                    </p>
                    <p className="font-display text-base uppercase leading-none tracking-wide text-zinc-100 sm:text-lg">
                      {country.label}
                    </p>
                  </div>

                  <div className="flex flex-col items-center justify-center gap-1.5 px-2 py-3.5 text-center sm:px-3 sm:py-4">
                    <span
                      className="inline-flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-black"
                      style={{
                        borderColor: theme.accentLine,
                        color: theme.accentLine,
                      }}
                      aria-hidden
                    >
                      ★
                    </span>
                    <p className="text-[7px] font-bold uppercase tracking-[0.24em] text-zinc-500 sm:text-[8px]">
                      A seguir
                    </p>
                    <p className="max-w-[6.5rem] font-display text-base font-black uppercase leading-tight tracking-wide text-zinc-100 sm:max-w-[7rem] sm:text-lg">
                      {playerName || '—'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <footer className="mt-auto space-y-3 border-t border-dashed border-zinc-700 pt-4">
              <div className="flex justify-between text-[8px] font-bold uppercase tracking-[0.16em] text-zinc-500 sm:text-[9px]">
                <span>Gate: 2026</span>
                <span>Seat: VIP</span>
                <span>Class: WC</span>
              </div>

              <div className="flex justify-center">
                <TicketBarcode />
              </div>

              <p className="text-center font-mono text-[7px] uppercase tracking-widest text-zinc-600 sm:text-[8px]">
                NM26-{country.code}-VIP-001
              </p>

              <div className="space-y-0.5 pt-1 text-center text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                <p>@apo.webs</p>
                <p>nuestromundial.com</p>
              </div>
            </footer>
          </div>
        </div>
      </div>
    )
  },
)
