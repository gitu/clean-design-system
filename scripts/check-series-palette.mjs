/**
 * Validates the categorical chart palette (`--cds-color-series-1..6`).
 *
 * A muted editorial palette and a colour-blind-safe palette pull in opposite
 * directions: desaturating is exactly what removes the chroma dichromats rely
 * on to tell hues apart. The values in `theme.css` are a negotiated point
 * between those two, and they are easy to nudge back into uselessness with a
 * well-meaning "let's warm slot 3 up a bit". This script makes that a build
 * error.
 *
 * Two gates per theme:
 *
 *   contrast   Every series colour must reach 3:1 against its own canvas —
 *              WCAG 2.2 SC 1.4.11 Non-text Contrast, which is what a chart
 *              mark is.
 *
 *   distance   Perceptual separation as CIEDE2000, measured under normal
 *              vision AND under simulated deuteranopia, protanopia and
 *              tritanopia (Viénot-Brettel-Mollon, the standard linear
 *              approximation). Slots 1-4 must clear 12; slots 5-6 must clear
 *              8, on the understanding that charts past four series are
 *              required to carry redundant encoding — dash patterns, distinct
 *              markers, direct labels — and never lean on hue alone.
 *
 *   node scripts/check-series-palette.mjs
 */
import { readFile } from 'node:fs/promises'

const SLOTS = 6
/** Slots 1..CORE are load-bearing on hue alone and held to the higher bar. */
const CORE = 4
const MIN_CONTRAST = 3

/**
 * Separation floors as [core, tail] CIEDE2000, per vision condition.
 *
 * Deuteranopia and protanopia together affect roughly 8% of men, so they are
 * held to the same bar as normal vision. Tritanopia is on the order of 0.01%
 * — six hundred times rarer — and holding it to 12 costs real hue range for
 * very few readers, so it gets a lower floor rather than a free pass.
 */
const FLOORS = {
  normal: [12, 8],
  deuteranopia: [12, 8],
  protanopia: [12, 8],
  tritanopia: [8, 5],
}

/* --- colour maths ------------------------------------------------------- */

const parseHex = h => {
  const s = h.trim().replace('#', '')
  const full = s.length === 3 ? [...s].map(c => c + c).join('') : s
  if (!/^[0-9a-f]{6}$/i.test(full)) throw new Error(`not a hex colour: ${h}`)
  return [0, 2, 4].map(i => parseInt(full.slice(i, i + 2), 16) / 255)
}
const toLinear = c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const toGamma = c => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.max(c, 0) ** (1 / 2.4) - 0.055)

const luminance = h => {
  const [r, g, b] = parseHex(h).map(toLinear)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

const toLab = h => {
  const [r, g, b] = parseHex(h).map(toLinear)
  const X = 0.4124564 * r + 0.3575761 * g + 0.1804375 * b
  const Y = 0.2126729 * r + 0.7151522 * g + 0.072175 * b
  const Z = 0.0193339 * r + 0.119192 * g + 0.9503041 * b
  const f = t => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
  const [fx, fy, fz] = [f(X / 0.95047), f(Y), f(Z / 1.08883)]
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]
}

/** CIEDE2000. Roughly: 1 is a just-noticeable difference, 12 is unmistakable. */
function deltaE(hexA, hexB) {
  const [L1, a1, b1] = toLab(hexA)
  const [L2, a2, b2] = toLab(hexB)
  const C1 = Math.hypot(a1, b1)
  const C2 = Math.hypot(a2, b2)
  const Cbar = (C1 + C2) / 2
  const G = 0.5 * (1 - Math.sqrt(Cbar ** 7 / (Cbar ** 7 + 25 ** 7)))
  const ap1 = (1 + G) * a1
  const ap2 = (1 + G) * a2
  const Cp1 = Math.hypot(ap1, b1)
  const Cp2 = Math.hypot(ap2, b2)
  const angle = (y, x) => {
    if (x === 0 && y === 0) return 0
    const d = (Math.atan2(y, x) * 180) / Math.PI
    return d < 0 ? d + 360 : d
  }
  const hp1 = angle(b1, ap1)
  const hp2 = angle(b2, ap2)
  const dLp = L2 - L1
  const dCp = Cp2 - Cp1
  let dhp = 0
  if (Cp1 * Cp2 !== 0) {
    dhp = hp2 - hp1
    if (dhp > 180) dhp -= 360
    else if (dhp < -180) dhp += 360
  }
  const dHp = 2 * Math.sqrt(Cp1 * Cp2) * Math.sin((dhp * Math.PI) / 360)
  const Lbar = (L1 + L2) / 2
  const Cbarp = (Cp1 + Cp2) / 2
  let hbar
  if (Cp1 * Cp2 === 0) hbar = hp1 + hp2
  else {
    hbar = (hp1 + hp2) / 2
    if (Math.abs(hp1 - hp2) > 180) hbar += hp1 + hp2 < 360 ? 180 : -180
  }
  const rad = d => (d * Math.PI) / 180
  const T =
    1 -
    0.17 * Math.cos(rad(hbar - 30)) +
    0.24 * Math.cos(rad(2 * hbar)) +
    0.32 * Math.cos(rad(3 * hbar + 6)) -
    0.2 * Math.cos(rad(4 * hbar - 63))
  const dTheta = 30 * Math.exp(-(((hbar - 275) / 25) ** 2))
  const Rc = 2 * Math.sqrt(Cbarp ** 7 / (Cbarp ** 7 + 25 ** 7))
  const Sl = 1 + (0.015 * (Lbar - 50) ** 2) / Math.sqrt(20 + (Lbar - 50) ** 2)
  const Sc = 1 + 0.045 * Cbarp
  const Sh = 1 + 0.015 * Cbarp * T
  const Rt = -Math.sin(rad(2 * dTheta)) * Rc
  return Math.sqrt(
    (dLp / Sl) ** 2 + (dCp / Sc) ** 2 + (dHp / Sh) ** 2 + Rt * (dCp / Sc) * (dHp / Sh)
  )
}

