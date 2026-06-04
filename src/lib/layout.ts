/** Ancho máximo del contenido — misma columna en shell, nav y modales */
export const contentMaxWidth =
  'w-full max-w-[28rem] sm:max-w-lg md:max-w-xl lg:max-w-2xl'

export const appShell = [
  'mx-auto flex min-h-[100dvh] flex-col overflow-x-hidden bg-[#faf9f7]',
  contentMaxWidth,
  'lg:min-h-[100dvh] lg:shadow-2xl lg:ring-1 lg:ring-stone-200/80',
].join(' ')

/** Espacio inferior = barra de tabs + home indicator iPhone */
export const appMain = [
  'min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain',
  'pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))] sm:pb-[calc(4.75rem+env(safe-area-inset-bottom,0px))]',
].join(' ')

export const pageX = 'px-4 sm:px-5 md:px-6'

export const stickyHeader =
  'sticky top-0 z-20 shrink-0 border-b border-stone-200 bg-white/95 backdrop-blur-md pt-[env(safe-area-inset-top,0px)]'

export const navBar = [
  'fixed bottom-0 left-0 right-0 z-30 flex justify-center',
  'border-t border-stone-200 bg-white/95 backdrop-blur-md',
  'pb-[env(safe-area-inset-bottom,0px)]',
].join(' ')

export const navInner = ['flex', contentMaxWidth].join(' ')

export const touchBtn =
  'inline-flex min-h-11 min-w-11 items-center justify-center touch-manipulation active:opacity-80'

/** Inputs ≥16px evitan zoom automático en iOS al enfocar */
export const fieldInput =
  'min-h-11 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-base text-stone-900'
