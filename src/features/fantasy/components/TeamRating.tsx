import { getRatingMessage } from '../fantasyDraftLogic'

interface TeamRatingProps {
  rating: number
}

export function TeamRating({ rating }: TeamRatingProps) {
  const message = getRatingMessage(rating)

  return (
    <div className="text-center">
      <h2 className="font-display text-3xl tracking-wide text-stone-900 sm:text-4xl">
        Rating del Equipo: {rating} ⭐
      </h2>
      <p className="mt-2 text-base font-semibold text-[#6b00ff] sm:text-lg">
        {message}
      </p>
    </div>
  )
}
