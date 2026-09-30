# Voice

The voice-over drives the whole edit, so generate it early, right after the script is approved.

## ElevenLabs (reference sound)

- **Key.** `ELEVENLABS_API_KEY` is read from the environment or from this project's `.env` file. Keep it out of version control and output. Ask the user to configure the key locally; do not ask them to paste it into chat.
- **Reference voice.** Brian (`nPczCjzI2devNBz1zQrb`) on **eleven_v3**: a calm, warm, confident male voice.
- **eleven_v3 settings.** It accepts `stability` 0.0, 0.5 or 1.0 only (the script uses 0.5). It is expressive on its own, so do not add style or speaker boost.
- **Account limits.** Check the provider's current plan limits and the user's available voices before generating. `python scripts/voice.py --list` shows the voices returned for the configured account. API availability and quotas depend on the plan.
- **Usage terms.** The bundled demo voice was generated on the free plan. That recording requires attribution to elevenlabs.io and has no commercial license. For new recordings, check the provider's [current publication terms](https://help.elevenlabs.io/hc/en-us/articles/13313564601361-Can-I-publish-the-content-I-generate-on-the-platform) and disclose the plan used.
- **Other premade voices that fit the style:**
  - Male: George (warm narrator), Daniel (British, crisp), Eric (smooth), Chris (casual).
  - Female: Sarah (confident), Lily (British, warm), Matilda (friendly), Alice (clear).
  - Voice ids change rarely, but check them with `--list`.
- **Timings.** Word timings come from the `/with-timestamps` character alignment. `voice.py` checks that the number of words equals the script's; a mismatch usually means a hyphen or a digit was spoken differently.

## edge-tts (free, no key)

Run `python scripts/voice.py --engine edge --voice en-US-AndrewMultilingualNeural` (after `pip install edge-tts`).

- **Voices that fit the style:**
  - `en-US-AndrewMultilingualNeural` (closest to Brian)
  - `en-US-BrianMultilingualNeural`
  - `en-US-AvaMultilingualNeural`
  - `en-GB-RyanNeural`
- **Pace.** `--rate -4%` is the default; use `+5%` if the voice runs long.
- **Timings.** Word timings come from WordBoundary events and are mapped back onto the script's tokens.
- **Reliability.** The service sometimes drops the connection. The script retries 4 times.

## Writing for text-to-speech

- **Spell numbers as words.** Write "two hundred ninety-seven", not "297". Write "four seconds", not "4s".
- **Use commas to pause.** "Or, you just ask your agent." makes a small breath after "Or", which is exactly where the freeze lands.
- **Spell names phonetically if needed**, and keep the screen spelling in the on-screen text. For example "S L U I" vs "SL UI": write it the way it should sound.
- **Avoid parentheses, slashes and abbreviations**, which the voice reads literally.

## Re-timing without paying again

`public/voice.words.json` keeps the raw word timings. After editing `CUES`, `SCENE_LEAD`, `GRID` or `VOICE_OFFSET`, run:

```bash
python scripts/timeline.py --reuse
```

Only regenerate the voice when the *words* change.

## No voice

`python scripts/timeline.py --estimate` writes estimated timings with `hasVoice: false`. The film renders without a voice track, and the music plays at 0.75 throughout. Use this to block the edit before the script is final.
