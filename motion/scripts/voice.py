"""Voice-over -> public/voice.mp3 + word timings -> src/timeline.json.

  python scripts/voice.py                                  # ElevenLabs, VOICE_ID + MODEL from script.py
  python scripts/voice.py --voice <id> --model eleven_multilingual_v2
  python scripts/voice.py --list                           # voices your key can use
  python scripts/voice.py --engine edge                    # free Microsoft neural voice (EDGE_VOICE), no key

ElevenLabs needs ELEVENLABS_API_KEY in the environment or in this project's .env file.
Never commit that file. Check your account's current voice and model access before generation.
"""
import argparse
import base64
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import timeline  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
API = "https://api.elevenlabs.io/v1"


def api_key():
    key = os.environ.get("ELEVENLABS_API_KEY")
    if key:
        return key
    for folder in [ROOT]:
        env = folder / ".env"
        if env.exists():
            for line in env.read_text(encoding="utf-8").splitlines():
                if line.strip().startswith("ELEVENLABS_API_KEY="):
                    return line.split("=", 1)[1].strip().strip('"')
    sys.exit("ELEVENLABS_API_KEY not found (environment or .env). Or use --engine edge for a free voice.")


def call(path, body=None):
    req = urllib.request.Request(
        API + path,
        data=json.dumps(body).encode() if body is not None else None,
        headers={"xi-api-key": api_key(), "Content-Type": "application/json"},
        method="POST" if body is not None else "GET",
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        sys.exit(f"ElevenLabs {e.code}: {e.read().decode(errors='replace')}")


def tts(voice_id, text, speed, model):
    if model == "eleven_v3":
        # v3 accepts stability 0.0 / 0.5 / 1.0 only and is expressive on its own
        settings = {"stability": 0.5, "similarity_boost": 0.8, "speed": speed}
    else:
        settings = {"stability": 0.55, "similarity_boost": 0.75, "style": 0.15, "use_speaker_boost": True, "speed": speed}
    return call(
        f"/text-to-speech/{voice_id}/with-timestamps?output_format=mp3_44100_128",
        {"text": text, "model_id": model, "voice_settings": settings},
    )


def words_from_alignment(al):
    chars, starts, ends = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
    words, cur = [], None
    for c, s, e in zip(chars, starts, ends):
        if c.isspace():
            if cur:
                words.append(cur)
            cur = None
        elif cur is None:
            cur = {"w": c, "s": s, "e": e}
        else:
            cur["w"] += c
            cur["e"] = e
    if cur:
        words.append(cur)
    return words


def edge_tts_words(text, voice_name, rate, out_mp3):
    """Free Microsoft neural voice via edge-tts (pip install edge-tts); timings from WordBoundary events."""
    import asyncio

    import edge_tts

    async def run():
        try:
            com = edge_tts.Communicate(text, voice_name, rate=rate, boundary="WordBoundary")
        except TypeError:  # older edge-tts: word boundaries by default
            com = edge_tts.Communicate(text, voice_name, rate=rate)
        audio, marks = bytearray(), []
        async for chunk in com.stream():
            if chunk["type"] == "audio":
                audio.extend(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                s0 = chunk["offset"] / 1e7
                marks.append({"w": chunk["text"], "s": s0, "e": s0 + chunk["duration"] / 1e7})
        return bytes(audio), marks

    for _ in range(4):
        try:
            audio, marks = asyncio.run(run())
            break
        except Exception as e:  # the service drops TLS now and then
            print("retry edge-tts:", e)
    else:
        sys.exit("edge-tts failed")
    out_mp3.write_bytes(audio)
    # map boundaries back onto the script's whitespace tokens (punctuation stays on the token)
    words, j = [], 0
    for tok in text.split():
        key = timeline.norm(tok)
        parts = []
        while j < len(marks) and len("".join(timeline.norm(m["w"]) for m in parts)) < len(key):
            parts.append(marks[j])
            j += 1
        if not parts:
            sys.exit(f"no timing for token {tok!r}")
        words.append({"w": tok, "s": parts[0]["s"], "e": parts[-1]["e"]})
    return words


def main():
    S = timeline.S
    ap = argparse.ArgumentParser()
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--voice", default=None, help="ElevenLabs voice id, or edge voice name with --engine edge")
    ap.add_argument("--model", default=getattr(S, "MODEL", "eleven_v3"))
    ap.add_argument("--speed", type=float, default=1.0)
    ap.add_argument("--engine", default="elevenlabs", choices=["elevenlabs", "edge"])
    ap.add_argument("--rate", default="-4%", help="edge-tts speaking rate, e.g. -4%% or +5%%")
    a = ap.parse_args()

    if a.list:
        for v in call("/voices")["voices"]:
            labels = ", ".join(f"{k}={val}" for k, val in (v.get("labels") or {}).items())
            print(f"{v['voice_id']}  {v['name']:24s} {v.get('category', ''):10s} {labels}")
        return

    text = timeline.full_text()
    mp3 = timeline.VOICE
    mp3.parent.mkdir(parents=True, exist_ok=True)
    if a.engine == "edge":
        words = edge_tts_words(text, a.voice or getattr(S, "EDGE_VOICE", "en-US-AndrewMultilingualNeural"), a.rate, mp3)
    else:
        vid = a.voice or S.VOICE_ID
        print(f"generating {len(text)} characters with {vid} / {a.model} ...")
        res = tts(vid, text, a.speed, a.model)
        mp3.write_bytes(base64.b64decode(res["audio_base64"]))
        words = words_from_alignment(res["alignment"])
        if len(words) != len(text.split()):
            sys.exit(f"alignment gave {len(words)} words, the script has {len(text.split())}")
    mp3.with_suffix(".words.json").write_text(json.dumps(words, indent=1), encoding="utf-8")
    print("voice ->", mp3)
    timeline.build(words, has_voice=True)


if __name__ == "__main__":
    main()
