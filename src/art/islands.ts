import { band, ellipse, flat, leaf, Page, poly, profile, rect, wave, type Pt } from './kit'

/** Overwater villas in a turquoise lagoon. */
export function islands() {
  const p = new Page('i')
  p.add(band(flat(0), wave(70, 3, 1)), '#4FB3E8')
  p.add(band(wave(70, 3, 1), wave(130, 3, 1, 1)), '#86CDF0')
  p.add(band(wave(130, 3, 1, 1), flat(180)), '#CDEBF8')
  const cloud = (x: number, y: number, s: number) => {
    p.add(ellipse(x, y, 26 * s, 11 * s), '#FFFFFF')
    p.add(ellipse(x - 14 * s, y - 6 * s, 14 * s, 11 * s), '#FFFFFF')
    p.add(ellipse(x + 10 * s, y - 9 * s, 16 * s, 13 * s), '#FFFFFF')
    p.add(ellipse(x + 2 * s, y + 6 * s, 24 * s, 5 * s), '#E3EEF5')
  }
  cloud(70, 70, 1)
  cloud(225, 112, 0.8)
  // island on the horizon
  p.add(band(profile([[150, 176], [180, 160], [215, 152], [250, 162], [290, 176]]), flat(176), 150, 290), '#4E8F5A')
  p.add(band(profile([[215, 152], [250, 162], [290, 176]]), flat(176), 215, 290), '#3C7448')
  p.add(rect(146, 172, 148, 7), '#EAD7A8')
  // sea
  p.add(band(flat(179), wave(205, 2, 3)), '#1F78B4')
  p.add(band(wave(205, 2, 3), wave(250, 3, 2, 1)), '#22A0C4')
  p.add(band(wave(250, 3, 2, 1), wave(318, 4, 1.5, 2)), '#45CFC4')
  p.add(band(wave(318, 4, 1.5, 2), flat(400)), '#9BE7DC')
  // pier
  p.add(poly([[150, 238], [158, 238], [118, 330], [100, 330]]), '#B48A5E')
  // bungalows (far → near)
  const hut = (x: number, y: number, s: number) => {
    const w = 46 * s
    const h = 22 * s
    for (const dx of [0.12, 0.5, 0.88]) p.add(rect(x + w * dx - 1.5 * s, y + h, 3 * s, 16 * s), '#6B4A33')
    p.add(rect(x - 4 * s, y + h - 3 * s, w + 8 * s, 5 * s), '#A57A52')
    p.add(rect(x, y, w * 0.7, h - 3 * s), '#C79A6B')
    p.add(rect(x + w * 0.7, y, w * 0.3, h - 3 * s), '#A97F55')
    p.add(rect(x + w * 0.2, y + h * 0.3, w * 0.25, h * 0.45), '#3B2A1F')
    p.add(poly([[x - 6 * s, y + 2 * s], [x + w * 0.35, y - 20 * s], [x + w * 0.72, y + 2 * s]]), '#D2B07A')
    p.add(poly([[x + w * 0.35, y - 20 * s], [x + w + 6 * s, y - 14 * s], [x + w + 6 * s, y + 2 * s], [x + w * 0.72, y + 2 * s]]), '#B08C5A')
  }
  hut(158, 200, 0.55)
  hut(205, 210, 0.75)
  hut(150, 236, 1)
  // beach
  p.add(band(profile([[0, 330], [80, 344], [160, 368], [230, 386], [300, 392]]), flat(400)), '#D9C192')
  p.add(band(profile([[0, 342], [80, 356], [160, 378], [230, 394], [300, 400]]), flat(400)), '#EED9AF')
  // palm
  const trunk: Pt[] = [[30, 395], [44, 395], [52, 330], [66, 270], [76, 222], [68, 220], [56, 268], [40, 328]]
  p.add(poly(trunk), '#8B6B4A')
  p.add(poly([[42, 330], [52, 330], [49, 345], [39, 343]]), '#7A5C3E')
  p.add(poly([[56, 268], [66, 270], [63, 284], [53, 282]]), '#7A5C3E')
  const crown: Pt = [72, 220]
  const fronds: [Pt, string][] = [
    [[14, 236], '#2F7341'], [[20, 196], '#3E8E4E'], [[62, 168], '#57A85F'],
    [[118, 186], '#3E8E4E'], [[132, 232], '#2F7341'], [[100, 262], '#57A85F'],
  ]
  for (const [tip, tone] of fronds) {
    p.add(leaf(crown, tip, 11, 1), tone)
    p.add(leaf(crown, tip, 11, -1), tone === '#57A85F' ? '#4A9653' : '#2A6639')
  }
  p.add(ellipse(68, 228, 6, 6), '#5A3E26')
  p.add(ellipse(79, 229, 6, 6), '#4A3220')
  return p.done('islands', 'Острова')
}
