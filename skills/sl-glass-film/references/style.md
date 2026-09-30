# Style: light frosted glass

## Palette (`kit/tokens.ts → P`)

| Token | Hex | Use |
|-------|-----|-----|
| bg | `#F5F6FB` | the stage |
| bg2 | `#ECEEF8` | behind cards lifted by PushCard |
| ink | `#0E1020` | headlines, UI text |
| ink2 | `#3A3F5C` | foot of the headline gradient, secondary text, URL |
| mute | `#8A8FA8` | mono labels, window titles, footer |
| electric | `#4F5BFF` | primary accent, dot grid, cursor-clicked states |
| violet | `#7B5CFF` | where every gradient ends |
| sky | `#8FB6FF` | light blob |
| lilac | `#C7B8FF` | light blob, bottom tint of the glass |
| alert | `#FF4D6D` | **problem act only**: errors, critical timer, red pulse |

- **Gradients** always run electric to violet: 100° for text, 135° for fills and 90° for bars.
- **No green, no acid colours, no dark mode.** A rebrand changes `electric`/`violet` (keep them about 30° apart in hue) and the blob colours, and nothing else.

## Glass (`glass(radius)`)

A white, translucent surface that floats. It has five layers:

1. **Fill.** A 160° gradient: white 0.72 → white 0.34 → lilac 0.30.
2. **Backdrop blur.** `blur(26px) saturate(190%)`. This is what makes the blobs glow through.
3. **Edge.** A 1.5 px white border plus a 1 px outer hairline `rgba(40,46,110,0.12)`.
4. **Shadows.** A coloured drop shadow `0 34px 70px -14px rgba(79,91,255,0.38)` and a dark contact shadow `0 14px 28px -10px rgba(14,16,32,0.16)`.
5. **Inner light.** A 2 px white top highlight, a violet inner glow at the bottom and a white inner hairline.

Radii:

| Element | Radius |
|---------|--------|
| Cards | 30 |
| Logo tile | 72 |
| Small logo tile | 54 |
| Timer | 44 |
| Pills | 999 |
| Toasts | 18 |

Glass never sits on a flat colour. It always sits on the Stage, which gives the blur something to refract.

## Stage (`<Stage shift dots>`)

- **Light blobs.** Four radial blobs drift slowly on sine paths:
  - electric: r 560 at (560,420), opacity .42
  - violet: r 520 at (1380,660), opacity .40
  - sky: r 380 at (1000,180), opacity .45
  - lilac: r 300 at (260,900), opacity .50
- **Dot grid.** 2 px dots at a 32 px pitch, drifting diagonally at 0.8 and 0.3 px per frame, masked to a centre ellipse.
- **Top light.** A soft white glow from above.
- **`shift`.** Each scene uses a different `shift` (0, 1, 6, 7, 5…) so the light composition changes between scenes without a hard cut.

## Type

| Role | Font | Size | Notes |
|------|------|------|-------|
| Wordmark (reveal) | Inter Tight 800 | 190 | letter-by-letter rise, −0.04em |
| Hook lines | Inter Tight 800 | 150 | two lines at top 330 / 500 |
| Verdict line (solution) | Inter Tight 800 | 120 | top 860 |
| Turn line / CTA line | Inter Tight 800 | 110 | top 310 / 450 |
| Window title | Inter Tight 800 | 76 | inside the browser card |
| Problem lines | Inter Tight 800 | 64 | bottom, top 920 |
| Timer digits | Inter Tight 800 | 132 | tabular-nums |
| Terminal prompt | JetBrains Mono | 42 | electric `›`, violet `▌` caret |
| Mono labels | JetBrains Mono 700 | 20-32 | letter-spacing 8-14 px, `mute` |

- Headlines use `inkText()`, a vertical ink → ink2 gradient that gives them depth.
- The one accent word uses `accentText()`.
- Line height is 1.02 and letter-spacing is −0.045em.
- The type is never outlined and never shadowed.

## Formats

Any size works. `kit/layout.tsx` lays scenes out on a virtual canvas whose short side is 1080 units, then scales the result to the real frame. Type, radii and shadows therefore keep their proportions everywhere, and each block picks one of three arrangements:

| Arrangement | Examples | How blocks arrange themselves |
|---|---|---|
| **wide** | 16:9, 2:1 | the reference layout: side-by-side panes, logo and wordmark in a row, CTA button with the URL beside it |
| **tall** | 9:16 | stacked panes, logo above the wordmark, a full-width window with the cards scaled to fit, everything centred |
| **square** | 1:1, 4:5 | compact: panes side by side at half width, a shorter timer, tighter type |

