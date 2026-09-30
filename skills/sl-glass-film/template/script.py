"""The film's script: what is said, how the scenes are split, which spoken words fire animation cues,
and what the music does under each scene.

This file is the EXAMPLE film (SL UI Library, story "The deadline race"). Scenes are free: use any ids,
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
    ("hook", "Every interface starts somewhere."),
    ("reveal", "Meet SL UI Library."),
    ("problem", "Deadline in one hour, and you're still hand-coding a button."),
    ("freeze", "Or, you just ask your agent."),
    ("solution", "Two hundred ninety-seven components. Pricing comes together."),
    ("end", "Star it on GitHub."),
]

# Music under each scene (scripts/score.py):
#   bright   plucks + airy chords, major         (openings, reveals, calm statements)
#   tension  minor, ticking clock, 16th bass     (pressure, problems, countdowns)
#   hold     near silence + pad + riser          (the turn; after a tension scene the mix tape-stops into it)
#   drop     full groove: kick, clap, hats, bass (the payoff and the end card)
MOODS = {"hook": "bright", "reveal": "bright", "problem": "tension", "freeze": "hold", "solution": "drop", "end": "drop"}
# The cue on which the music tape-stops (the Turn block freezes the picture on the same word). None = no stop.
STOP_CUE = "f_or"

# (scene, spoken word, cue name). Words are matched in order inside their scene (case/punctuation ignored).
# Cue names are yours to choose; src/film/Film.tsx reads them with cue('name').
CUES = [
    ("hook", "every", "h_line1"),        # headline line 1 rises
    ("hook", "somewhere", "h_line2"),    # headline line 2 rises
    ("reveal", "meet", "r_name"),        # wordmark
    ("reveal", "library", "r_tag"),      # tag letter-spaces out
    ("problem", "deadline", "p_line1"),  # first problem line
    ("problem", "hour", "p_hit1"),       # error toast 1
    ("problem", "still", "p_line2"),     # second line + error toast 2
    ("problem", "button", "p_hit3"),     # error toast 3; typing ends; countdown span ends
    ("freeze", "or", "f_or"),            # TIME STOPS (+ music tape-stop)
    ("freeze", "ask", "f_ask"),          # prompt typing
    ("solution", "two", "s_stat"),       # stat chip pops
    ("solution", "components", "s_flip"),  # toggle flips, prices roll
    ("solution", "pricing", "s_line"),     # camera pulls back, verdict line
    ("solution", "together", "s_stop"),      # stopwatch stops ✓
    ("end", "star", "e_line"),           # CTA line
    ("end", "github", "e_click"),        # button pops; cursor clicks 18 frames later
]
