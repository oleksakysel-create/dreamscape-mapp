import { band, circle, flat, leaf, Page, poly, profile, rect, wave } from './kit'

/** Motor yacht off a Mediterranean coast. */
export function yacht() {
  const p = new Page('y')
  p.add(band(flat(0), wave(80, 3, 1)), '#3F97D3')
  p.add(band(wave(80, 3, 1), wave(150, 3, 1, 1)), '#7DBDE6')
  p.add(band(wave(150, 3, 1, 1), flat(212)), '#C8E4F4')
  p.add(circle(60, 60, 14), '#FFF4D6')
  // coast
  p.add(band(profile([[0, 186], [40, 172], [90, 180], [140, 196], [170, 212]]), flat(212), 0, 170), '#7E9A86')
  p.add(band(profile([[0, 200], [50, 192], [110, 204], [140, 212]]), flat(212), 0, 140), '#5F7D69')
  for (const [x, y] of [[24, 190], [36, 186], [52, 188], [66, 192], [80, 196]] as const) p.add(rect(x, y, 8, 6), '#F4F1EA')
  for (const [x, y] of [[24, 186], [36, 182], [52, 184], [66, 188], [80, 192]] as const) p.add(poly([[x - 1, y + 1], [x + 4, y - 3], [x + 9, y + 1]]), '#C4643F')
  // sea
  p.add(band(flat(212), wave(250, 2, 3)), '#1E6FA5')
  p.add(band(wave(250, 2, 3), wave(300, 3, 2, 1)), '#2584B8')
  p.add(band(wave(300, 3, 2, 1), flat(400)), '#1B5E8C')
  p.add(leaf([30, 340], [120, 336], 2), '#5FB0D8')
  p.add(leaf([170, 360], [270, 356], 2.4), '#5FB0D8')
  p.add(leaf([60, 380], [130, 378], 2), '#5FB0D8')
  // reflection
  p.add(poly([[50, 294], [272, 294], [258, 318], [70, 318]]), '#173F63')
  // hull
  p.add('M20 246L282 258L280 292Q170 300 62 296Q34 280 20 246Z', '#F5F6F7')
  p.add(poly([[40, 282], [281, 284], [280, 292], [62, 296], [48, 290]]), '#1D2B45')
  p.add(poly([[120, 268], [250, 270], [248, 275], [122, 273]]), '#2A3442')
  p.add(poly([[58, 256], [272, 262], [272, 266], [60, 261]]), '#D7DBE0')
  p.add(poly([[236, 252], [282, 258], [282, 262], [236, 257]]), '#B98A5A')
  // superstructure
  p.add(poly([[90, 228], [234, 228], [254, 257], [72, 254]]), '#F2F3F5')
  p.add(poly([[100, 234], [228, 234], [240, 248], [92, 248]]), '#253140')
  p.add(poly([[150, 236], [176, 236], [168, 246], [142, 246]]), '#4E6478')
  p.add(poly([[122, 210], [210, 210], [222, 228], [108, 228]]), '#ECEEF0')
  p.add(poly([[130, 214], [206, 214], [214, 224], [120, 224]]), '#253140')
  p.add(poly([[130, 198], [205, 198], [212, 205], [124, 206]]), '#DCDFE3')
  p.add(rect(150, 206, 4, 4), '#9AA3AD')
  p.add(rect(190, 206, 4, 4), '#9AA3AD')
  p.add(circle(174, 191, 6), '#F7F7F7')
  // wake
  p.add(leaf([30, 292], [110, 300], 3), '#FFFFFF')
  p.add(leaf([240, 296], [298, 300], 3), '#D6EEF8')
  return p.done('yacht', 'Яхта')
}
