import { band, circle, ellipse, flat, Page, poly, rrect, wave } from './kit'

/** Private jet above a sea of clouds at golden hour. */
export function jet() {
  const p = new Page('j')
  p.add(band(flat(0), wave(70, 3, 1)), '#1F3B66')
  p.add(band(wave(70, 3, 1), wave(140, 3, 1, 1)), '#3F6A9C')
  p.add(band(wave(140, 3, 1, 1), wave(205, 3, 1, 2)), '#8FB3D6')
  p.add(band(wave(205, 3, 1, 2), flat(300)), '#F3D3A6')
  p.add(circle(244, 232, 30), '#FBE3B5')
  p.add(circle(244, 232, 18), '#FFF1CC')
  // cloud sea
  const tops = [[262, 14, 1.3, 0], [296, 12, 1.9, 1.4], [334, 10, 2.4, 2.6]] as const
  const tones = ['#F7EFE6', '#E9DDD2', '#D6CBC3']
  tops.forEach(([y, a, f, ph], i) => p.add(band(wave(y, a, f, ph), flat(400)), tones[i]!))
  p.add(ellipse(70, 262, 40, 12), '#FFF8EF')
  p.add(ellipse(220, 300, 50, 12), '#F4E9DE')
  // far wing (behind fuselage)
  p.add(poly([[150, 172], [176, 172], [214, 140], [204, 138]]), '#B8C0C9')
  // engine nacelle
  p.add(rrect(198, 156, 46, 16, 8), '#E2E6EA')
  p.add(ellipse(200, 164, 4, 7), '#3A3F46')
  // tail
  p.add(poly([[226, 172], [244, 128], [262, 126], [262, 168]]), '#F4F5F7')
  p.add(poly([[236, 150], [248, 128], [262, 126], [262, 140]]), '#1E2A44')
  p.add(poly([[240, 126], [286, 120], [288, 126], [244, 132]]), '#E6E9ED')
  // fuselage
  p.add('M30 194Q36 182 62 178L240 170Q262 168 268 172L264 184Q240 192 212 194L66 206Q40 206 30 194Z', '#F4F5F7')
  p.add('M44 200L212 192L262 184L264 186Q240 194 212 196L66 207Q50 206 44 200Z', '#D3D8DE')
  p.add(poly([[64, 196], [262, 180], [263, 183], [64, 199]]), '#C9A15E')
  p.add(poly([[42, 186], [56, 180], [66, 180], [60, 188]]), '#1F2B3A')
  for (let k = 0; k < 7; k++) p.add(rrect(90 + k * 18, 182 - k * 0.4, 9, 6, 3), '#2A3644')
  p.add(rrect(76, 180, 8, 14, 2), '#E6E9ED')
  // near wing
  p.add(poly([[120, 198], [156, 196], [214, 236], [198, 238]]), '#CBD1D8')
  p.add(poly([[198, 238], [214, 236], [220, 222], [216, 222]]), '#1E2A44')
  return p.done('jet', 'Private jet')
}
