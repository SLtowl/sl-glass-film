import React from 'react';
import {random, useCurrentFrame} from 'remotion';
import {accentFill, accentText, DISPLAY, ease, inkText, MONO, P, SNAP} from '../kit/tokens';
import {Button, Odometer} from '../kit/ui';
import {TileFn} from '../kit/tiles';
import {CardCtx} from '../blocks/Assemble';

/*
 * The product's world for the sl-glass-film promo: the product makes FILMS, so the hero tiles are film frames
 * (tiny shots in this very style, with timecodes and a playhead), the manual way is keyframing by hand,
 * the broken result is a stuttering player, and the result is the film's tracks assembling.
 */

/** SL Glass Film mark: a play triangle over a timeline bar whose played part fills with the accent. */
export const FilmMark: React.FC<{at: number; size: number}> = ({at, size}) => {
  const frame = useCurrentFrame();
  const t = ease(frame, at, at + 10, 0, 1, SNAP);
  const tri = ease(frame, at + 4, at + 14, 0, 1, SNAP);
  const bar = ease(frame, at + 8, at + 18, 0, 1, SNAP);
  const play = ease(frame, at + 14, at + 26, 0, 1, SNAP);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{overflow: 'visible'}}>
      <defs>
        <linearGradient id="fm" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={P.electric} />
          <stop offset="1" stopColor={P.violet} />
        </linearGradient>
      </defs>
      <rect x={50 - 50 * t} y={50 - 50 * t} width={100 * t} height={100 * t} rx={30 * t} fill="rgba(0,0,0,0)" />
      <path d="M38 22 L38 62 L70 42 Z" fill={P.ink} transform={`translate(${(1 - tri) * -120} 0)`} strokeLinejoin="round" stroke={P.ink} strokeWidth={4} />
      <rect x={16 + (1 - bar) * 120} y={76} width={68} height={10} rx={5} fill={P.ink} opacity={0.18} />
      <rect x={16} y={76} width={68 * play * 0.62} height={10} rx={5} fill="url(#fm)" />
      <circle cx={16 + 68 * play * 0.62} cy={81} r={9 * Math.min(1, play * 3)} fill={P.electric} />
    </svg>
  );
};

/* ---------------- hero tiles: frames of films made in this style ---------------- */

const SHOTS = [
  {word: 'Launch', accent: true, tc: '00:00:02', bx: 0.25, by: 0.4},
  {word: 'Meet Acme', accent: false, tc: '00:00:04', bx: 0.7, by: 0.6},
  {word: '297', accent: true, tc: '00:00:11', bx: 0.5, by: 0.3},
  {word: 'Or…', accent: false, tc: '00:00:08', bx: 0.3, by: 0.7},
  {word: 'Built.', accent: true, tc: '00:00:14', bx: 0.75, by: 0.35},
  {word: '00:04', accent: false, tc: '00:00:12', bx: 0.4, by: 0.5},
  {word: 'Star it', accent: true, tc: '00:00:17', bx: 0.6, by: 0.45},
];

/** One frame of a glass film: a miniature stage, one word, a timecode and a playhead running along the bottom. */
const Shot: React.FC<{t: number; i: number}> = ({t, i}) => {
  const s = SHOTS[i % SHOTS.length];
  const w = 300;
  const h = 118;
  const head = (t * 0.22 + random(`ph${i}`)) % 1;
  return (
    <div style={{position: 'relative', width: w, height: h, borderRadius: 14, overflow: 'hidden', background: P.bg, boxShadow: 'inset 0 0 0 1px rgba(40,46,110,0.10)'}}>
      <div style={{position: 'absolute', left: s.bx * w - 90 + Math.sin(t + i) * 12, top: s.by * h - 90, width: 180, height: 180, borderRadius: '50%', background: `radial-gradient(circle, ${P.electric} 0%, transparent 65%)`, opacity: 0.45}} />
      <div style={{position: 'absolute', left: (1 - s.bx) * w - 80, top: (1 - s.by) * h - 80, width: 160, height: 160, borderRadius: '50%', background: `radial-gradient(circle, ${P.violet} 0%, transparent 65%)`, opacity: 0.4}} />
      <div style={{position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(79,91,255,0.16) 1.2px, transparent 1.6px)', backgroundSize: '12px 12px'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 30, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 800, fontSize: 40, letterSpacing: '-0.045em', ...(s.accent ? accentText() : inkText())}}>{s.word}</div>
      <div style={{position: 'absolute', left: 10, bottom: 12, fontFamily: MONO, fontSize: 12, color: P.mute}}>{s.tc}</div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 4, background: 'rgba(14,16,32,0.08)'}}>
        <div style={{width: `${head * 100}%`, height: 4, background: accentFill(90)}} />
      </div>
    </div>
  );
};

export const TILES: TileFn[] = SHOTS.map(() => (t: number, i: number) => <Shot t={t} i={i} />);

/* ---------------- the manual way ---------------- */

