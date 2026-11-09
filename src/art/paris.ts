import { band, ellipse, flat, Page, poly, rect, wave } from './kit'

/** The tower at golden hour above Haussmann rooftops. */
export function paris() {
  const p = new Page('f')
  p.add(band(flat(0), wave(90, 3, 1)), '#9C8DC0')
  p.add(band(wave(90, 3, 1), wave(170, 3, 1, 1)), '#E3A9A6')
  p.add(band(wave(170, 3, 1, 1), flat(400)), '#F6D7B0')
  p.add(ellipse(60, 110, 34, 9), '#F9E6D3')
  p.add(ellipse(240, 70, 28, 7), '#F9E6D3')
  // tower
  p.add(rect(148.5, 34, 3, 26), '#6E5240')
  p.add(poly([[144, 60], [150, 60], [150, 120], [138, 120]]), '#A27B57')
  p.add(poly([[150, 60], [156, 60], [162, 120], [150, 120]]), '#7B5A3F')
  p.add(rect(132, 118, 36, 7), '#5E4432')
  p.add(poly([[138, 125], [150, 125], [150, 190], [124, 190]]), '#A27B57')
  p.add(poly([[150, 125], [162, 125], [176, 190], [150, 190]]), '#7B5A3F')
  p.add(poly([[140, 140], [148, 140], [146, 176], [134, 176]]), '#8A6748')
  p.add(poly([[152, 140], [160, 140], [166, 176], [154, 176]]), '#6A4C35')
  p.add(rect(116, 188, 68, 9), '#5E4432')
  p.add(poly([[120, 197], [146, 197], [116, 300], [78, 300]]), '#A27B57')
  p.add(poly([[154, 197], [180, 197], [222, 300], [184, 300]]), '#7B5A3F')
  p.add(poly([[128, 206], [138, 206], [110, 266], [100, 266]]), '#8A6748')
  p.add(poly([[162, 206], [172, 206], [200, 266], [190, 266]]), '#6A4C35')
  p.add(poly([[100, 232], [200, 232], [204, 244], [96, 244]]), '#5E4432')
  p.add('M98 272Q150 236 202 272L196 276Q150 246 104 276Z', '#8A6748')
  // trees
  for (let i = 0; i < 7; i++) p.add(ellipse(20 + i * 44, 300, 26, 16), i % 2 ? '#4C6A3D' : '#5E7A4A')
  // rooftops
  const bld = (x: number, w: number, roofY: number, tone: string) => {
    p.add(rect(x, roofY + 22, w, 400 - roofY - 22), tone)
    p.add(poly([[x + 4, roofY], [x + w - 4, roofY], [x + w, roofY + 22], [x, roofY + 22]]), '#7D8A99')
    for (let k = 0; k < Math.floor(w / 26); k++) p.add(rect(x + 10 + k * 26, roofY + 6, 9, 12), '#3C3F46')
    p.add(rect(x + w - 18, roofY - 14, 8, 14), '#B86F52')
    for (const fy of [roofY + 36, roofY + 62]) p.add(rect(x + 8, fy, w - 16, 10), '#5A6170')
  }
  bld(-4, 96, 316, '#E8DCC6')
  bld(92, 112, 330, '#E2D3BA')
  bld(204, 100, 312, '#EBE1CE')
  return p.done('paris', 'Paris')
}
