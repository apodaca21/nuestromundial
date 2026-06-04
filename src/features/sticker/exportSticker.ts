import html2canvas from 'html2canvas'

function waitForImages(element: HTMLElement): Promise<void> {
  const images = [...element.querySelectorAll('img')]
  if (images.length === 0) return Promise.resolve()

  return Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve()
            return
          }
          img.onload = () => resolve()
          img.onerror = () => resolve()
        }),
    ),
  ).then(() => undefined)
}

export async function downloadStickerCard(
  element: HTMLElement,
  filename = 'mi-estampa-nuestromundial.png',
): Promise<void> {
  await waitForImages(element)

  const canvas = await html2canvas(element, {
    scale: 3,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
  })

  const dataUrl = canvas.toDataURL('image/png', 1)
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()
}