export const WORK = {
  title: 'promo_final_v7.prproj - keyframes',
  lines: [
    '00:00:00  logo.scale     0 → 1.2',
    '00:00:12  logo.scale   1.2 → 1   // bounce??',
    '00:00:12  title.opacity  0 → 100',
    '00:00:14  title.y       80 → 0',
    '00:00:15  music.wav    out of sync',
    '00:00:20  vo_take_07.wav  (take 8?)',
    '00:01:03  whoosh.wav   +3 frames late',
    '00:01:04  button.x  612 → 611 → 612',
    '00:02:10  export…    est. 3h 40m',
    '00:02:10  render failed: out of memory',
    '00:02:11  export…    est. 4h 10m',
    '00:02:12  font missing: Inter Tight',
    '00:02:12  undo ×47',
  ],
  bad: /\?\?|late|failed|missing|out of sync/,
};

/** The hand-made promo: a player that stutters - the title jumps, the playhead skips, a spinner, dropped frames. */
export const BrokenPlayer: React.FC<{local: number; w: number; h: number}> = ({local, w}) => {
  const state = Math.floor(Math.max(0, local) / 7) % 4; // drawn a few frames early during transitions → clamp
  const b = [
    {dx: 30, dy: -18, rot: -3, size: 64, text: 'OUR  APP', head: 0.18},
    {dx: -46, dy: 14, rot: 2, size: 44, text: 'Our app!!', head: 0.12},
    {dx: 8, dy: 36, rot: -7, size: 72, text: 'OUR AP', head: 0.31},
    {dx: -18, dy: -26, rot: 5, size: 52, text: 'our App', head: 0.09},
  ][state];
  const pw = Math.min(620, w - 100);
  const k = pw / 620;
  return (
    <div style={{position: 'relative', width: pw, height: 300 * k}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 8, background: 'linear-gradient(135deg, #8a8a9a, #c9c0a8)', overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 110 * k, textAlign: 'center', fontFamily: 'Arial Black, sans-serif', fontSize: b.size * k, color: '#ff0', textShadow: '4px 4px 0 #f0f', transform: `translate(${b.dx * k}px, ${b.dy * k}px) rotate(${b.rot}deg)`}}>{b.text}</div>
        <div style={{position: 'absolute', right: 24, top: 20, width: 44, height: 44, borderRadius: 22, border: '6px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', transform: `rotate(${local * 40}deg)`}} />
        {state % 2 === 1 && <div style={{position: 'absolute', left: 0, right: 0, top: (60 + state * 40) * k, height: 26, background: 'rgba(0,255,0,0.35)'}} />}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: -30, height: 8, borderRadius: 4, background: '#DCDFEE'}}>
        <div style={{width: `${b.head * 100}%`, height: 8, borderRadius: 4, background: P.alert}} />
      </div>
      <div style={{position: 'absolute', right: 0, bottom: -68, fontFamily: MONO, fontSize: 22, color: P.alert, whiteSpace: 'nowrap'}}>{`▶ 0:0${Math.round(b.head * 20)} / 0:20 · dropped frames`}</div>
    </div>
  );
};

/* ---------------- the result: the film's tracks ---------------- */

export const TRACKS = [
  {name: 'Voice', a: '0:00', b: '0:16', unit: 'eleven_v3'},
  {name: 'Music', a: '000', b: '112', unit: 'bpm · original', badge: 'SCORE'},
  {name: 'Sound', a: '00', b: '96', unit: 'synthesized sfx'},
];

export const trackCard = (i: number, {at, flip, frame}: CardCtx, flipAt: number) => {
  const tr = TRACKS[i];
  return (
    <>
      <div style={{marginTop: 22}}>
        <Odometer from={tr.a.padEnd(tr.b.length, ' ')} to={tr.b} p={flip} size={76} />
      </div>
      <div style={{marginTop: 8, fontFamily: MONO, fontSize: 20, color: P.mute}}>{tr.unit}</div>
      {/* the track itself: bars grow in, then play once the toggle flips */}
      <div style={{display: 'flex', alignItems: 'center', gap: 5, height: 70, marginTop: 20}}>
        {Array.from({length: 22}).map((_, k) => {
          const grow = ease(frame, at + 8 + k * 0.6, at + 16 + k * 0.6);
          const hgt = 0.25 + 0.75 * random(`w${i}-${k}`);
          const live = flip * (0.6 + 0.4 * Math.sin(frame * 0.5 + k * 0.9 + i));
          const lit = flip > 0.5 && k / 22 < (frame - flipAt) / 60;
          return <div key={k} style={{width: 8, height: 70 * hgt * grow * (1 - 0.4 * flip + 0.4 * live), borderRadius: 4, background: lit ? accentFill(180) : 'rgba(14,16,32,0.12)'}} />;
        })}
      </div>
      <div style={{marginTop: 'auto', display: 'flex', justifyContent: 'center'}}>
        <Button label="Listen" />
      </div>
    </>
  );
};
