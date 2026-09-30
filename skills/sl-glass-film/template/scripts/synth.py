"""Synth engine for the score: a tiny stereo mixer (Track) and instruments built from numpy noise and oscillators.
No samples, no presets - every sound is generated, so each film's music is original.

Style notes: plucks, supersaw pads, a clean kick, 16th hats, sub impacts, risers. No bells, no chimes.
"""
import numpy as np
from scipy.signal import butter, sosfilt

SR = 44100



def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def filt(x, kind, f, order=2):
    f = np.clip(np.atleast_1d(f), 20, SR / 2 - 100)
    sos = butter(order, f if len(f) > 1 else f[0], btype=kind, fs=SR, output="sos")
    return sosfilt(sos, x)


def tvec(dur):
    return np.arange(int(dur * SR)) / SR


def saw(freq, dur, phase=0.0):
    """Band-limited saw (additive), freq may be scalar."""
    t = tvec(dur)
    k_max = int(min(40, (SR / 2) // max(freq, 1)))
    out = np.zeros_like(t)
    for k in range(1, k_max + 1):
        out += np.sin(2 * np.pi * k * freq * t + phase * k) / k
    return out * (2 / np.pi)


def square(freq, dur):
    t = tvec(dur)
    k_max = int(min(31, (SR / 2) // max(freq, 1)))
    out = np.zeros_like(t)
    for k in range(1, k_max + 1, 2):
        out += np.sin(2 * np.pi * k * freq * t) / k
    return out * (4 / np.pi)


class Track:
    def __init__(self, dur):
        self.n = int(dur * SR)
        self.buses = {name: np.zeros((self.n, 2)) for name in ("drums", "bass", "music", "fx")}
        self.reverb_send = np.zeros((self.n, 2))

    def add(self, bus, x, t, gain=1.0, pan=0.0, send=0.0):
        i = int(t * SR)
        if i >= self.n or i + len(x) <= 0:
            return
        if i < 0:
            x, i = x[-i:], 0
        x = x[: self.n - i]
        if x.ndim == 1:
            l, r = np.sqrt(0.5 * (1 - pan)), np.sqrt(0.5 * (1 + pan))
            x = np.stack([x * l, x * r], axis=1)
        self.buses[bus][i: i + len(x)] += x * gain
        if send:
            self.reverb_send[i: i + len(x)] += x * gain * send


# ---------- instruments ----------

def kick():
    t = tvec(0.4)
    f = 44 + 120 * np.exp(-t / 0.028)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.13)
    click = np.random.randn(len(t)) * np.exp(-t / 0.002) * 0.4
    return np.tanh(1.8 * (body + filt(click, "high", 2000)))


def clap(rng):
    t = tvec(0.35)
    noise = rng.standard_normal(len(t))
    env = np.zeros_like(t)
    for off in (0, 0.011, 0.022):
        m = t >= off
        env[m] += np.exp(-(t[m] - off) / (0.012 if off < 0.02 else 0.11))
    return filt(filt(noise * env, "high", 900), "low", 6000) * 0.8


def hat(rng, open_=False):
    t = tvec(0.25 if open_ else 0.06)
    x = filt(rng.standard_normal(len(t)), "high", 7500, 4)
    return x * np.exp(-t / (0.09 if open_ else 0.018)) * 0.5


def bass_note(m, dur):
    f = mtof(m)
    t = tvec(dur)
    x = 0.7 * saw(f, dur) + 0.5 * np.sin(2 * np.pi * f * t)
    env = np.minimum(1, t / 0.004) * np.exp(-t / 0.35)
    cut = 250 + 1400 * np.exp(-t / 0.06)
    # time-varying filter approximated in two bands
    x = 0.6 * filt(x, "low", 380) + 0.4 * filt(x, "low", float(cut.mean()))
    return np.tanh(1.4 * x * env)


def supersaw_chord(notes, dur, cutoff):
    x = 0
    for m in notes:
        f = mtof(m)
        for d in (-0.12, -0.05, 0, 0.05, 0.12):
            x = x + saw(f * 2 ** (d / 12), dur, phase=np.random.rand() * 6.28)
    x = x / (len(notes) * 5) * 2.2
    t = tvec(dur)
    env = np.minimum(1, t / 0.006) * np.exp(-t / (dur * 0.55))
    return filt(x * env, "low", cutoff, 2)


def pluck(m, dur=0.22):
    f = mtof(m)
    t = tvec(dur)
    x = 0.6 * square(f, dur) + 0.4 * saw(f * 2, dur)
    return filt(x * np.exp(-t / 0.07), "low", 3800) * 0.5


def impact(rng):
    t = tvec(1.6)
    f = 30 + 55 * np.exp(-t / 0.09)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.55)
    noise = filt(rng.standard_normal(len(t)), "low", 1800) * np.exp(-t / 0.18) * 0.5
    return np.tanh(1.5 * (sub + noise))


def riser(rng, dur):
    t = tvec(dur)
    prog = t / dur
    noise = rng.standard_normal(len(t))
    out = np.zeros_like(t)
    seg = 12  # piecewise sweep of a bandpass
    for i in range(seg):
        a, b = i * len(t) // seg, (i + 1) * len(t) // seg
        fc = 400 * 2 ** (5 * (i + 0.5) / seg)
        out[a:b] = filt(noise, "band", [fc * 0.7, fc * 1.4])[a:b]
    f = 200 * 2 ** (3 * prog)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25
    return (out * 0.6 + tone) * prog ** 2


def snare(rng):
    t = tvec(0.3)
    body = np.sin(2 * np.pi * np.cumsum(185 + 60 * np.exp(-t / 0.01)) / SR) * np.exp(-t / 0.05)
    noise = filt(rng.standard_normal(len(t)), "band", [1500, 9000]) * np.exp(-t / 0.09)
    return np.tanh(2.2 * (0.7 * body + noise))


def sub808(m, dur):
    """Distorted 808: sine with a pitch drop into the note, long tail."""
    t = tvec(dur)
    f = mtof(m) * (1 + 1.5 * np.exp(-t / 0.018))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR)
    env = np.minimum(1, t / 0.003) * np.exp(-t / (dur * 0.7))
    return np.tanh(3.0 * x) * env


def reverse_swell(rng, dur):
    t = tvec(dur)
    x = filt(rng.standard_normal(len(t)), "high", 3000) * (t / dur) ** 3
    return x * 0.35
