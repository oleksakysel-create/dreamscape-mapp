import { circle, Page, poly, polar, rect, rot, sector } from './kit'

/** Luxury diver's watch on a steel bracelet. */
export function watch() {
  const p = new Page('w')
  const cx = 150
  const cy = 205
  p.add(rect(0, 0, 300, 400), '#1C1D21')
  p.add(poly([[0, 0], [190, 0], [0, 260]]), '#2A2B30')
  p.add(poly([[300, 230], [300, 400], [120, 400]]), '#141518')
  // bracelet links
  const rows = (y0: number, n: number, dir: number) => {
    for (let i = 0; i < n; i++) {
      const y = y0 + dir * i * 28
      const w = 104 - i * 4
      p.add(rect(cx - w / 2, y, w * 0.3, 25), '#A9AEB5')
      p.add(rect(cx - w * 0.2, y, w * 0.4, 25), '#E6E9ED')
      p.add(rect(cx + w * 0.2, y, w * 0.3, 25), '#A9AEB5')
    }
  }
  rows(92, 4, -1)
  rows(292, 4, 1)
  // lugs
  p.add(poly([[96, 118], [128, 118], [118, 140], [92, 150]]), '#C3C8CE')
  p.add(poly([[172, 118], [204, 118], [208, 150], [182, 140]]), '#9EA4AB')
  p.add(poly([[92, 260], [118, 270], [128, 292], [96, 292]]), '#C3C8CE')
  p.add(poly([[182, 270], [208, 260], [204, 292], [172, 292]]), '#9EA4AB')
  // crown
  p.add(rect(238, 193, 14, 24), '#B0B5BB')
  p.add(rect(251, 196, 11, 18), '#D3D7DC')
  // case + bezel
  p.add(circle(cx, cy, 94), '#B7BCC3')
  p.add(sector(cx, cy, 88, 94, 200, 340), '#DADDE1')
  p.add(circle(cx, cy, 88), '#1B2B4D')
  for (let i = 0; i < 12; i++) {
    const a = -90 + i * 30
    const [x, y] = polar(cx, cy, 80, a)
    if (i === 0) {
      const t = [polar(cx, cy, 86, -90), polar(cx, cy, 74, -96), polar(cx, cy, 74, -84)]
      p.add(poly(t), '#E9E3CF')
    } else p.add(rot(x, y, 4, 11, a + 90), '#D8D2BE')
  }
  // dial
  p.add(circle(cx, cy, 71), '#0C264B')
  p.add(circle(cx, cy, 64), '#0F2F5C')
  p.add(sector(cx, cy, 0, 64, 200, 290), '#1A4A85')
  p.add(sector(cx, cy, 0, 64, 20, 110), '#0B2850')
  for (let i = 0; i < 12; i++) {
    const a = -90 + i * 30
    if (i === 3) continue
    const [x, y] = polar(cx, cy, 52, a)
    if (i === 0) {
      p.add(rot(cx - 4, cy - 52, 5, 16, 0), '#F3F1EA')
      p.add(rot(cx + 4, cy - 52, 5, 16, 0), '#F3F1EA')
    } else if (i % 3 === 0) p.add(rot(x, y, 7, 16, a + 90), '#F3F1EA')
    else p.add(circle(x, y, 4.2), '#F3F1EA')
  }
  p.add(rect(cx + 40, cy - 7, 17, 14), '#FFFFFF')
  p.add(rect(cx - 13, cy - 34, 26, 4), '#E9E3CF')
  p.add(rect(cx - 9, cy + 26, 18, 3), '#C9A15E')
  // hands
  p.add(poly([polar(cx, cy, 6, 210 + 90), polar(cx, cy, 36, 210), polar(cx, cy, 6, 210 - 90), polar(cx, cy, 10, 30)]), '#EDEDED')
  p.add(poly([polar(cx, cy, 4, 330 + 90), polar(cx, cy, 58, 330), polar(cx, cy, 4, 330 - 90), polar(cx, cy, 10, 150)]), '#F7F7F5')
  p.add(poly([polar(cx, cy, 1.6, 100 + 90), polar(cx, cy, 62, 100), polar(cx, cy, 1.6, 100 - 90), polar(cx, cy, 18, 280)]), '#C8102E')
  p.add(circle(cx, cy, 5), '#C9CED4')
  return p.done('watch', 'Часы мечты')
}
