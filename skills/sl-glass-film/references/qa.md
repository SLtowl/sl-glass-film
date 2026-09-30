# QA: look before you hand over

A render that finished is not a film that works. Always look at frames.

## Commands

```bash
python scripts/qa.py strip out/film.mp4                          # the whole film, a frame every 0.5 s
python scripts/qa.py strip out/film.mp4 --from 8.6 --to 9.4 --every 0.033   # one moment, frame by frame
python scripts/qa.py frame out/film.mp4 16.2                     # one full-size frame (read text, check alignment)
python scripts/qa.py jumps out/film.mp4                          # sudden changes that are not planned cuts
python scripts/qa.py finish out/film.mp4 out/film_final.mp4      # −14 LUFS / −1.5 dBTP
```

Open the images and look at them. When a cut or a click looks wrong at 0.5 s steps, zoom in with `--every 0.033`, which is every frame.

## Checklist

**Story and timing**

- [ ] Each kinetic line appears on its spoken word, not before the voice reaches it and not a second late.
- [ ] If the story has a time-stop, the picture, the `freeze` sound and the music tape-stop all land on the same word.
- [ ] Every number on screen matches the spoken number and is true for the product.
- [ ] The voice ends at least 2 s before the end, so the end card breathes.

**Picture**

- [ ] Nothing is clipped by accident: buttons inside cards, the last letter of the wordmark, long toasts, the URL at the end.
- [ ] The cursor tip lands on the centre of the CTA button. Check a full-size frame at `buttonAt + 18` frames.
- [ ] There are no empty frames. Each transition's incoming scene is already mid-animation.
- [ ] Background and colour changes are soft; `qa.py jumps` shows jumps only at planned cuts.
- [ ] One accent word per line, spelled exactly as agreed.
- [ ] No text overlaps other text, including toasts over kinetic lines and the stat chip over the stopwatch.
- [ ] Check the actual format (wide, tall or square) at full size. Long brand names, URLs and prompts fit without clipping.
- [ ] Tiles and panes show the product's own world, not generic UI props.
- [ ] Alert red appears only where something is going wrong.

**Sound**

- [ ] Every new element has an SFX line.
- [ ] Whooshes peak on the cuts.
- [ ] The music ducks under the voice, and the voice is always intelligible.
- [ ] The final file measures about −14 LUFS.

## Common implementation problems

- **A crash from early drawing.** A scene drawn during a transition's lead-in used a negative local frame as an array index (`Math.floor(local / 7) % 4` gave −1). Clamp local time.
- **The cursor missed the button.** The button and the URL shared one flex container, so the button's centre moved with the URL's width. The fix was to place the button at a fixed centre point (`BTN` in EndCard), place the URL separately beside it, and aim the cursor tip at the exact point.
- **A clipped button.** The broken-button preview had a fixed width with `overflow: hidden` on the wrong element, so the button was cut off. Let props size themselves, and clip only masks.
- **Stale renders.** Two render processes wrote the same output file at once. Render one at a time, and wait for the process to finish before judging the file.
- **Abrupt background colour changes** made the film feel cheap. All background and colour changes use SOFT easing over at least 10 frames.
- **Monotony.** The same transition at every cut, and scenes that just sat there, both made the film feel static. Vary the cuts, and keep one or two things moving at all times.
- **Rolling digits overlapped.** An odometer with proportional digits squeezed "0:00" into a smudge while rolling. Digits are tabular now; never size a rolling column by one character.
- **Irrelevant props.** A film about a video tool opened with UI toggles and play buttons flying in. Props must come from the product's world.
- **A "sticker" look.** Cartoon outlines and thick strokes around UI clash with glass. Use glass, hairlines and soft shadows only.
- **Bells in the music.** Use the defined sound palette: plucks, pads, supersaws and percussion.
- **Music too loud under the voice.** Keep the ducking at 0.32 or lower while the voice speaks.
