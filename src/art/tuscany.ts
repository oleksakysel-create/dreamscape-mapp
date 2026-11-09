import { band, circle, ellipse, flat, Page, poly, profile, rect, wave } from './kit'

/** Vineyard estate on Tuscan hills at golden hour. */
export function tuscany() {
  const p = new Page('t')
  p.add(band(flat(0), wave(80, 3, 1)), '#9FB9D6')
  p.add(band(wave(80, 3, 1), wave(140, 3, 1, 1)), '#E8C9A0')
  p.add(band(wave(140, 3, 1, 1), flat(220)), '#F4B97B')
  p.add(circle(64, 168, 16), '#FBE2A6')
  p.add(band(wave(178, 9, 1.2, 0.5), flat(240)), '#A7B3A2')
  p.add(band(wave(198, 10, 0.9, 2), flat(250)), '#86996F')
  // estate on the hill
  p.add(band(profile([[120, 236], [190, 206], [260, 214], [300, 232]]), flat(262), 120, 300), '#9AA65B')
  p.add(rect(196, 182, 52, 26), '#E7C9A0')
  p.add(rect(248, 188, 22, 20), '#D4B086')
  p.add(poly([[192, 182], [222, 168], [252, 182]]), '#B5532F')
  p.add(poly([[246, 188], [259, 180], [274, 188]]), '#9A4426')
  p.add(rect(210, 160, 14, 22), '#E7C9A0')
  p.add(poly([[207, 160], [217, 150], [227, 160]]), '#9A4426')
  for (const x of [204, 220, 236]) p.add(rect(x, 190, 6, 9), '#4F5E3A')
  // cypress row along the road
  for (let i = 0; i < 6; i++) {
    const x = 150 + i * 22
    const h = 34 - i * 2
    p.add(ellipse(x, 222 - h / 2 + i * 2, 5, h / 2), '#2E4A2F')
  }
  p.add(band(profile([[0, 252], [110, 238], [200, 252], [300, 246]]), flat(270)), '#C9A65E')
  // vineyard rows converging to a vanishing point
  const vp: [number, number] = [150, 262]
  p.add(rect(0, 266, 300, 134), '#B98E5F')
  const xs = [-260, -160, -80, -10, 50, 110, 170, 230, 300, 380, 470, 560]
  for (let i = 0; i < xs.length - 1; i += 2) {
    const a = xs[i]!
    const b = xs[i + 1]!
    const top = (x: number) => vp[0] + (x - vp[0]) * 0.06
    p.add(poly([[top(a), 268], [top(b), 268], [b, 400], [a, 400]]), i % 4 ? '#5D8A3F' : '#4F7A36')
  }
  for (const [x, y] of [[40, 372], [70, 384], [236, 370], [262, 386]] as const) p.add(ellipse(x, y, 6, 9), '#5A2A4A')
  return p.done('tuscany', 'Vineyard')
}
