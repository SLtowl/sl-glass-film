"""The score, synthesized from scratch and arranged on the film's timeline (src/timeline.json).

Each scene has a mood (script.py MOODS); the music follows the moods, whatever the story is:

  bright    major plucks in 8ths + one airy supersaw chord per bar
  tension   minor; kick, a clock tick on every beat and off-beat, 16th bass, stabs whose filter opens as it goes
  hold      near silence: an airy pad swelling, a riser into the next scene
            (if the film has STOP_CUE, everything before it tape-stops - slows to a halt - on that word)
  drop      the payoff: impact, kick, claps on 2 & 4, 16th hats, off-beat bass, plucks, bright chords

Scene changes get their own accents: a riser + low impact into a bright scene, a reverse swell into tension,
a big impact into a drop after a hold, swell + filtered impact between two drop scenes. A final open chord closes.

  python scripts/score.py              # default seed 7 (the reference cut)
  python scripts/score.py --seed 12    # another key and voicing, same arrangement
"""
import argparse
import json
from pathlib import Path

import numpy as np
from scipy.io import wavfile
from scipy.signal import fftconvolve

from synth import SR, Track, bass_note, clap, filt, hat, impact, kick, pluck, reverse_swell, riser, supersaw_chord, tvec

ROOT = Path(__file__).resolve().parent.parent
MAJOR = [0, 2, 4, 5, 7, 9, 11]
MINOR = [0, 2, 3, 5, 7, 8, 10]


def tick(accent=False):
    t = tvec(0.05)
    f = 3200 if accent else 2500
    return np.sin(2 * np.pi * f * t) * np.exp(-t / 0.006) * (0.9 if accent else 0.6)


