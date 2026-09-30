"""UI sound-effect kit for the light-glass style, synthesized from scratch (no bells).

  python scripts/sfx.py            -> public/sfx/*.wav

Every visible event in the film gets one of these (see the *Sfx() lists in src/film/scenes).

pop_hi/pop/pop_lo  soft glassy pop for elements appearing (pitch-down sine + air)
click              tight UI click (toggle, button press)
key1..key4         keyboard clicks for typing
enter              heavier return key
swish              short airy movement (panes sliding, words rising)
whoosh             big stereo air sweep into a cut (transitions)
error              low double "bonk" for error toasts
confirm            soft two-note rising chirp (success)
sparkle            cluster of tiny blips for dot bursts
tension            4 s endlessly-rising Shepard tone for the deadline
alarm              short two-tone pulse for the critical timer
freeze             downward "time stops" sweep
"""
from pathlib import Path

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 44100
OUT = Path(__file__).resolve().parent.parent / "public" / "sfx"
rng = np.random.default_rng(11)


def t_(d):
    return np.arange(int(d * SR)) / SR


def filt(x, kind, f, order=2):
    return sosfilt(butter(order, f, btype=kind, fs=SR, output="sos"), x)


def env(t, a, d):
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)


def save(name, x, gain=0.9):
    x = x / (np.max(np.abs(x)) + 1e-9) * gain
    stereo = x if x.ndim == 2 else np.stack([x, x], 1)
    OUT.mkdir(parents=True, exist_ok=True)
    wavfile.write(OUT / f"{name}.wav", SR, (stereo * 32767).astype(np.int16))


def pop(f0):
    t = t_(0.16)
    f = f0 * (1 + 0.9 * np.exp(-t / 0.012))
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(t, 0.002, 0.045)
    air = filt(rng.standard_normal(len(t)), "band", [3000, 9000]) * env(t, 0.001, 0.01) * 0.25
    return body + air


def click():
    t = t_(0.06)
    tick = filt(rng.standard_normal(len(t)), "band", [2500, 7000]) * env(t, 0.0005, 0.004)
    thump = np.sin(2 * np.pi * 180 * t) * env(t, 0.001, 0.015) * 0.6
    return tick + thump


def key(seed):
    r = np.random.default_rng(seed)
    t = t_(0.07)
    tick = filt(r.standard_normal(len(t)), "band", [1800 + r.integers(0, 800), 6000]) * env(t, 0.0005, 0.006)
    body = np.sin(2 * np.pi * (240 + r.integers(0, 80)) * t) * env(t, 0.001, 0.012) * 0.35
    return tick + body


def enter():
    return key(99) * 0.6 + np.pad(click(), (0, int(0.01 * SR))) [: len(key(99))] * 0.8


def swish():
    t = t_(0.45)
    n = rng.standard_normal(len(t))
    out = np.zeros_like(t)
    segs = 10
    for i in range(segs):
        a, b = i * len(t) // segs, (i + 1) * len(t) // segs
        fc = 700 * 2 ** (2.2 * np.sin(np.pi * (i + 0.5) / segs))
        out[a:b] = filt(n, "band", [fc * 0.6, fc * 1.6])[a:b]
    shape = np.sin(np.pi * np.clip(t / 0.45, 0, 1)) ** 2
    return out * shape


