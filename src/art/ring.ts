import { band, ellipse, flat, Page, poly, rect, rrect, sparkle, wave } from './kit'

/** Brilliant-cut diamond ring in an open velvet box. */
export function diamond() {
  const p = new Page('r')
  p.add(rect(0, 0, 300, 400), '#2A1A24')
  p.add(ellipse(150, 200, 170, 150), '#3D2533')
  // lid
  p.add(rrect(52, 34, 196, 150, 18), '#1F2A44')
  p.add(rrect(64, 46, 172, 128, 12), '#E9E4DA')
  p.add(poly([[64, 120], [236, 74], [236, 96], [64, 142]]), '#F7F3EA')
  // base
  p.add(rrect(44, 214, 212, 150, 16), '#1B2540')
  p.add(rect(44, 214, 212, 22), '#2A3757')
  p.add(band(wave(196, 4, 0.5, Math.PI), flat(262), 56, 244), '#5B1F33')
  // ring band (back half shows in the slit)
  p.add(ellipse(150, 196, 50, 60) + ellipse(150, 196, 41, 51), '#B8922B', true)
  p.add(poly([[150, 136], [100, 196], [109, 196], [150, 145]]), '#F2D47A')
  // cushion front lip hides the lower half of the band
  p.add(band(wave(222, 3, 0.5, Math.PI), flat(262), 56, 244), '#6E2840')
  p.add(rect(147, 214, 6, 48), '#3A1220')
  p.add(rect(56, 262, 188, 8), '#141C33')
  // setting
  p.add(poly([[128, 128], [172, 128], [158, 146], [142, 146]]), '#C9A33A')
  // diamond crown
  p.add(poly([[122, 118], [136, 100], [142, 118]]), '#DDEBF7')
  p.add(poly([[136, 100], [150, 100], [142, 118]]), '#FFFFFF')
  p.add(poly([[150, 100], [164, 100], [158, 118], [142, 118]]), '#EAF3FB')
  p.add(poly([[164, 100], [178, 118], [158, 118]]), '#B9D3EA')
  p.add(rect(121, 117, 58, 4), '#F0F4F8')
  // pavilion
  p.add(poly([[121, 121], [136, 121], [150, 150]]), '#A7C4E0')
  p.add(poly([[136, 121], [150, 121], [150, 150]]), '#E3EEF8')
  p.add(poly([[150, 121], [164, 121], [150, 150]]), '#7FA3C8')
  p.add(poly([[164, 121], [179, 121], [150, 150]]), '#5E86B0')
  // prongs
  p.add(poly([[120, 112], [126, 110], [128, 124], [122, 124]]), '#E2BE58')
  p.add(poly([[174, 110], [180, 112], [178, 124], [172, 124]]), '#E2BE58')
  p.add(poly([[147, 96], [153, 96], [152, 104], [148, 104]]), '#E2BE58')
  // sparkles
  p.add(sparkle(104, 92, 9), '#FFFFFF')
  p.add(sparkle(196, 86, 7), '#FFFFFF')
  p.add(sparkle(188, 150, 5), '#FFFFFF')
  return p.done('ring', 'Diamond ring')
}
