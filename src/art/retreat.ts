import { band, circle, ellipse, flat, Page, pine, poly, profile, rect, wave } from './kit'

/** A-frame cabin by an alpine lake, early morning. */
export function retreat() {
  const p = new Page('m')
  p.add(band(flat(0), wave(80, 3, 1)), '#8FB8DC')
  p.add(band(wave(80, 3, 1), wave(140, 3, 1, 1)), '#BCD6EA')
  p.add(band(wave(140, 3, 1, 1), flat(240)), '#EBDCC6')
  p.add(circle(222, 92, 26), '#F6E2B8')
  p.add(circle(222, 92, 16), '#FBEFCB')
  // far range: lit (left) and shadow (right) faces
  const far: [number, number, number][] = [[40, 118, 0], [120, 96, 0], [205, 128, 0], [285, 110, 0]]
  for (const [x, y] of far) {
    p.add(poly([[x - 70, 215], [x, y], [x + 4, 215]]), '#A9BDD2')
    p.add(poly([[x, y], [x + 70, 215], [x + 4, 215]]), '#7E97B3')
    p.add(poly([[x - 14, y + 20], [x, y], [x + 3, y + 22], [x - 4, y + 16]]), '#F4F7FA')
    p.add(poly([[x, y], [x + 14, y + 20], [x + 7, y + 17], [x + 3, y + 22]]), '#D3DCE6')
  }
  // mid range
  const mid = profile([[0, 196], [60, 160], [110, 192], [170, 150], [230, 188], [300, 165]])
  p.add(band(mid, flat(240)), '#5C7A71')
  p.add(poly([[170, 150], [230, 188], [230, 240], [175, 240]]), '#46625B')
  p.add(poly([[60, 160], [110, 192], [110, 240], [65, 240]]), '#46625B')
  // forest line
  for (let i = 0; i < 16; i++) {
    const x = 6 + i * 19 + (i % 3) * 3
    if (x > 196 && x < 266) continue
    const [, ...tiers] = pine(x, 246, 34 + (i % 4) * 6, 22)
    p.add(tiers[0]!, i % 2 ? '#2C4A3A' : '#355742')
    p.add(tiers[1]!, i % 2 ? '#355742' : '#2C4A3A')
  }
  // lake
  p.add(band(flat(240), wave(270, 2, 2)), '#6E9FBE')
  p.add(band(wave(270, 2, 2), wave(300, 2, 2, 1)), '#527F9E')
  p.add(band(wave(300, 2, 2, 1), flat(350)), '#3E6D8C')
  p.add(poly([[150, 242], [200, 242], [175, 286]]), '#8DB1C9')
  p.add(poly([[40, 242], [100, 242], [70, 278]]), '#8DB1C9')
  // dock
  p.add(poly([[70, 300], [128, 300], [124, 310], [74, 310]]), '#9C7350')
  p.add(rect(78, 310, 4, 14), '#5A4030')
  p.add(rect(118, 310, 4, 14), '#5A4030')
  // shore & cabin
  p.add(band(profile([[150, 300], [200, 290], [300, 284]]), flat(345), 150, 300), '#6B7F4C')
  p.add(rect(196, 272, 74, 8), '#8A6244')
  p.add(poly([[204, 272], [233, 206], [262, 272]]), '#3A2E28')
  p.add(poly([[214, 272], [233, 228], [252, 272]]), '#F2C37A')
  p.add(poly([[233, 228], [252, 272], [233, 272]]), '#E8B060')
  p.add(rect(210, 280, 4, 14), '#5A4030')
  p.add(rect(256, 280, 4, 14), '#5A4030')
  // foreground
  p.add(band(wave(336, 6, 1.3), flat(400)), '#5B7340')
  p.add(band(wave(362, 5, 1.7, 1), flat(400)), '#4A6235')
  p.add(ellipse(48, 352, 34, 18), '#8C8A85')
  p.add(ellipse(60, 346, 18, 10), '#A4A29C')
  p.add(ellipse(258, 366, 26, 13), '#6F6D69')
  return p.done('retreat', 'Mountain retreat')
}