def tape_stop(x, start, dur):
    """Slow the signal to a halt over `dur` seconds from `start` (pitch and speed drop together)."""
    i0 = int(start * SR)
    n = int(dur * SR)
    rate = np.linspace(1, 0, n) ** 1.6
    pos = i0 + np.cumsum(rate)
    out = x.copy()
    for c in range(x.shape[1]):
        out[i0:i0 + n, c] = np.interp(pos, np.arange(len(x)), x[:, c]) * np.linspace(1, 0.2, n)
    out[i0 + n:] = 0
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--seed", type=int, default=7)
    ap.add_argument("--bpm", type=float, default=None, help="default: bpm from the timeline (script.py BPM)")
    ap.add_argument("--out", default=str(ROOT / "public" / "music.wav"))
    a = ap.parse_args()
    rng = np.random.default_rng(a.seed)
    np.random.seed(a.seed)

    tl = json.loads((ROOT / "src" / "timeline.json").read_text(encoding="utf-8"))
    dur = tl["duration"]
    scenes = tl["scenes"]
    starts = [s["start"] for s in scenes] + [dur]
    stop_at = tl["stop"] - 0.05 if tl.get("stop") is not None else None
    beat = 60 / (a.bpm or tl["bpm"])
    key = int(rng.integers(57, 62))

    def chord(deg, scale):
        return [key + scale[(deg + i) % 7] + 12 * ((deg + i) // 7) for i in (0, 2, 4, 6)]

    def scene_at(t):
        k = max(i for i in range(len(scenes)) if starts[i] <= t + 1e-6)
        return k

    def mood_at(t):
        k = scene_at(t)
        m = scenes[k]["mood"]
        # a hold scene keeps the previous mood running until the tape-stop word
        if m == "hold" and stop_at is not None and t < stop_at and k > 0:
            return scenes[k - 1]["mood"], k - 1
        return m, k

    pre = Track(dur + 2)    # everything before the tape-stop
    post = Track(dur + 2)   # after it (and fx that must survive it)
    K, H = kick(), hat(rng)

    def root_of(notes):
        r = notes[0] - 24
        while r > 45:
            r -= 12
        return r

    for b in range(int(dur / beat) + 1):
        t = b * beat
        if t >= dur - 0.4:
            break
        tr = pre if stop_at is not None and t < stop_at else post
        mood, k = mood_at(t)
        if mood == "bright":
            notes = chord([0, 4, 5, 3][(b // 4) % 4], MAJOR)
            for j in range(2):
                tr.add("music", filt(pluck(notes[(b * 2 + j) % 4] + 12), "low", 5000), t + j * beat / 2, 0.24, pan=0.4 if j else -0.4, send=0.3)
            if b % 4 == 0:
                tr.add("music", supersaw_chord(notes, 4 * beat * 0.95, 1900), t, 0.28, send=0.5)
        elif mood == "tension":
            end = stop_at if stop_at is not None and stop_at > starts[k] else starts[k + 1]
            prog = min(1.0, (t - starts[k]) / max(0.1, end - starts[k]))
            notes = chord([0, 5, 3, 4][(b // 4) % 4], MINOR)
            tr.add("drums", K, t, 0.75)
            tr.add("fx", tick(b % 4 == 0), t, 0.5)
            tr.add("fx", tick(), t + beat / 2, 0.35)
            for j in range(4):
                tr.add("bass", bass_note(root_of(notes) + (12 if j == 3 else 0), beat * 0.2), t + j * beat / 4, 0.4 + 0.2 * prog)
            if b % 2 == 0:
                tr.add("music", supersaw_chord(notes, 2 * beat * 0.95, 900 + 3000 * prog), t, 0.22 + 0.1 * prog, send=0.4)
        elif mood == "drop":
            notes = chord([0, 4, 5, 3][(b // 4) % 4], MAJOR)
            tr.add("drums", K, t, 0.95)
            if b % 2 == 1:
                tr.add("drums", clap(rng), t, 0.45, send=0.3)
            for j in range(4):
                tr.add("drums", H, t + j * beat / 4, 0.2 if j == 2 else 0.11, pan=0.3 if j % 2 else -0.3)
            tr.add("bass", bass_note(root_of(notes), beat * 0.45), t + beat / 2, 0.6)
            for j in range(2):
                tr.add("music", filt(pluck(notes[(b * 2 + j) % 4] + 12), "low", 5500), t + j * beat / 2, 0.28, pan=0.45 if j else -0.45, send=0.3)
            if b % 4 == 0:
                tr.add("music", supersaw_chord(notes, 4 * beat * 0.95, 3400), t, 0.3, send=0.5)
        # hold: nothing rhythmic

    # accents on scene changes
    for k in range(1, len(scenes)):
        t0, m, prev = starts[k], scenes[k]["mood"], scenes[k - 1]["mood"]
        if m == "bright":
            post.add("fx", filt(impact(rng), "low", 1500), t0, 0.8, send=0.4)
            post.add("fx", riser(rng, 1.3), t0 - 1.3, 0.35, send=0.4)
        elif m == "tension":
            post.add("fx", reverse_swell(rng, 0.5), t0 - 0.5, 0.5, send=0.3)
        elif m == "hold":
            h0 = stop_at if stop_at is not None and stop_at >= t0 - 0.5 else t0
            nxt = starts[k + 1]
            pad = supersaw_chord(chord(0, MAJOR), nxt - h0 + 0.3, 1300)
            post.add("music", pad * np.linspace(0, 1, len(pad)), h0 + 0.25, 0.25, send=0.6)
            post.add("fx", riser(rng, max(0.3, nxt - h0 - 0.1)), h0 + 0.1, 0.45, send=0.4)
        elif m == "drop" and prev == "drop":
            post.add("fx", reverse_swell(rng, 0.5), t0 - 0.5, 0.45, send=0.3)
            post.add("fx", filt(impact(rng), "low", 1200), t0, 0.6, send=0.4)
        elif m == "drop":
            post.add("fx", impact(rng), t0, 1.0, send=0.5)
    post.add("music", supersaw_chord(chord(0, MAJOR), 2.2, 2600), dur - 2.4, 0.32, send=0.7)

    def render(tr):
        ir_t = tvec(1.8)
        ir = np.stack([rng.standard_normal(len(ir_t)), rng.standard_normal(len(ir_t))], 1) * np.exp(-ir_t / 0.45)[:, None]
        ir = filt(ir.T, "low", 6000).T
        wet = np.stack([fftconvolve(tr.reverb_send[:, c], ir[:, c])[: tr.n] for c in range(2)], 1) * 0.045
        return tr.buses["drums"] + tr.buses["fx"] + tr.buses["music"] + tr.buses["bass"] + wet

    mix = render(post)
    if stop_at is not None:
        mix = mix + tape_stop(render(pre), stop_at, 0.45)
    mix = mix[: int(dur * SR)]
    tt = np.arange(len(mix)) / SR
    mix *= np.clip((dur - tt) / 1.0, 0, 1)[:, None]
    mix = filt(mix.T, "high", 30).T
    mix = np.tanh(mix * 1.1)
    mix *= 0.89 / np.max(np.abs(mix))
    Path(a.out).parent.mkdir(parents=True, exist_ok=True)
    wavfile.write(a.out, SR, (mix * 32767).astype(np.int16))
    print("music ->", a.out, "| moods:", " ".join(f"{s['id']}={s['mood']}" for s in scenes), f"| tape-stop {stop_at:.2f}s" if stop_at else "")


if __name__ == "__main__":
    main()
