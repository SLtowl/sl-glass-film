"""Quality control for a rendered film. Needs ffmpeg on PATH (+ Pillow, numpy for `jumps`).

  python scripts/qa.py strip  out/film.mp4                  # contact sheet: a frame every 0.5 s -> out/qa/strip.jpg
  python scripts/qa.py strip  out/film.mp4 --from 6 --to 9 --every 0.1   # zoom into a moment
  python scripts/qa.py frame  out/film.mp4 17.4             # one full-size frame -> out/qa/frame_17.40.png
  python scripts/qa.py jumps  out/film.mp4                  # frame-to-frame jumps that are not planned cuts
  python scripts/qa.py finish out/film.mp4 out/film_final.mp4   # loudness -14 LUFS / -1.5 dBTP, video copied
  python scripts/qa.py gif    out/film_final.mp4 media/preview.gif --from 0 --to 8
"""
import argparse
import json
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
QA = ROOT / "out" / "qa"


def ff(*args):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *map(str, args)])
    if r.returncode:
        sys.exit("ffmpeg failed")


def duration(video):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(video)], capture_output=True, text=True).stdout
    return float(out.strip())


def strip(a):
    """Contact sheet: frames every `every` seconds, labelled with their time (PIL, so it works without fontconfig)."""
    from PIL import Image, ImageDraw

    QA.mkdir(parents=True, exist_ok=True)
    end = a.to if a.to is not None else duration(a.video)
    out = Path(a.out) if a.out else QA / "strip.jpg"
    with tempfile.TemporaryDirectory() as tmp:
        ff("-ss", a.frm, "-t", end - a.frm, "-i", a.video, "-vf", f"fps={1.0 / a.every}:round=down,scale=480:-1", Path(tmp) / "%04d.png")
        files = sorted(Path(tmp).glob("*.png"))
        if not files:
            sys.exit("no frames extracted")
        w, h = Image.open(files[0]).size
        rows = (len(files) + a.cols - 1) // a.cols
        sheet = Image.new("RGB", (a.cols * w, rows * h), "black")
        for i, f in enumerate(files):
            img = Image.open(f).convert("RGB")
            d = ImageDraw.Draw(img)
            label = f"{a.frm + i * a.every:.2f}s"
            d.rectangle([4, 4, 12 + 9 * len(label), 26], fill=(0, 0, 0))
            d.text((8, 8), label, fill=(255, 255, 255))
            sheet.paste(img, ((i % a.cols) * w, (i // a.cols) * h))
        sheet.save(out, quality=88)
    print("strip ->", out, f"({len(files)} frames from {a.frm:.2f}s, every {a.every}s)")


def frame(a):
    QA.mkdir(parents=True, exist_ok=True)
    out = QA / f"frame_{a.t:.2f}.png"
    ff("-ss", a.t, "-i", a.video, "-frames:v", 1, out)
    print("frame ->", out)


def jumps(a):
    import numpy as np
    from PIL import Image

    tl = json.loads((ROOT / "src" / "timeline.json").read_text(encoding="utf-8"))
    fps = tl["fps"]
    cuts = [round(s["start"] * fps) for s in tl["scenes"][1:]]
    with tempfile.TemporaryDirectory() as tmp:
        ff("-i", a.video, "-vf", "scale=192:108", Path(tmp) / "%05d.png")
        files = sorted(Path(tmp).glob("*.png"))
        prev, diffs = None, []
        for f in files:
            img = np.asarray(Image.open(f).convert("L"), dtype=np.float32)
            if prev is not None:
                diffs.append(float(np.abs(img - prev).mean()))
            prev = img
    d = np.array(diffs)
    med = float(np.median(d)) + 1e-6
    print(f"{len(files)} frames, median change {med:.2f}")
    bad = 0
    for i, v in enumerate(d):
        f = i + 1
        if v > max(a.abs, med * a.rel):
            near = min(cuts, key=lambda c: abs(c - f))
            planned = abs(near - f) <= 12
            bad += not planned
            print(f"  frame {f:4d} ({f / fps:6.2f}s) change {v:5.1f}  {'planned cut' if planned else '<-- CHECK: jump outside a cut'}")
    print("no unplanned jumps" if not bad else f"{bad} unplanned jump(s) - look at them with: qa.py strip --from T-0.3 --to T+0.3 --every 0.033")


def finish(a):
    ff("-i", a.video, "-c:v", "copy", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", 48000, "-c:a", "aac", "-b:a", "192k", a.out)
    print("final ->", a.out)


def gif(a):
    Path(a.out).parent.mkdir(parents=True, exist_ok=True)
    end = a.to if a.to is not None else duration(a.video)
    vf = f"fps={a.fps},scale={a.width}:-1:flags=lanczos"
    with tempfile.TemporaryDirectory() as tmp:
        pal = Path(tmp) / "pal.png"
        ff("-ss", a.frm, "-t", end - a.frm, "-i", a.video, "-vf", f"{vf},palettegen=max_colors=192:stats_mode=diff", pal)
        ff("-ss", a.frm, "-t", end - a.frm, "-i", a.video, "-i", pal, "-lavfi", f"{vf}[x];[x][1:v]paletteuse=dither=sierra2_4a", a.out)
    print("gif ->", a.out, f"({Path(a.out).stat().st_size / 1e6:.1f} MB)")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("strip")
    p.add_argument("video")
    p.add_argument("--from", dest="frm", type=float, default=0.0)
    p.add_argument("--to", type=float, default=None)
    p.add_argument("--every", type=float, default=0.5)
    p.add_argument("--cols", type=int, default=8)
    p.add_argument("--out", default=None)
    p.set_defaults(fn=strip)
    p = sub.add_parser("frame")
    p.add_argument("video")
    p.add_argument("t", type=float)
    p.set_defaults(fn=frame)
    p = sub.add_parser("jumps")
    p.add_argument("video")
    p.add_argument("--rel", type=float, default=6.0, help="flag changes this many times above the median")
    p.add_argument("--abs", type=float, default=18.0, help="and above this absolute mean change (0-255)")
    p.set_defaults(fn=jumps)
    p = sub.add_parser("finish")
    p.add_argument("video")
    p.add_argument("out")
    p.set_defaults(fn=finish)
    p = sub.add_parser("gif")
    p.add_argument("video")
    p.add_argument("out")
    p.add_argument("--from", dest="frm", type=float, default=0.0)
    p.add_argument("--to", type=float, default=None)
    p.add_argument("--fps", type=int, default=15)
    p.add_argument("--width", type=int, default=720)
    p.set_defaults(fn=gif)
    a = ap.parse_args()
    a.fn(a)
