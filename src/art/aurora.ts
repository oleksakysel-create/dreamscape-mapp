import { band, ellipse, flat, Page, pine, poly, profile, sector, sparkle, wave } from './kit'

/** Glass igloo under the northern lights. */
export function aurora() {
  const p = new Page('a')
  p.add(band(flat(0), wave(90, 3, 1)), '#0B1330')
  p.add(band(wave(90, 3, 1), wave(170, 3, 1, 1)), '#12224A')
  p.add(band(wave(170, 3, 1, 1), flat(250)), '#1B3560')
  // aurora ribbons
  p.add(band(wave(50, 18, 0.9, 0.6), wave(84, 22, 1.1, 1.2)), '#8E7CC3')
  p.add(band(wave(80, 20, 1.1, 1.8), wave(120, 16, 1.3, 2.4)), '#3DDC97')
  p.add(band(wave(118, 14, 1.4, 2.8), wave(146, 12, 1.1, 3.4)), '#2BB5A3')
  for (const [x, y, r] of [[30, 30, 5], [120, 20, 4], [260, 36, 6], [210, 160, 4], [60, 168, 5], [280, 140, 4]] as const) p.add(sparkle(x, y, r), '#F4F1DE')
  // mountains
  p.add(band(profile([[0, 214], [60, 178], [110, 206], [170, 170], [230, 204], [300, 186]]), flat(262)), '#2A3B5C')
  p.add(poly([[60, 178], [76, 188], [66, 192], [56, 186], [48, 186]]), '#C9D6E8')
  p.add(poly([[170, 170], [188, 182], [176, 186], [166, 180], [156, 182]]), '#C9D6E8')
  // snow
  p.add(band(wave(254, 6, 1.2), flat(400)), '#E8EEF5')
  p.add(band(wave(300, 8, 0.9, 1), flat(400)), '#D4DEEA')
  p.add(band(wave(356, 6, 1.4, 2), flat(400)), '#BFCDDE')
  p.add(ellipse(150, 336, 92, 18), '#F2D9A8')
  // pines
  for (const [x, h] of [[24, 96], [56, 70], [252, 88], [282, 110]] as const) {
    const [trunk, ...tiers] = pine(x, 300 + (h > 90 ? 10 : 0), h, h * 0.5)
    p.add(trunk!, '#3A2A20')
    tiers.forEach((t, i) => p.add(t, i % 2 ? '#1D3B33' : '#16302A'))
  }
  // glass igloo: frosted shell + warm panes
  p.add(sector(150, 330, 0, 64, 180, 360), '#DDE6EF')
  const rings: [number, number, string[]][] = [
    [8, 26, ['#F7D99E', '#F4CF8B']],
    [28, 44, ['#EEC27A', '#F4CF8B']],
    [46, 60, ['#F4CF8B', '#E9B866']],
  ]
  for (const [r0, r1, tones] of rings) {
    const n = r1 > 40 ? 7 : 5
    for (let k = 0; k < n; k++) p.add(sector(150, 330, r0, r1, 180 + (k * 180) / n + 1.5, 180 + ((k + 1) * 180) / n - 1.5), tones[k % 2]!)
  }
  p.add(poly([[128, 330], [172, 330], [170, 346], [130, 346]]), '#C9D5E3')
  p.add(poly([[142, 312], [158, 312], [158, 330], [142, 330]]), '#3E4A5A')
  return p.done('aurora', 'Northern lights')
}
