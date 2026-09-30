# Transitions

Every cut in the film is a different move, and every cut has a sound. In `Film.tsx` you name the cut **into** each scene:

```tsx
const CUTS = {reveal: 'Burst', problem: 'MatchCut', solution: 'Shockwave', end: 'PushCard'};
<Edit views={VIEWS} cuts={CUTS} />      // renders both scenes around each cut
sfx = [..., ...cutSfx(CUTS)]            // the sound of every cut
```

`Edit` swaps in the transition for a small window of frames around each cut; outside that window, only the current scene renders. The table below describes the reference film; any other order works too.

Because a scene is also drawn during the frames *before* its start, scene code must tolerate a negative local time. For example, write `Math.max(0, frame - s.from)` wherever the local time indexes an array. The reference cut crashed on frame 129 before this guard was added.

## The cuts (as used in the reference film)

| Cut | Window | What it looks like | Sound | Why here |
|-----|--------|--------------------|-------|----------|
| **Burst** hook → reveal | −6…+6 | Hook punches into the camera (the Hook scene does its own zoom ×1.9 and blur in its last 10 frames), the reveal comes up out of a white flash (85%) | `whoosh` at −8, `pop_lo` at 0, `sparkle` +2 | the energy peak of the opening; the flash hides the jump in content |
| **MatchCut** reveal → problem | −6…+2 | The problem scene fades in over the reveal. Its timer starts *exactly* on the logo tile's rectangle, then SNAP-morphs to the timer box over 18 frames while the logo fades out inside it | `whoosh` at −8 | the brand *becomes* the clock, a visual pun that links "meet X" to "deadline" |
| **TimeStop** (inside freeze) | from `f_or − 2` | The problem freezes on the frame, drains to 95% grey, blurs 9 px, scales to 0.95 and gets a 60% white veil (SOFT, 10 f). New UI arrives on top, sharp and in colour | `freeze` sweep, music tape-stop | the turn: maximum contrast between chaos and calm |
| **Shockwave** freeze → solution | −4…+12 | A circle clip grows from the terminal (960, 600) with EXPO_IN to R 2300. A thick white glass ring with electric and violet glow rides its edge | `whoosh` −6, `pop_lo` −2, music drop + impact at 0 | "Enter" was pressed and the answer spreads out from it |
| **PushCard** solution → end | −8…+8 | The solution lifts up as a rounded card (radius 0→60, scale 0.85, coloured shadow) while the end card rises from below; `bg2` shows between them | `whoosh` −10, swell + impact | a calm, confident close after the busiest scene |

## Spare cuts (for longer films or extra beats)

| Cut | Window | Look | Sound |
|-----|--------|------|-------|
| **Whip** | −7…+7 | A horizontal pan of 100% with SVG Gaussian motion blur that peaks at 70 px mid-move (SNAP) | `whoosh` at −8 |
| **GlassWipe** | −10…+10 | A huge frosted pane (120% wide, blur 40) slides right to left across the frame; the scene swaps behind it at the cut; a sheen runs across the pane | `swish` + `whoosh` |
| **Dissolve** | −len…+len | A crossfade with a blur of up to 14 px (SOFT) | none, or a soft `swish`; use it only for calm moments |

## Rules

- **Never use the same cut twice in a row.** Across the whole film, prefer each cut once.
- **Hide content changes.** A hard content change needs a mask: a flash, a ring, a pane, a card edge or motion blur. A bare crossfade between two busy scenes looks like a mistake.
- **Where A hides B, B is already moving.** The incoming scene is always mid-animation, never on a static first frame.
- **Use SOFT for background changes.** Ease changes in the stage colour over at least 10 frames.
- **Sound peaks on the cut.** Put the sound so its peak lands on the cut. `whoosh.wav` peaks 0.25 s (about 8 frames) after it starts, which is why it is placed at −8.

## Match-cut recipe

For a match cut, make B's hero object start at A's hero geometry, then morph:

```tsx
const morph = ease(frame, s.from - 6, s.from + 12, 0, 1, SNAP);
const box = {x: interpolate(morph, [0, 1], [TILE.x, TARGET.x]), /* y, w, h, r likewise */};
```

Share the rectangle as an exported constant (`LOGO_TILE` in `Reveal.tsx`) so the two scenes cannot drift apart.