Headlines shrink to fit the frame width (`fitSize`), and hero tiles use per-format spots that keep the middle band free for text. When you build your own scene, read `useLayout()` (`W`, `H`, `kind`, `cx`, `cy`) and use `pick(L, {wide, tall, square})`.

## Layout (wide, 1920×1080)

- Keep a centred composition. Headlines span the full width and are centred.
- Big panes sit about 150 px from the side edges.
- Timers and chips sit about 40-60 px from the top.
- CTAs and footers sit about 90 px from the bottom.
- The logo tile in the reveal sits at (490, 410, 260×260). The timer in the problem act grows out of that exact rectangle, so move them together.
- Keep a 60 px safe margin. Nothing important should touch the frame edge unless it is deliberately flying through.

## Motion vocabulary

| Curve | Bezier | Use |
|-------|--------|-----|
| EXPO | (0.16, 1, 0.3, 1) | anything entering: words, panes, ripples, dots |
| EXPO_IN | (0.7, 0, 0.84, 0) | punch-ins, shockwave growth, things leaving fast |
| SNAP | (0.85, 0, 0.15, 1) | morphs (tile → timer), toggles, card pushes, the camera pull-back |
| SOFT | inOut cubic | crossfades, the freeze, background changes |

Spring pops use `pop(frame, at, damping, stiffness)`:

| Element | Damping / stiffness |
|---------|---------------------|
| Cards and tiles | 11-13 / 150-180, which gives a visible overshoot |
| Toasts, badges and chips | 8-10 / 220-260, which is snappy |

Typical durations:

| Move | Frames |
|------|--------|
| A word rises | 14 |
| Words are staggered | 2-3 apart |
| A pane slides in | 14 |
| A morph | 18 |
| A sheen crosses a card | 22 |

## Signature moves

- **KineticLine.** Words rise out of an overflow-hidden mask from 110%, with a 6° rotation that settles. `out` sends them up and away.
- **Wordmark rise.** Each letter rises 2 frames after the previous one. The tag below letter-spaces out from 0.05em to 0.55em as it fades in.
- **Dotted ripples.** Three dotted electric circles expand from the centre, 5 frames apart, and fade as they grow.
- **Card burst (hook).** Seven glass cards spring out from behind the headline to fixed positions, each with a small tilt. They float on sines, sheens cross them, and at the end they fly outward while the camera punches in (scale ×1.9, blur 14).
- **Sheen.** A skewed white band sweeps across a glass card once, about 14-20 frames after the card lands.
- **Growing shake.** In the problem act the camera shake amplitude rises linearly from 1 px to 10 px. Past 55% the timer turns alert-red and pulses, and the whole frame breathes red at 7%.
- **Odometer.** Characters roll vertically from the old string to the new one, left to right, as prices do on a toggle flip.
- **Stopwatch stop.** A glass pill counts `00:0N`. On the spoken number it pops (+25%, decaying), gets an electric ring and ✓, then grows as the camera pulls back.
- **Pull-back.** On the verdict line the whole solution scales to 0.86, moves up 40 px and blurs 3 px. Only the stopwatch and the verdict line stay sharp.
- **Orbit.** On the end card, six small live glass tiles orbit the logo on an ellipse (380×150). They are depth-sorted by the sine of their angle and scaled 0.45-0.65.
- **Dot burst.** A clicked button bursts 14 electric and violet dots outward on an ellipse.
- **DotNumber** (available). A number assembled from flying dots on a 5×7 dot matrix. Use it for a counting-up hook.

## Logo

The logo is a flat SVG in a 100×100 viewBox, drawn in `P.ink` with one `P.electric` accent, and it assembles itself:

1. The tile scales in.
2. Its parts slide in from alternating sides, 3 frames apart.
3. An accent detail arrives last.

It sits inside a glass tile with no fill of its own. A supplied logo that is a raster, or has many colours, goes on the glass tile as an image. Do not recolour a brand's logo without asking.

## The product's world

Glass props show what the product is about. The template's example shows toggles and sliders for a UI library; a coffee shop's film can show cups and prices on glass. See the table in `stories.md`. Choose content that viewers can connect to the product.

## Density

At every moment the frame should contain:

- a living background (blobs and grid),
- one thing to read,
- one or two things moving with purpose,
- small ambient motion, such as floating cards, a blinking caret or animated bars in the glyphs.

Keep one main message readable while the surrounding motion supports it.
