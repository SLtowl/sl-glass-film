---
name: sl-glass-film
description: >-
  Make product films in the SL Glass Film style: a bright, premium, fast motion-design look. It has a white stage lit by electric-blue and violet light, frosted-glass cards and heavy kinetic typography. Every cut is a different transition (white-flash burst, match cut, time-stop freeze, glass shockwave, card push, glass wipe). The music is synthesized and follows the mood of each scene, and every movement has a sound. The style works with any story, format (16:9, 9:16, 1:1) and length. It is built in Remotion with a voice-over. Use it when the user wants a promo, launch video, teaser, explainer, trailer, reel or motion-design ad for a product, app, library, service or brand, even if they do not name a style. Also use it for "sl-glass-film", "glass style video" or "frosted glass promo".
---

# SL Glass Film

This skill carries a **visual language and a mood**, not a fixed video. Whatever the story, format or length, the result should feel like the reference film: light, premium, fast, dense but readable, with every cut a small event.

The story, the length and the format belong to the user. You propose stories and choose the blocks; the style stays constant.

## The style in one screen

- **Light.**
  - A cool white stage (`#F5F6FB`).
  - Four soft light blobs drift behind everything: electric `#4F5BFF`, violet `#7B5CFF`, sky and lilac.
  - A fine dot grid drifts diagonally.
  - Colour comes only from this light and from one electric-to-violet gradient.
  - Alert red appears only where something is going wrong.
- **Material.**
  - Frosted white glass: a translucent white fill, a strong backdrop blur and a bright top edge.
  - A hairline border, a coloured drop shadow and a violet inner glow.
  - Everything that holds content sits on glass.
- **Type.**
  - Inter Tight 800, set tight (−0.045em). Words rise out of a mask one after another with a small settling rotation.
  - One word per line carries the gradient.
  - JetBrains Mono for small letter-spaced labels.
- **Motion.**
  - Fast out and long settle when things enter.
  - A violent ease-in for punch-ins.
  - A symmetric snap for morphs.
  - Springs with a little overshoot for pops.
  - Soft in-out for anything that must not jump.
  - Nothing moves linearly except clocks and the drifting grid.
- **Cuts.**
  - Every scene change is a different transition, and each has its own sound.
  - The signature one is the **time-stop**: the frame freezes, drains to grey, blurs and veils white while something new arrives sharp and in colour. The music tape-stops with it.
- **Sound.**
  - An original synthesized score. Each scene gets a mood (bright, tension, hold, drop) in any order the story needs.
  - A synthesized UI sound kit: glassy pops, clicks, keys, swishes, whooshes, a Shepard-tone tension, a freeze sweep.
  - Something makes a sound whenever something moves.
- **Density.** At any moment the frame holds:
  - one thing to read,
  - one or two things moving with purpose,
  - a living background,
  - small ambient motion.

Details: `references/style.md` (tokens, glass recipe, type scale, motion vocabulary, signature moves), `references/transitions.md` and `references/sound.md`.

## Workflow

### 1 · Brief

Ask, in one message, only what you cannot infer:

- **The product.** What it is and who it is for, plus a logo if there is one.
- **The facts.** Numbers and speeds that are true and worth showing.
- **The CTA.** The action and where it leads.
- **Format and length.** For example 16:9, 20 s or 9:16, 30 s. Defaults: 16:9, 20 s.
- **Voice.** ElevenLabs with a key configured locally, edge-tts, or no voice.

### 2 · Propose stories

Read `references/stories.md`. Offer **2-3 stories** that fit this product, each in 2-3 sentences with its beats, moods and blocks, and recommend one. The deadline race is only one of them. Offer it when the product really replaces a painful manual process.

The user chooses, combines them or brings their own story. Then agree on:

- the spoken lines (show them before spending voice credits),
- **what the product's world looks like on screen**: tiles, panes and windows show the product's own things, never generic UI props.

### 3 · Scaffold

Copy `template/` (everything except `node_modules`, `out`, and `public` apart from `public/fonts`) into a new folder in the user's workspace, for example `<product>-film/`. Never edit the skill's own template in place. Then run:

```bash
npm install
pip install -r requirements.txt
python scripts/sfx.py
```

### 4 · Script → voice → timeline

In `script.py`, set:

