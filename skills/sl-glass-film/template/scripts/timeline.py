"""Voice-driven timeline: script.py + word timings -> src/timeline.json.

Every scene starts SCENE_LEAD before its first spoken word (snapped to GRID), and every cue
is pinned to a single spoken word. Scenes read frames by cue name, so a new voice re-times the film.

  python scripts/timeline.py --estimate     # no voice yet: estimated timings (for blocking the edit)
  python scripts/voice.py                   # real voice (calls build() itself)
  python scripts/timeline.py --reuse        # re-time from the existing voice (after editing CUES / SCENE_LEAD)
"""
import argparse
import importlib.util
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TIMELINE = ROOT / "src" / "timeline.json"
VOICE = ROOT / "public" / "voice.mp3"
FPS = 30
MOODS_OK = {"bright", "tension", "hold", "drop"}


def load_script(path=ROOT / "script.py"):
    spec = importlib.util.spec_from_file_location("script", path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


S = load_script()


def full_text():
    return " ".join(text for _, text in S.LINES)


def norm(w):
    return re.sub(r"[^a-z0-9а-яё]", "", w.lower())


def estimate_words():
    """Rough calm-narrator timing: ~2.5 words/s plus punctuation pauses."""
    words, t = [], 0.0
    for w in full_text().split():
        d = 0.1 + 0.045 * len(norm(w))
        words.append({"w": w, "s": round(t, 3), "e": round(t + d, 3)})
        t += d + 0.04
        if w[-1] in ".?!":
            t += 0.32
        elif w[-1] == ",":
            t += 0.14
    return words


def snap(t):
    return round(t / S.GRID) * S.GRID


def check_script():
    ids = [s for s, _ in S.LINES]
    if len(set(ids)) != len(ids):
        raise SystemExit(f"scene ids in LINES must be unique, got {ids}")
    moods = getattr(S, "MOODS", {})
    for sid in ids:
        if moods.get(sid, "bright") not in MOODS_OK:
            raise SystemExit(f"MOODS['{sid}'] must be one of {sorted(MOODS_OK)}")


def build(words, has_voice):
    check_script()
    words = [{**w, "s": w["s"] + S.VOICE_OFFSET, "e": w["e"] + S.VOICE_OFFSET} for w in words]
    idx, per_scene = 0, {}
    for scene, text in S.LINES:
        n = len(text.split())
        per_scene[scene] = words[idx: idx + n]
        idx += n
    scenes = []
    for i, (scene, _) in enumerate(S.LINES):
        start = 0.0 if i == 0 else snap(per_scene[scene][0]["s"] - S.SCENE_LEAD)
        scenes.append({"id": scene, "start": round(start, 3)})
    cues, cursor = {}, {s: 0 for s, _ in S.LINES}
    for scene, word, name in S.CUES:
        ws = per_scene[scene]
        for j in range(cursor[scene], len(ws)):
            if norm(ws[j]["w"]) == norm(word):
                cues[name] = round(ws[j]["s"], 3)
                cursor[scene] = j + 1
                break
        else:
            raise SystemExit(f"cue word '{word}' not found in scene '{scene}' (after the previous cue of that scene)")
    end = words[-1]["e"]
    if end > S.DURATION - 2.0:
        print(f"WARNING: voice ends at {end:.2f}s - less than 2 s left for the end card; raise DURATION or cut words")
    for a, b in zip(scenes, scenes[1:]):
        if b["start"] - a["start"] < 1.2:
            print(f"WARNING: scene '{a['id']}' lasts only {b['start'] - a['start']:.2f}s")
    moods = getattr(S, "MOODS", {})
    for sc in scenes:
        sc["mood"] = moods.get(sc["id"], "bright")
    stop = getattr(S, "STOP_CUE", None)
    data = {"fps": FPS, "width": getattr(S, "WIDTH", 1920), "height": getattr(S, "HEIGHT", 1080), "duration": S.DURATION, "bpm": S.BPM, "hasVoice": has_voice, "voiceOffset": S.VOICE_OFFSET,
            "scenes": scenes, "cues": cues, "stop": cues[stop] if stop else None, "words": words}
    TIMELINE.parent.mkdir(parents=True, exist_ok=True)
    TIMELINE.write_text(json.dumps(data, indent=1), encoding="utf-8")
    print(f"timeline -> {TIMELINE} (voice ends {end:.2f}s of {S.DURATION}s)")
    for s in scenes:
        print(f"  {s['id']:12s} {s['start']:6.2f}s  {s['mood']}")
    return data


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--estimate", action="store_true", help="write a timeline from estimated word timings")
    ap.add_argument("--reuse", action="store_true", help="rebuild from public/voice.words.json (no API call)")
    a = ap.parse_args()
    if a.estimate:
        build(estimate_words(), has_voice=False)
    elif a.reuse:
        build(json.loads(VOICE.with_suffix(".words.json").read_text(encoding="utf-8")), has_voice=True)
    else:
        ap.print_help()
