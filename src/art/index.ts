import { aurora } from './aurora'
import { car } from './car'
import { islands } from './islands'
import { jet } from './jet'
import type { Artwork } from './kit'
import { paris } from './paris'
import { penthouse } from './penthouse'
import { retreat } from './retreat'
import { diamond } from './ring'
import { tuscany } from './tuscany'
import { villa } from './villa'
import { watch } from './watch'
import { yacht } from './yacht'

export type { Artwork, Region } from './kit'

const BUILDERS: Record<string, () => Artwork> = {
  villa, retreat, watch, islands, ring: diamond, car, yacht, penthouse, paris, jet, tuscany, aurora,
}

const cache = new Map<string, Artwork>()
export function getArtwork(id: string): Artwork {
  let art = cache.get(id)
  if (!art) {
    const build = BUILDERS[id]
    if (!build) throw new Error(`Unknown artwork ${id}`)
    art = build()
    cache.set(id, art)
  }
  return art
}

export const ARTWORK_IDS = Object.keys(BUILDERS)

/** Realistic palette for an artwork: its unique tones, light → dark. */
export function paletteOf(art: Artwork): string[] {
  const lum = (h: string) => {
    const n = parseInt(h.slice(1), 16)
    return 0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)
  }
  return [...new Set(art.regions.map((r) => r.tone.toUpperCase()))].sort((a, b) => lum(b) - lum(a))
}

export function toSvg(art: Artwork, fills: Record<string, string>, opts: { stroke?: string; width?: number } = {}): string {
  const stroke = opts.stroke ?? '#1E1E20'
  const paths = art.regions
    .map((r) => `<path d="${r.d}" fill="${fills[r.id] ?? '#FFFFFF'}"${r.eo ? ' fill-rule="evenodd"' : ''} stroke="${stroke}" stroke-width="0.9" stroke-linejoin="round"/>`)
    .join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${art.viewBox}"${opts.width ? ` width="${opts.width}"` : ''}>${paths}</svg>`
}

export const referenceFills = (art: Artwork) => Object.fromEntries(art.regions.map((r) => [r.id, r.tone]))
