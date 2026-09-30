"""The film's script: what is said, how the scenes are split, which spoken words fire animation cues,
and what the music does under each scene.

Promo film for the sl-glass-film skill, made with the skill itself (story: "The deadline race"). Scenes are free: use any ids,
any number of scenes (4-8 works for 15-30 s). The story is chosen with the user - see references/stories.md.

Write numbers as words ("two hundred ninety-seven") so the voice reads them naturally; the screen shows digits.
~45 words ≈ 15 s of voice for a 20 s film.
"""

# Format and length are the user's choice: 1920×1080 (16:9), 1080×1920 (9:16), 1080×1080 (1:1), 1080×1350 (4:5)…
# The blocks rearrange themselves for wide / tall / square frames; the style stays the same.
WIDTH, HEIGHT = 1920, 1080
DURATION = 20.0      # seconds, any length; leave >= 2 s after the last word for the end card
BPM = 112            # music tempo
GRID = 0.25          # scene cuts snap to this grid (s)
VOICE_OFFSET = 0.5   # voice starts this late
SCENE_LEAD = 0.35    # a scene cuts this long before its first word

# ElevenLabs voice used in the reference cut. Check access for your account.
VOICE_ID = "nPczCjzI2devNBz1zQrb"   # Brian
MODEL = "eleven_v3"
# Free fallback: python scripts/voice.py --engine edge --voice en-US-AndrewMultilingualNeural
EDGE_VOICE = "en-US-AndrewMultilingualNeural"

LINES = [
    ("hook", "Every launch deserves a film."),
    ("reveal", "Meet SL Glass Film."),
    ("problem", "Launch tomorrow, and you're still keyframing a promo by hand."),
    ("freeze", "Or, you just ask your agent."),
    ("solution", "Six acts. Voice, music and sound, from one prompt."),
    ("end", "Get it on GitHub."),
]

MOODS = {"hook": "bright", "reveal": "bright", "problem": "tension", "freeze": "hold", "solution": "drop", "end": "drop"}
STOP_CUE = "f_or"

CUES = [
    ("hook", "every", "h_line1"),
    ("hook", "deserves", "h_line2"),
    ("reveal", "meet", "r_name"),
    ("reveal", "glass", "r_tag"),
    ("problem", "launch", "p_line1"),
    ("problem", "tomorrow", "p_hit1"),
    ("problem", "still", "p_line2"),
    ("problem", "hand", "p_hit3"),
    ("freeze", "or", "f_or"),
    ("freeze", "ask", "f_ask"),
    ("solution", "six", "s_stat"),
    ("solution", "voice", "s_flip"),
    ("solution", "from", "s_line"),
    ("solution", "one", "s_stop"),
    ("end", "get", "e_line"),
    ("end", "github", "e_click"),
]
