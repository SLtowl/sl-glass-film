# Sound design

The sound has three layers, all original:

- **Voice.** ElevenLabs or edge-tts.
- **Music.** `scripts/score.py`, synthesized with numpy and scipy, and arranged on `src/timeline.json`.
- **SFX.** `scripts/sfx.py`, placed per event in each scene's `*Sfx()` list.

The bundled sound palette uses synthesized plucks, pads, percussion and effects, without samples, stock music, bells or chimes.

## Music (`score.py`)

The score has no fixed arc. Each scene gets a **mood** in `script.py → MOODS`, in whatever order the story needs. You can drop tension entirely, open on a drop, or end in a hold. The key is picked from `--seed`, and the tempo comes from `BPM` (112 in the reference).

| Mood | Content | Use for |
|---|---|---|
| **bright** | Major plucks in 8ths (panned ±0.4, lowpass 5 kHz) and one airy supersaw chord per bar | openings, names, calm statements |
| **tension** | Minor. A kick on every beat, a clock tick on every beat and off-beat, a 16th bass, and stabs whose filter opens across the scene | pressure, problems, countdowns |
| **hold** | Near silence: an airy pad swelling, then a riser into the next scene | a pause, a question, the turn |
| **drop** | The payoff: kick, claps on 2 and 4, 16th hats, an off-beat bass, plucks and bright chords | results, features, the end |

**Accents on scene changes:**

- Into **bright**: a riser, then a low impact.
- Into **tension**: a reverse swell.
- Into **drop** after something else: a big impact.
- **Drop into drop**: a swell plus a filtered impact.
- **Close:** a final open chord and a 1 s fade.

**Tape-stop (`STOP_CUE`).** If the story has a time-stop, name its cue. Everything playing before that word slows to a halt within 0.45 s (pitch and speed drop together). A hold scene keeps the previous mood running until that word, so the stop lands exactly on it. Without `STOP_CUE` nothing stops.

The master bus is a short noise reverb, a 30 Hz highpass, gentle tanh saturation and a peak at 0.89.

## Mix (`Film.tsx`)

- **Music volume.** 0.7 before the voice, ducked to 0.32 from 6 frames after the first word to 6 frames after the last, then back up to 0.75 over 18 frames.
- **Voice** stays at 1.0, delayed by `VOICE_OFFSET` (0.5 s).
- **Fade.** The picture fades out over the last 16 frames.

## SFX kit (`sfx.py → public/sfx/*.wav`)

| Sound | Character | Used for | Typical volume |
|-------|-----------|----------|----------------|
| `pop_hi` / `pop` / `pop_lo` | Glassy pitch-down sine plus air | Any element appearing. Cycle the three pitches (`POPS`) | 0.2-0.55 |
| `click` | Tight UI click | Toggle flips, button presses, stopwatch stop | 0.5-0.6 |
| `key1`-`key4` | Keyboard clicks | Typing: `typing(from, to, every, vol)` | 0.18-0.2 |
| `enter` | Heavier return key | Prompt sent | 0.55 |
| `swish` | Short airy movement | Panes sliding, lines rising | 0.22-0.3 |
| `whoosh` | Big stereo sweep that peaks after 0.25 s | Cuts (place at cut − 8 f) | 0.3-0.35 |
| `error` | Low double "bonk" | Error toasts | 0.4 |
| `tension` | Endlessly rising Shepard tone, 4 s | Under the whole problem act | 0.32 |
| `alarm` | Two-tone pulse | Every 15 frames once the timer is critical | 0.18 |
| `freeze` | Downward "time stops" sweep | The freeze frame | 0.55 |
| `confirm` | Soft two-note rising chirp | Success (stopwatch ✓) | 0.45 |
| `sparkle` | Cluster of tiny blips | Dot bursts, logo reveal | 0.3-0.45 |

## Rules

- **Every visible event gets a sound.** That includes each card, toast, badge, toggle, keypress and cut. When you add an element, add its line to the scene's `*Sfx()` list in the same edit.
- **Silence is a tool.** The only near-silence is the freeze. That is what makes the drop hit.
- **Keep the voice on top.** SFX under the voice stay at 0.3 or below, and the pops in a burst stay at 0.2-0.35.
- **To add a new sound,** write a function in `sfx.py` in the same spirit: short, synthesized and not musical-bell-like. Call `save()` last in `__main__` so the existing sounds keep their random seeds.

## Loudness

The project's delivery target is −14 LUFS integrated with a true peak of −1.5 dB (`qa.py finish`). Follow a platform's or client's delivery specification if it differs. Measure the output:

```bash
ffmpeg -i out/film_final.mp4 -af ebur128 -f null - 2>&1 | tail -12
```
