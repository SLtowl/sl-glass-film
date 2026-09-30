# Blocks

Scenes are built from blocks in `template/src/blocks/`. Every block:

- takes frames as props (computed from `cue()` / `scene()` in `Film.tsx`);
- arranges itself for wide, tall and square frames (`kit/layout.tsx`);
- exports a `*Sfx()` helper that returns its sounds.

A film is simply a list of scenes, each rendered by a block or by a custom component built from the kit.

| Block | What it does | Key props | Good as |
|---|---|---|---|
| **Headline** | 1-3 kinetic lines. Optional hero tiles burst in around them, and an optional DotNumber. It pans slowly and can punch into the lens at the end | `lines[{text, accent, at}]`, `tiles`, `number`, `punch` | opening, statements, chapter titles, manifesto lines |
| **LogoReveal** | The logo tile pops, dotted ripples spread, the wordmark rises letter by letter, the tag letter-spaces out | `name`, `tag`, `Logo`, `tagAt` | the name moment |
| **Pressure** | A countdown (optionally grown out of the logo tile), manual work typed on the left, the broken result twitching on the right, error toasts, growing shake, alert red past 55% | `timer`, `work`, `result.Broken`, `errors`, `lines`, `peak` | pain, deadlines, "the old way" |
| **Turn** | Freezes the previous scene: grey, blur, white veil. A mono badge, one line, an optional glass terminal with a typed prompt | `at`, `A`, `badge`, `line`, `terminal` | the twist, "Or…", "The answer:", a pause |
| **Assemble** | A glass window springs up. Title, optional toggle, and 1-3 cards drop in. One state flip on a spoken word makes every card react. A stat chip and a status pill, then a pull-back and the verdict line | `title`, `cards`, `card(i, {flip})`, `flipAt`, `stat`, `pill`, `verdict` | the result, a feature, proof |
| **EndCard** | The logo tile with orbiting hero tiles, the CTA line, a button that the cursor clicks exactly, a dot burst, the URL and a footer | `line`, `button`, `buttonAt`, `url`, `footer`, `tiles` | the ending |

## Building a new scene from the kit

When no block fits, compose a scene from the kit:

- `Stage` (always the background),
- `Card` (glass),
- `KineticLine`,
- `Sheen`, `Odometer`, `DotNumber`, `Toast`, `Cursor`, `WindowBar`, `StatChip`.

Keep to the motion vocabulary in `style.md` and read the frame size with `useLayout()`. Give the scene an `xxxSfx()` list.

## Wiring a film (`src/film/Film.tsx`)

```tsx
const VIEWS = {intro: () => <Headline {...intro()} />, name: () => <LogoReveal {...name()} />, ...};
const CUTS = {name: 'Burst', feature: 'Whip', end: 'PushCard'};   // the cut INTO each scene
<Canvas><Edit views={VIEWS} cuts={CUTS} /></Canvas>
sfx = [...headlineSfx(intro()), ..., ...cutSfx(CUTS)]
```

- Scene ids come from `script.py → LINES`. Their order and number are free.
- `cutSfx(CUTS)` adds the sound of every cut.
- `Film.tsx` in the template is the reference film. Use it as a worked example of the wiring, not as a structure to keep.