/* --- dichromacy simulation (Viénot, Brettel & Mollon 1999) --------------- */

const RGB_TO_LMS = [
  [0.31399022, 0.63951294, 0.04649755],
  [0.15537241, 0.75789446, 0.08670142],
  [0.01775239, 0.10944209, 0.87256922],
]
const LMS_TO_RGB = [
  [5.47221206, -4.6419601, 0.16963708],
  [-1.1252419, 2.29317094, -0.1678952],
  [0.02980165, -0.19318073, 1.16364789],
]
const COLLAPSE = {
  deuteranopia: [
    [1, 0, 0],
    [0.9513092, 0, 0.04866992],
    [0, 0, 1],
  ],
  protanopia: [
    [0, 1.05118294, -0.05116099],
    [0, 1, 0],
    [0, 0, 1],
  ],
  tritanopia: [
    [1, 0, 0],
    [0, 1, 0],
    [-0.86744736, 1.86727089, 0],
  ],
}
const apply = (M, v) => M.map(row => row[0] * v[0] + row[1] * v[1] + row[2] * v[2])

function simulate(hex, kind) {
  const lms = apply(RGB_TO_LMS, parseHex(hex).map(toLinear))
  const out = apply(LMS_TO_RGB, apply(COLLAPSE[kind], lms)).map(c =>
    Math.round(Math.min(1, Math.max(0, toGamma(c))) * 255)
  )
  return '#' + out.map(c => c.toString(16).padStart(2, '0')).join('')
}

const CONDITIONS = ['normal', ...Object.keys(COLLAPSE)]
const under = (hex, condition) => (condition === 'normal' ? hex : simulate(hex, condition))

/* --- read the tokens ----------------------------------------------------- */

const css = await readFile(new URL('../src/styles/tokens/theme.css', import.meta.url), 'utf8')

/**
 * The light values live in the first block, the dark ones in the
 * `[data-cds-theme='dark']` block. `check-tokens.mjs` already proves the two
 * dark blocks agree, so reading either one is enough.
 */
function readRamp(fromIndex, themeName) {
  const ramp = []
  for (let slot = 1; slot <= SLOTS; slot++) {
    const re = new RegExp(`--cds-color-series-${slot}\\s*:\\s*([^;]+);`, 'g')
    re.lastIndex = fromIndex
    const m = re.exec(css)
    if (!m) throw new Error(`--cds-color-series-${slot} is not declared for the ${themeName} theme`)
    ramp.push(m[1].trim())
  }
  return ramp
}

const darkAt = css.indexOf("[data-cds-theme='dark']")
const THEMES = [
  { name: 'light', canvas: '#ffffff', ramp: readRamp(0, 'light') },
  { name: 'dark', canvas: '#131211', ramp: readRamp(darkAt, 'dark') },
]

/* --- run the gates ------------------------------------------------------- */

const problems = []

for (const { name, canvas, ramp } of THEMES) {
  console.log(`\n${name} — on ${canvas}`)

  ramp.forEach((hex, i) => {
    const cr = contrast(hex, canvas)
    const flag = cr < MIN_CONTRAST ? '  FAIL' : ''
    console.log(`  series-${i + 1}  ${hex}   ${cr.toFixed(2)}:1${flag}`)
    if (cr < MIN_CONTRAST) {
      problems.push(
        `${name} series-${i + 1} (${hex}) is ${cr.toFixed(2)}:1 on ${canvas}, below the ${MIN_CONTRAST}:1 floor`
      )
    }
  })

  for (const condition of CONDITIONS) {
    let worst = { distance: Infinity, pair: '' }
    for (let i = 0; i < ramp.length; i++) {
      for (let j = i + 1; j < ramp.length; j++) {
        const distance = deltaE(under(ramp[i], condition), under(ramp[j], condition))
        const [core, tail] = FLOORS[condition]
        const floor = j < CORE ? core : tail
        if (distance < floor) {
          problems.push(
            `${name} series-${i + 1} and series-${j + 1} are only ΔE ${distance.toFixed(1)} apart under ${condition} (need ${floor})`
          )
        }
        if (distance < worst.distance) worst = { distance, pair: `${i + 1}~${j + 1}` }
      }
    }
    const [core, tail] = FLOORS[condition]
    console.log(
      `  ${condition.padEnd(13)} worst pair ${worst.pair}  ΔE ${worst.distance.toFixed(1)}   (floors ${core}/${tail})`
    )
  }
}

console.log('')
if (problems.length) {
  console.error('series palette check FAILED\n')
  for (const p of problems) console.error(`  ${p}`)
  console.error(`\n${problems.length} problem${problems.length === 1 ? '' : 's'}`)
  process.exitCode = 1
} else {
  console.log(`ok   series palette clears contrast and colour-blindness gates in both themes`)
}
