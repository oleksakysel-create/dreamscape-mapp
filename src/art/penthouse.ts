import { band, circle, ellipse, flat, leaf, Page, poly, rect, wave, type Pt } from './kit'

/** Penthouse terrace above the city at sunset. */
export function penthouse() {
  const p = new Page('p')
  p.add(band(flat(0), wave(70, 3, 1)), '#22264A')
  p.add(band(wave(70, 3, 1), wave(140, 3, 1, 1)), '#5B4A7A')
  p.add(band(wave(140, 3, 1, 1), wave(152, 2, 1, 2)), '#C46D6B')
  p.add(band(wave(152, 2, 1, 2), flat(270)), '#F2A35E')
  p.add(circle(126, 168, 18), '#FCD48A')
  // far skyline
  const far: [number, number, number][] = [[0, 196, 26], [26, 176, 20], [46, 206, 30], [76, 160, 18], [94, 190, 24], [118, 214, 28], [146, 150, 22], [168, 186, 30], [198, 170, 20], [218, 200, 26], [244, 178, 24], [268, 196, 32]]
  far.forEach(([x, y, w], i) => p.add(rect(x, y - 28, w, 298 - y), i % 2 ? '#4A4466' : '#3E3A5A'))
  p.add(poly([[150, 122], [157, 104], [164, 122]]), '#3E3A5A')
  p.add(rect(156, 90, 2, 14), '#3E3A5A')
  // near skyline with lit floors
  const near: [number, number, number][] = [[0, 214, 40], [44, 196, 34], [82, 222, 44], [130, 186, 40], [174, 214, 36], [214, 200, 42], [260, 218, 40]]
  near.forEach(([x, y, w], i) => {
    p.add(rect(x, y, w, 300 - y), i % 2 ? '#2A2840' : '#24223A')
    p.add(rect(x + 5, y + 10, w - 10, 6), '#E9B76A')
    p.add(rect(x + 5, y + 22, (w - 10) * 0.6, 6), '#D9A55B')
  })
  // glass balustrade
  p.add(rect(0, 262, 300, 50), '#5D5873')
  p.add(poly([[20, 266], [70, 266], [40, 306], [20, 306]]), '#7C7794')
  p.add(rect(0, 256, 300, 6), '#1C1C1E')
  for (const x of [0, 98, 198, 294]) p.add(rect(x, 262, 6, 50), '#1C1C1E')
  // terrace floor
  p.add(poly([[0, 312], [300, 312], [300, 400], [0, 400]]), '#3B3532')
  p.add(poly([[0, 340], [300, 340], [300, 346], [0, 346]]), '#4A433F')
  p.add(poly([[0, 374], [300, 374], [300, 382], [0, 382]]), '#4A433F')
  // lounge chair
  p.add(poly([[160, 330], [262, 330], [262, 338], [160, 338]]), '#1E1E20')
  p.add(poly([[150, 300], [166, 300], [172, 330], [160, 330]]), '#1E1E20')
  p.add(poly([[162, 318], [258, 318], [262, 330], [168, 330]]), '#E9E4DA')
  p.add(poly([[150, 296], [164, 296], [172, 326], [160, 326]]), '#DED8CC')
  p.add(ellipse(178, 312, 12, 7), '#C9A27A')
  p.add(rect(166, 338, 4, 16), '#1E1E20')
  p.add(rect(252, 338, 4, 16), '#1E1E20')
  // side table + wine
  p.add(rect(270, 326, 26, 4), '#2A2A2D')
  p.add(rect(281, 330, 4, 24), '#2A2A2D')
  p.add(rect(282, 314, 2, 12), '#E6E9EE')
  p.add(poly([[276, 302], [290, 302], [287, 314], [279, 314]]), '#E6E9EE')
  p.add(poly([[277, 307], [289, 307], [287, 314], [279, 314]]), '#7A1F2E')
  // plant
  p.add(poly([[16, 334], [62, 334], [56, 388], [22, 388]]), '#6E655E')
  const base: Pt = [39, 334]
  const tips: [Pt, string][] = [[[8, 280], '#3F6B4A'], [[28, 262], '#4F7F57'], [[52, 264], '#3F6B4A'], [[74, 284], '#4F7F57'], [[40, 250], '#5E9068']]
  for (const [t, c] of tips) p.add(leaf(base, t, 8), c)
  return p.done('penthouse', 'Penthouse')
}
