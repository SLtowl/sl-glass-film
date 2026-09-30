# Media provenance

| File | What it is | How it was made |
| --- | --- | --- |
| `sl-glass-film.mp4` | 20-second promo for `sl-glass-film` | Built with the skill's kit and blocks; editable source in [`motion/`](../../motion). Rendered with Remotion and loudness-normalized for the preview. |
| `sl-glass-film-preview.gif` | Short excerpt of the promo | Exported from the film at 12 fps and 560 px. |
| `sl-glass-film-poster.png` | Poster frame | Extracted from the film. |
| `social-preview-glass.png` | Repository social-preview candidate | Generated with ImageGen by editing the prior repository cover to identify the single Claude Code skill. |
| `social-preview-glass.jpg` | GitHub Social preview upload, 1280 × 640 px, under 1 MB | Resized from `social-preview-glass.png` without changing the composition. |
| `../../cover.png` | Film frame | Extracted from the promo. |

- **Voice:** elevenlabs.io / ElevenLabs, premade voice Brian, model eleven_v3, generated on a free-tier account. Free-tier audio requires attribution and is not licensed for commercial use. See the provider's [publication terms](https://help.elevenlabs.io/hc/en-us/articles/13313564601361-Can-I-publish-the-content-I-generate-on-the-platform). The MIT license for this repository's code does not grant commercial rights to this recording.
- **Music and effects:** synthesized by `motion/scripts/score.py` and `motion/scripts/sfx.py` using NumPy/SciPy. No stock samples are used in the preview.
- **Fonts:** Inter Tight and JetBrains Mono, SIL Open Font License. License texts are in `skills/sl-glass-film/template/public/fonts/`.
