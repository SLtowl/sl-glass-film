# Stories: propose, don't prescribe

The skill carries a **style**. The story belongs to the user's product and is chosen together with the user.

Read the product first: what it is, who it is for, what changes for them, and what can honestly be shown. Then **propose 2-3 stories** that fit, each in 2-3 sentences:

- its title,
- its beats,
- the moods under each beat,
- which blocks and cuts it uses.

Recommend one of them. The user picks one, mixes them, or writes their own. Their own idea always wins, as long as it can be told in this style.

Below is a library of shapes that suit the style, not a list to choose from mechanically. Adapt the beats and invent new ones. The style only asks for a few things:

- short lines, one idea on screen at a time;
- a clear visual payoff;
- a different cut at every scene change.

## The library

### The deadline race *(the reference film)*

- **Beats:** truth, then name, then pain against a clock, then "Or…" (time stops), then the result assembles in seconds, then CTA.
- **Blocks:** Headline + tiles → LogoReveal → Pressure → Turn (+terminal) → Assemble → EndCard.
- **Cuts:** Burst → MatchCut → (TimeStop) → Shockwave → PushCard.
- **Moods:** bright, bright, tension, hold, drop, drop.
- **Best for:** tools that replace slow manual work (dev tools, AI agents, automation).
- **Weak for:** products with no "old painful way", or where the pain is too serious to play for fun (health, grief, money trouble).

### Before / After

- **Beats:** name, then the old way (grey, slow, cluttered), then one glass wipe, then the new way (colour, calm, fast), then proof, then CTA.
- **Blocks:** LogoReveal → Pressure without the timer's red or with a calmer label, or a custom "grey" scene → **GlassWipe** → Assemble → EndCard.
- **Moods:** bright, tension or hold, drop, drop.
- **Best for:** redesigns, migrations, "switch from X".

### One number

- **Beats:** a big number assembles from dots, then what it means, then the name, then two or three short proofs, then CTA.
- **Blocks:** Headline with `number` (DotNumber) → Headline → LogoReveal → Assemble → EndCard.
- **Moods:** hold, bright, bright, drop, drop. Starting quiet and growing works well here.
- **Best for:** products with one striking fact: users, stars, speed, savings, a record.

### Manifesto

- **Beats:** three or four short statements, each its own Headline (no tiles, or very few), then the name as the answer, then CTA.
- **Blocks:** Headline ×3-4 (alternate Whip / GlassWipe / Dissolve between them) → LogoReveal → EndCard.
- **Moods:** calm to rising, for example hold, bright, bright, drop, drop, or no drop at all.
- **Best for:** brands, launches, communities, anything with a point of view.

### Product tour

- **Beats:** name, then feature 1, 2, 3. Each is one Assemble-style window with one state change on a spoken word. Then CTA.
- **Blocks:** LogoReveal → Assemble ×3 (cuts: Whip, GlassWipe, PushCard) → EndCard.
- **Moods:** bright, then drop, drop, drop, or bright, bright, drop, drop.
- **Best for:** apps with visible UI, updates and changelogs ("what's new").

### A day with it

- **Beats:** morning, then midday, then evening. Each shows one moment where the product helps, then CTA.
- **Blocks:** Headline (time of day as the kinetic line), then an Assemble or a custom glass scene per moment, then EndCard.
- **Moods:** bright throughout, with a drop at the end, or a single hold in the middle for a "wait, what?" moment.
- **Best for:** consumer products, habits, services.

### Question → Answer

- **Beats:** a question the viewer has asked themselves ("Why is shipping still this hard?"), then a Turn with no terminal (badge "THE ANSWER", one line), then the name, then proof, then CTA.
- **Moods:** tension or hold first, then drop.
- **Best for:** short teasers of 10-15 s.

Mix freely. For example: Manifesto opening → Deadline race turn → Product tour payoff.

## Writing the lines

- **Words.** Around 2.3 spoken words per second of film, minus the end card. A 20 s film has about 45 words, 30 s about 70, 15 s about 32. The user decides the length; the words follow it.
- **Short lines.** One idea per line, 3-8 words on screen at once. The screen echoes the voice in shorter form.
- **Numbers.** Spell them as words for the voice; show them as digits on screen.
- **One accent word per line** gets the gradient. Choose the word that carries the meaning.
- **Voice leads the edit.** Every visual hit is pinned to a spoken word through a cue. Pick the words you want things to happen on.
- **No hype adjectives** such as revolutionary, powerful or seamless. The picture does the bragging.
- **Only true claims.** Numbers and speeds must be real for the product. Ask the user for them rather than inventing them.

## Filling the scenes with the product's world

Hero tiles, the "manual way" pane, the broken result and the assembled window all show **the product's own world**. They are never generic props. The reference film shows toggles and sliders because it is about a UI component library. The same move for other products:

| Product | Tiles | Pressure left / right | Assemble window |
|---|---|---|---|
| UI library | live toggles, sliders, tabs | CSS typed by hand / broken button | pricing section with a flipping toggle |
| Video / creative tool | film frames with timecodes, waveforms, colour swatches | keyframes set by hand / stuttering player | tracks of the film: voice, music, sound |
| Analytics | sparklines, KPI numbers | VLOOKUP spreadsheet / broken chart | dashboard, week ↔ month flip |
| Dev tool / CLI | terminal lines, status badges, commit hashes | a 40-step checklist / red CI | pipeline cards going green |
| Coffee shop, retail | product photos on glass, prices, ratings | a paper queue list / "sold out" | the order card, size S ↔ L flip |

If you cannot name the product's world, ask the user. Do not fall back to UI glyphs.
