const BAR_PATTERN = [
  2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 2, 1, 4, 2, 1, 3, 2, 1, 2, 3, 1,
  4, 1, 2, 1, 3, 2, 4, 1, 2, 3, 1, 2, 1, 3, 2, 1, 4, 2, 3, 1, 2, 1, 3, 2,
]

export function TicketBarcode() {
  return (
    <div
      className="flex h-10 w-full max-w-[14rem] items-end justify-center gap-[2px] opacity-90 sm:h-12"
      aria-hidden
    >
      {BAR_PATTERN.map((w, i) => (
        <span
          key={i}
          className="h-full bg-white"
          style={{ width: `${w}px` }}
        />
      ))}
    </div>
  )
}