- `WIDTH`, `HEIGHT` and `DURATION`;
- `LINES`: free scene ids, in any order and any number;
- `CUES`: the spoken words that fire animations;
- `MOODS`: the music under each scene;
- `STOP_CUE`, only if the story has a time-stop.

Then build the timeline with the command that matches the voice choice:

```bash
# voice with an ElevenLabs key; add --engine edge for the free voice
python scripts/voice.py

# no voice yet: estimated timings
python scripts/timeline.py --estimate
```

After changing only cues or moods, rebuild without recording again:

```bash
python scripts/timeline.py --reuse
```

See `references/voice.md` for voice choice and account requirements.

### 5 · Build the scenes

Read `references/blocks.md`. Compose `src/film/Film.tsx` from the blocks:

- Headline, LogoReveal, Pressure, Turn, Assemble, EndCard,
- plus scenes you build from the kit when no block fits.

Put the product's content in `src/film/content.tsx`:

- hero tiles,
- the manual work and its broken result,
- the card bodies,
- the logo mark.

Choose the cut into each scene in `CUTS`. No two neighbouring cuts may be the same.

The template's `Film.tsx` is the reference film (SL UI Library, the deadline race). Treat it as a worked example of the wiring, then replace it.

### 6 · Sound

```bash
python scripts/score.py     # follows MOODS; --seed N gives another key or voicing
```

Every block contributes its sounds. Add a sound for every element you create yourself.

### 7 · Render and QA

```bash
npm run render
python scripts/qa.py strip out/film.mp4
python scripts/qa.py jumps out/film.mp4
python scripts/qa.py finish out/film.mp4 out/film_final.mp4
```

Look at the contact sheet and at full-size frames of every moment you changed, in the actual format. Go through `references/qa.md`: it lists common implementation problems and how to check them.

### 8 · Hand-off

Deliver:

- the final MP4 at −14 LUFS,
- a poster frame,
- a GIF if wanted.

State:

- the voice used and its licence (ElevenLabs free-tier output requires attribution and is non-commercial),
- that the music and SFX are generated by the project's scripts,
- anything you could not check.

## Rules that keep the style

Keep these unless the user asks otherwise.

- **Light, never dark.** Palette changes happen only in `kit/tokens.ts`. There is no green and no acid colours.
- **The product's world on screen.** Tiles, panes and windows show what the product is about.
- **One accent word per line.**
- **The voice drives the edit.** Frames come from `cue()` and `scene()`, never hard-coded seconds.
- **Every cut is a transition,** and neighbouring cuts differ.
- **Everything that moves makes a sound.** Silence is used only on purpose.
- **Motion has weight.** Use the four easing curves and springs, and nothing linear.
- **Soft backgrounds.** Light and colour changes ease over at least 10 frames; nothing flashes except the Burst.
- **Nothing is clipped by accident.** Nothing sticks out of the frame, gets cut by a card edge, or overlaps other text.
- **The cursor hits the button exactly.**
- **Any format.** Design once and check wide, tall or square as needed. Blocks rearrange themselves; your own scenes must use `useLayout()`.

## Files

```
template/
  script.py                 format, length, lines, word→cue map, moods, voice
  src/film/Film.tsx         the film: scenes → blocks, cuts, sound (reference film as example)
  src/film/content.tsx      the product's world: tiles, manual work, broken result, card bodies
  src/blocks/*.tsx          Headline, LogoReveal, Pressure, Turn, Assemble, EndCard
  src/kit/tokens.ts         palette, fonts, easing, glass, gradient text
  src/kit/stage.tsx         Stage, KineticLine, DotNumber, Sheen
  src/kit/ui.tsx            Card, Toggle, Slider, Button, Tabs, Odometer, Toast, Cursor, WindowBar, StatChip
  src/kit/tiles.tsx         BurstTiles, OrbitTiles (hero tiles)
  src/kit/transitions.tsx   Burst, MatchCut, TimeStop, Shockwave, PushCard, Whip, GlassWipe, Dissolve
  src/kit/cuts.tsx          Edit (scene list + cut per scene), cutSfx
  src/kit/layout.tsx        Canvas, useLayout, pick, fitSize - wide / tall / square
  src/kit/Logo.tsx          example logo mark
  scripts/                  voice.py, timeline.py, score.py (+synth.py), sfx.py, qa.py
references/
  style.md  transitions.md  sound.md  stories.md  blocks.md  voice.md  qa.md
```
