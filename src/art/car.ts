import { band, circle, ellipse, flat, Page, poly, rect, sector, wave } from './kit'

/** Sleek sports coupe on a coastal road at sunset (generic, unbranded). */
export function car() {
  const p = new Page('c')
  p.add(band(flat(0), wave(60, 3, 1)), '#2B2D5C')
  p.add(band(wave(60, 3, 1), wave(120, 3, 1, 1)), '#7A4C7C')
  p.add(band(wave(120, 3, 1, 1), wave(165, 2, 1, 2)), '#E0805E')
  p.add(band(wave(165, 2, 1, 2), flat(200)), '#F7C873')
  p.add(circle(215, 200, 28), '#FBE3A1')
  p.add(band(wave(184, 6, 1.4, 0.3), flat(200), 0, 120), '#5B3F63')
  p.add(rect(0, 200, 300, 36), '#3D4F86')
  p.add(rect(195, 206, 40, 3), '#E9A96E')
  p.add(rect(200, 214, 30, 3), '#E9A96E')
  p.add(rect(206, 222, 18, 3), '#E9A96E')
  // road
  p.add(rect(0, 236, 300, 96), '#2E2E33')
  p.add(rect(0, 236, 300, 6), '#55565C')
  p.add(rect(10, 268, 40, 4), '#E8E8E8')
  p.add(rect(250, 268, 40, 4), '#E8E8E8')
  p.add(rect(0, 332, 300, 8), '#55565C')
  p.add(rect(0, 340, 300, 60), '#3A3F2E')
  p.add(band(wave(356, 4, 2), flat(400)), '#2F3326')
  p.add(ellipse(150, 314, 138, 8), '#151517')
  // body
  const body =
    'M22 300L16 284Q16 274 30 266L70 256Q96 250 112 246Q132 236 154 231Q182 226 204 229Q228 234 250 243L274 247Q284 250 284 262L282 300' +
    'L252 300A27 27 0 0 0 198 300L102 300A27 27 0 0 0 48 300Z'
  p.add(body, '#B5122B')
  p.add(poly([[48, 284], [252, 286], [252, 300], [198, 300], [196, 290], [104, 290], [102, 300], [48, 300]]), '#7D0D1E')
  p.add(poly([[34, 266], [110, 252], [272, 250], [274, 255], [110, 258], [36, 272]]), '#E03A52')
  // glasshouse
  p.add(poly([[118, 246], [152, 233], [178, 230], [176, 248]]), '#25313D')
  p.add(poly([[182, 230], [204, 231], [240, 244], [182, 248]]), '#2C3946')
  p.add(poly([[130, 244], [154, 234], [162, 234], [140, 244]]), '#5B7486')
  p.add(rect(177, 229, 5, 19), '#8E0E21')
  p.add(poly([[116, 246], [128, 240], [132, 248], [120, 252]]), '#8E0E21')
  // details
  p.add(poly([[172, 252], [176, 252], [174, 288], [170, 288]]), '#8E0E21')
  p.add(rect(150, 258, 14, 3), '#D9D9DE')
  p.add(poly([[200, 262], [238, 258], [236, 276], [204, 278]]), '#1A1A1C')
  p.add(poly([[206, 266], [232, 263], [231, 272], [208, 273]]), '#2A2A2E')
  p.add(poly([[22, 272], [50, 264], [48, 272], [24, 278]]), '#EAF2F7')
  p.add(poly([[268, 250], [282, 253], [282, 262], [266, 259]]), '#E8343A')
  p.add(poly([[17, 289], [48, 289], [46, 300], [22, 300]]), '#151517')
  p.add(poly([[256, 289], [282, 289], [282, 300], [258, 300]]), '#151517')
  // wheels
  for (const cx of [75, 225]) {
    const cy = 300
    p.add(sector(cx, cy, 0, 27, 180, 360), '#0E0E10')
    p.add(circle(cx, cy, 23), '#1B1B1D')
    p.add(circle(cx, cy, 16), '#C8CDD3')
    for (let k = 0; k < 5; k++) p.add(sector(cx, cy, 5, 14, k * 72 + 14, k * 72 + 58), '#30343A')
    p.add(sector(cx, cy, 10, 14, 200, 240), '#E3B23C')
    p.add(circle(cx, cy, 4), '#9AA0A7')
  }
  return p.done('car', 'Спорткар')
}
