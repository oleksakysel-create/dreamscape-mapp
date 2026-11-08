import { band, circle, ellipse, flat, Page, poly, rect, wave } from './kit'

/** Modern villa with infinity pool at dusk. */
export function villa() {
  const p = new Page('v')
  // sky
  p.add(band(flat(0), wave(70, 3, 1)), '#2E3A64')
  p.add(band(wave(70, 3, 1), wave(125, 4, 1.2, 1)), '#565C8E')
  p.add(band(wave(125, 4, 1.2, 1), wave(165, 3, 0.8, 2)), '#B98394')
  p.add(band(wave(165, 3, 0.8, 2), flat(215)), '#F0B98A')
  p.add(circle(238, 46, 10), '#F4EFD9')
  // hills
  p.add(band(wave(178, 10, 1.1, 0.4), flat(230)), '#6C6F8E')
  p.add(band(wave(196, 8, 1.6, 2), flat(240)), '#3F5A4F')
  // garden behind house
  p.add(ellipse(32, 168, 30, 48), '#2F4F3A')
  p.add(ellipse(275, 172, 28, 44), '#36583F')
  p.add(rect(29, 210, 6, 30), '#4A3628')
  p.add(rect(272, 210, 6, 30), '#4A3628')
  p.add(rect(0, 236, 300, 20), '#4F7A45')
  // upper volume
  p.add(rect(95, 128, 140, 50), '#EEEAE3')
  p.add(rect(105, 136, 23, 38), '#F6D08E')
  p.add(rect(128, 136, 24, 38), '#F2C06E')
  p.add(rect(152, 136, 23, 38), '#EDB45E')
  p.add(rect(181, 132, 16, 46), '#9A6A43')
  p.add(rect(197, 132, 17, 46), '#86593A')
  p.add(rect(214, 132, 16, 46), '#9A6A43')
  p.add(rect(85, 120, 160, 8), '#2F2F33')
  // lower volume
  p.add(rect(40, 180, 225, 66), '#E4DFD6')
  p.add(rect(58, 188, 36, 52), '#F6D08E')
  p.add(rect(94, 188, 36, 52), '#EFBF6A')
  p.add(rect(130, 188, 36, 52), '#F6D08E')
  p.add(rect(166, 188, 34, 52), '#E9B25C')
  p.add(rect(205, 180, 60, 22), '#C6BCAB')
  p.add(rect(205, 202, 60, 22), '#B3A793')
  p.add(rect(205, 224, 60, 22), '#C2B7A5')
  p.add(rect(35, 174, 235, 6), '#2F2F33')
  p.add(rect(35, 246, 235, 7), '#3B3B40')
  // deck
  p.add(rect(0, 253, 300, 95), '#C9B79A')
  p.add(poly([[12, 266], [289, 266], [290, 271], [11, 271]]), '#B8A584')
  // loungers
  p.add(poly([[40, 262], [78, 262], [76, 270], [44, 270]]), '#F2F0EC')
  p.add(poly([[34, 255], [44, 262], [44, 270], [32, 262]]), '#DCD8D0')
  p.add(poly([[210, 262], [248, 262], [252, 270], [214, 270]]), '#F2F0EC')
  p.add(poly([[248, 262], [258, 255], [260, 262], [252, 270]]), '#DCD8D0')
  // pool
  p.add(poly([[30, 284], [272, 284], [288, 348], [14, 348]]), '#E8E1D3')
  p.add(poly([[40, 290], [262, 290], [276, 342], [26, 342]]), '#2D9CC2')
  p.add(poly([[46, 296], [256, 296], [262, 312], [40, 312]]), '#5EC2DD')
  p.add(poly([[70, 318], [100, 318], [104, 336], [68, 336]]), '#E9C98A')
  p.add(poly([[150, 318], [182, 318], [188, 336], [152, 336]]), '#E9C98A')
  // lawn & shrubs
  p.add(rect(0, 348, 300, 52), '#4D7A41')
  p.add(band(wave(372, 4, 1.5), flat(400)), '#3E6634')
  p.add(ellipse(10, 352, 22, 30), '#2E5235')
  p.add(ellipse(292, 350, 22, 32), '#2E5235')
  return p.done('villa', 'Дом мечты')
}