def whoosh(d=0.5, peak=0.25):
    """Air sweep for cuts. Peaks `peak` s after it starts - place it 8 frames before the cut so the peak lands on it.
    Band-passed noise that brightens into the peak and darkens after, a little sub, panned slightly left -> right."""
    t = t_(d)
    n = rng.standard_normal(len(t))
    out = np.zeros_like(t)
    segs = 20
    for i in range(segs):
        a, b = i * len(t) // segs, (i + 1) * len(t) // segs
        x = ((i + 0.5) / segs * d - peak) / 0.12
        fc = 650 + 900 * np.exp(-x * x)
        out[a:b] = filt(n, "band", [fc * 0.45, fc * 1.9])[a:b]
    rise = np.exp(-np.maximum(0, peak - t) / 0.035)
    fall = np.exp(-np.maximum(0, t - peak) / 0.028)
    shape = rise * fall
    sub = np.sin(2 * np.pi * np.cumsum(90 - 40 * t / d) / SR) * shape * 0.25
    mono = np.tanh(2.2 * filt(out * shape, "low", 4500)) * 0.8 + sub
    pan = 0.5 + 0.5 * np.tanh((t - peak) / 0.08)
    left, right = np.cos((0.3 + 0.4 * pan) * np.pi / 2), np.sin((0.3 + 0.4 * pan) * np.pi / 2)
    return np.stack([mono * left, mono * right], 1)


def error():
    out = np.zeros(int(0.32 * SR))
    for k, st in enumerate((0.0, 0.13)):
        t = t_(0.16)
        x = np.sign(np.sin(2 * np.pi * (170 - k * 20) * t)) * env(t, 0.002, 0.05)
        x = filt(x, "low", 1200)
        i = int(st * SR)
        out[i:i + len(x)] += x
    return out


def confirm():
    out = np.zeros(int(0.4 * SR))
    for st, f in ((0.0, 880), (0.09, 1318)):
        t = t_(0.28)
        x = (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)) * env(t, 0.003, 0.07)
        i = int(st * SR)
        out[i:i + len(x)] += x
    return out


def sparkle():
    out = np.zeros(int(0.5 * SR))
    for k in range(9):
        t = t_(0.06)
        f = rng.uniform(2200, 4200)
        x = np.sin(2 * np.pi * f * t) * env(t, 0.001, 0.012)
        i = int(rng.uniform(0, 0.35) * SR)
        out[i:i + len(x)] += x * rng.uniform(0.4, 1)
    return out


def tension(d=4.0):
    """Shepard tone: octave-spaced partials gliding up under a fixed bell-shaped spectral envelope."""
    t = t_(d)
    out = np.zeros_like(t)
    base = 55.0
    for k in range(7):
        pos = (k + t / d) % 7  # each partial rises one octave over the clip, wrapping around
        f = base * 2 ** pos
        amp = np.exp(-0.5 * ((pos - 3.5) / 1.3) ** 2)
        out += np.sin(2 * np.pi * np.cumsum(f) / SR) * amp
    trem = 0.75 + 0.25 * np.sin(2 * np.pi * (2 + 6 * t / d) * t)
    return out * trem * np.minimum(1, t / 0.4) * np.minimum(1, (d - t) / 0.15)


def alarm():
    out = np.zeros(int(0.5 * SR))
    for st, f in ((0.0, 740), (0.22, 620)):
        t = t_(0.2)
        x = np.sin(2 * np.pi * f * t) * (1 + 0.4 * np.sin(2 * np.pi * 30 * t)) * env(t, 0.004, 0.09)
        i = int(st * SR)
        out[i:i + len(x)] += filt(x, "low", 2500)
    return out


def freeze():
    t = t_(0.7)
    f = 900 * np.exp(-t / 0.18) + 60
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(t, 0.005, 0.25)
    n = filt(rng.standard_normal(len(t)), "low", 1500) * env(t, 0.002, 0.12) * 0.3
    return x + n


if __name__ == "__main__":
    save("pop_hi", pop(1100))
    save("pop", pop(820))
    save("pop_lo", pop(560))
    save("click", click())
    for i in range(4):
        save(f"key{i + 1}", key(i), 0.7)
    save("enter", enter())
    save("swish", swish(), 0.8)
    save("error", error(), 0.8)
    save("confirm", confirm(), 0.8)
    save("sparkle", sparkle(), 0.7)
    save("tension", tension(4.0), 0.8)
    save("alarm", alarm(), 0.8)
    save("freeze", freeze(), 0.9)
    save("whoosh", whoosh(), 0.95)
    print("sfx ->", OUT)
