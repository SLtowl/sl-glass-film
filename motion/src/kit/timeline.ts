import tl from '../timeline.json';
import {FPS} from './tokens';

/*
 * The voice drives the edit. scripts/timeline.py writes src/timeline.json from the voice-over's word timings:
 *   scenes - each starts just before its first spoken word (snapped to a musical grid)
 *   cues   - named frames pinned to single spoken words (see script.py → CUES)
 * Scenes ask for frames by name, so re-recording the voice re-times the whole film.
 */

type TL = {
  fps: number;
  duration: number;
  bpm: number;
  width?: number;
  height?: number;
  hasVoice: boolean;
  voiceOffset?: number;
  scenes: {id: string; start: number}[];
  cues: Record<string, number>;
  words: {w: string; s: number; e: number}[];
};

const T = tl as TL;

export const sec = (s: number) => Math.round(s * FPS);
export const TOTAL = sec(T.duration);
export const SIZE = {width: T.width ?? 1920, height: T.height ?? 1080};

export const scenes = () =>
  T.scenes.map((s, i) => ({
    id: s.id,
    from: sec(s.start),
    to: i < T.scenes.length - 1 ? sec(T.scenes[i + 1].start) : sec(T.duration),
  }));

export const scene = (id: string) => {
  const s = scenes().find((x) => x.id === id);
  if (!s) throw new Error(`no scene "${id}" in timeline.json - check script.py LINES`);
  return s;
};

export const cue = (name: string) => {
  if (!(name in T.cues)) throw new Error(`no cue "${name}" in timeline.json - check script.py CUES`);
  return sec(T.cues[name]);
};

export const voice = () => {
  const w = T.words;
  return {
    has: T.hasVoice,
    offset: sec(T.voiceOffset ?? 0.5),
    start: sec(w[0].s),
    end: sec(w[w.length - 1].e),
    total: TOTAL,
  };
};
