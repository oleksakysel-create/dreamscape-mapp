/**
 * Renders a shareable image of a dream — the person's own words, or the photo
 * of the dream that came true — and hands it to the native share sheet
 * (falls back to a download on desktop).
 */
export type ShareFormat = 'story' | 'square' | 'wallpaper'

export const FORMATS: Record<ShareFormat, { w: number; h: number; label: string }> = {
  story: { w: 1080, h: 1920, label: 'Story' },
  square: { w: 1080, h: 1080, label: 'Square' },
  wallpaper: { w: 1170, h: 2532, label: 'Wallpaper' },
}

export const ACCENT = '#9CCBF0'
const INK = '#0B0B0C'
const PAPER = '#F2F1EE'
const MUTE = '#8C8A86'

export interface ShareInput {
  format: ShareFormat
  dream: string
  phrase: string
  meta: string
  photo?: Blob | null
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = w
    } else line = test
  }
  if (line) lines.push(line)
  return lines
}

/** Largest font size (≤ max) at which the text fits in `maxLines`. */
function fit(ctx: CanvasRenderingContext2D, text: string, width: number, max: number, maxLines: number, weight = 500) {
  for (let size = max; size > 24; size -= 4) {
    ctx.font = `${weight} ${size}px Inter, -apple-system, sans-serif`
    const lines = wrap(ctx, text, width)
    if (lines.length <= maxLines) return { size, lines }
  }
  ctx.font = `${weight} 24px Inter, sans-serif`
  return { size: 24, lines: wrap(ctx, text, width).slice(0, maxLines) }
}

export async function renderShare({ format, dream, phrase, meta, photo }: ShareInput): Promise<Blob> {
  const { w, h } = FORMATS[format]
  await Promise.all(['500 64px Inter', '600 64px Inter', '700 64px Inter'].map((f) => document.fonts?.load(f).catch(() => undefined)))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  const pad = Math.round(w * 0.085)
  ctx.fillStyle = INK
  ctx.fillRect(0, 0, w, h)
  ctx.textBaseline = 'alphabetic'

  if (photo) {
    const bmp = await createImageBitmap(photo)
    const ph = Math.round(h * (format === 'square' ? 0.74 : 0.76))
    const scale = Math.max(w / bmp.width, ph / bmp.height)
    const dw = bmp.width * scale
    const dh = bmp.height * scale
    ctx.drawImage(bmp, (w - dw) / 2, (ph - dh) / 2, dw, dh)
    // text lives below the photo, never on it
    let y = ph + Math.round(h * 0.06)
    ctx.fillStyle = PAPER
    ctx.font = `600 ${Math.round(w * 0.062)}px Inter, sans-serif`
    ctx.fillText(dream, pad, y)
    ctx.fillStyle = ACCENT
    ctx.font = `600 ${Math.round(w * 0.026)}px Inter, sans-serif`
    const tag = 'CAME TRUE'
    ctx.fillText(tag, w - pad - ctx.measureText(tag).width, y - Math.round(w * 0.012))
    if (phrase && format !== 'square') {
      y += Math.round(h * 0.045)
      const { size, lines } = fit(ctx, `“${phrase}”`, w - pad * 2, Math.round(w * 0.034), 3, 400)
      ctx.fillStyle = '#C9C7C2'
      lines.forEach((l, i) => ctx.fillText(l, pad, y + i * size * 1.4))
    }
  } else {
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(w, h) * 0.95)
    g.addColorStop(0, '#26262A')
    g.addColorStop(0.55, '#141416')
    g.addColorStop(1, INK)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    const top = Math.round(h * (format === 'square' ? 0.14 : 0.22))
    ctx.fillStyle = MUTE
    ctx.font = `600 ${Math.round(w * 0.024)}px Inter, sans-serif`
    ctx.fillText(meta.toUpperCase(), pad, top)
    ctx.fillStyle = ACCENT
    ctx.font = `600 ${Math.round(w * 0.16)}px Inter, sans-serif`
    ctx.fillText('“', pad - 6, top + Math.round(w * 0.17))
    const text = phrase || dream
    const { size, lines } = fit(ctx, text, w - pad * 2, Math.round(w * (format === 'square' ? 0.07 : 0.082)), format === 'square' ? 6 : 8)
    ctx.fillStyle = PAPER
    const y0 = top + Math.round(w * 0.24)
    lines.forEach((l, i) => ctx.fillText(l, pad, y0 + i * size * 1.22))
    ctx.fillStyle = MUTE
    ctx.font = `500 ${Math.round(w * 0.03)}px Inter, sans-serif`
    ctx.fillText(dream, pad, h - pad)
  }
  ctx.fillStyle = ACCENT
  ctx.font = `700 ${Math.round(w * 0.022)}px Inter, sans-serif`
  const mark = 'DREAMSCAPE'
  ctx.fillText(mark, w - pad - ctx.measureText(mark).width, h - pad)

  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('render failed'))), 'image/png'))
}

/** Native share sheet with the image; download as a fallback. Returns how it was delivered. */
export async function shareImage(blob: Blob, filename: string, title: string): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const file = new File([blob], filename, { type: blob.type })
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean }
  if (nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title })
      return 'shared'
    } catch {
      return 'cancelled'
    }
  }
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 2000)
  return 'downloaded'
}
