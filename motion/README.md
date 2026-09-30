# Promo film source

The promo for `sl-glass-film`, made with the skill. It uses the kit and blocks of [`skills/sl-glass-film/template`](../skills/sl-glass-film/template) with its own files:

- `script.py`: the deadline-race story, the moods and the tape-stop cue.
- `src/film/Film.tsx`: the scenes and their cuts.
- `src/film/content.tsx`: the product's world. The product makes films, so this file holds:
  - film-frame tiles,
  - the logo mark,
  - the keyframe pane,
  - a stuttering player,
  - the film's tracks.

To rebuild the film:

Install Node.js, Python and a full FFmpeg build with `ffmpeg` and `ffprobe` on `PATH`. The FFmpeg executable bundled inside Remotion is intended for its renderer and does not include all filters used by the QA scripts.

```sh
cd motion
npm install
pip install -r requirements.txt
python scripts/sfx.py
python scripts/timeline.py --reuse   # uses the committed voice (public/voice.mp3 + voice.words.json)
python scripts/score.py
npm run render
python scripts/qa.py finish out/film.mp4 ../assets/media/sl-glass-film.mp4
```

The countdown, error messages and work panes are illustrative scenes, not measured performance benchmarks.
