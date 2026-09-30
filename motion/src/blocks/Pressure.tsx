import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import {DISPLAY, ease, EXPO, glass, MONO, P, pop, SNAP} from '../kit/tokens';
import {KineticLine, Stage} from '../kit/stage';
import {Card, Toast} from '../kit/ui';
import {typing} from '../kit/sfx';
import {KLine} from './Headline';
import {LogoFC, logoTile} from './LogoReveal';
import {Layout, pick, useLayout} from '../kit/layout';

/*
 * Pressure - the style's tension block: a countdown (optionally grown out of the previous scene's logo tile),
 * the slow manual way typed line by line (left pane), its broken result twitching (right pane), error toasts popping,
 * camera shake that grows, and past CRITICAL the timer turns alert-red and the frame breathes red.
 *
 * Use it for any "the old way hurts" beat: a deadline, a launch, a demo, a client call, a queue, a budget running out.
 * It is the only place alert red is allowed.
 */
export const CRITICAL = 0.55;
type Rect = {x: number; y: number; w: number; h: number; r: number};

const fmt = (secs: number) => {
  const s = Math.max(0, Math.floor(secs));
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
};

/** Where everything sits, per arrangement. Error toast positions are given in wide (1920×1080) coordinates and mapped. */
const frameOf = (L: Layout) =>
  pick(L, {
    wide: {timer: {x: 560, y: 60, w: 800, h: 230, r: 44}, digits: 132, work: {x: 150, y: 330, w: 800, h: 540}, result: {x: 1010, y: 330, w: 760, h: 540}, lineTop: 920, lineSize: 64},
    tall: {timer: {x: 60, y: 110, w: 960, h: 230, r: 44}, digits: 132, work: {x: 60, y: 400, w: 960, h: 640}, result: {x: 60, y: 1080, w: 960, h: 520}, lineTop: L.H - 260, lineSize: 64},
    square: {timer: {x: 140, y: 40, w: 800, h: 190, r: 40}, digits: 110, work: {x: 40, y: 270, w: 490, h: 560}, result: {x: 550, y: 270, w: 490, h: 560}, lineTop: 880, lineSize: 52},
  });

const mapToast = (L: Layout, e: {x: number; y: number}, F: ReturnType<typeof frameOf>) => {
  if (L.kind === 'wide') return e;
  const top = F.work.y;
  const bottom = Math.max(F.work.y + F.work.h, F.result.y + F.result.h);
  return {x: Math.max(30, Math.min(L.W - 600, (e.x / 1920) * L.W)), y: top + ((e.y - 330) / 540) * (bottom - top)};
};

export type PressureProps = {
  from: number;
  /** frame at which the countdown has melted (and the shake is strongest) */
  peak: number;
  /** growFrom: a rectangle, or {logo: name} = the LogoReveal tile of that wordmark (MatchCut from a LogoReveal) */
  timer: {label: string; seconds: number; growFrom?: Rect | {logo: string; x?: number}; Logo?: LogoFC};
  work: {title: string; lines: string[]; bad?: RegExp; until: number};
  result: {title: string; Broken: React.FC<{local: number; w: number; h: number}>};
  errors: {at: number; text: string; x: number; y: number}[];
  lines: KLine[];
};

export const Pressure: React.FC<PressureProps> = ({from, peak, timer, work, result, errors, lines}) => {
  const frame = useCurrentFrame();
  const L = useLayout();
  const F = frameOf(L);
  const TIMER = F.timer;
  const local = frame - from;
  const g = timer.growFrom;
  const start: Rect = !g ? {...TIMER, y: TIMER.y - 40} : 'logo' in g ? logoTile(L, g.logo, g.x) : g;
  const morph = ease(frame, from - 6, from + 12, 0, 1, SNAP);
  const box = {
    x: interpolate(morph, [0, 1], [start.x, TIMER.x]),
    y: interpolate(morph, [0, 1], [start.y, TIMER.y]),
    w: interpolate(morph, [0, 1], [start.w, TIMER.w]),
    h: interpolate(morph, [0, 1], [start.h, TIMER.h]),
    r: interpolate(morph, [0, 1], [start.r, TIMER.r]),
  };
  const progress = Math.min(1, Math.max(0, local / (peak - from)));
  const remaining = timer.seconds * (1 - Math.pow(progress, 0.85) * 0.93);
  const critical = progress > CRITICAL;
  const pulse = critical ? 0.5 + 0.5 * Math.sin(frame * 0.9) : 0;
  const shakeAmp = 1 + progress * 9;
  const sx = (random(`dx${frame}`) - 0.5) * shakeAmp;
  const sy = (random(`dy${frame}`) - 0.5) * shakeAmp;
  const panes = ease(frame, from + 4, from + 18, 0, 1, EXPO);
  // the code font shrinks until the longest line fits its pane
  const longest = Math.max(...work.lines.map((l) => l.length));
  const font = Math.min(25, (F.work.w - 100) / (longest * 0.6));
  const lh = Math.round(font * 1.24);
  const rows = Math.floor((F.work.h - 120) / lh);
  const typed = Math.floor(interpolate(frame, [from + 8, work.until], [0, work.lines.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const Logo = timer.Logo;

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Stage shift={6} />
      <AbsoluteFill style={{background: P.alert, opacity: pulse * 0.07}} />
      <AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px)`}}>
        <div style={{position: 'absolute', left: box.x, top: box.y, width: box.w, height: box.h, ...glass(box.r), overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          {Logo && timer.growFrom && (
            <div style={{position: 'absolute', opacity: 1 - morph * 2}}>
              <Logo at={-100} size={180} />
            </div>
          )}
          <div style={{opacity: ease(frame, from + 4, from + 12), textAlign: 'center'}}>
            <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: 10, color: critical ? P.alert : P.mute}}>{timer.label}</div>
            <div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: F.digits, letterSpacing: '-0.03em', lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: critical ? P.alert : P.ink, transform: `scale(${1 + pulse * 0.03})`}}>
              {fmt(remaining)}
            </div>
          </div>
          <div style={{position: 'absolute', left: 0, bottom: 0, height: 6, width: `${(1 - progress) * 100}%`, background: critical ? P.alert : `linear-gradient(90deg, ${P.electric}, ${P.violet})`}} />
        </div>

        <div style={{position: 'absolute', left: F.work.x, top: F.work.y, transform: `translateX(${(1 - panes) * -(L.W * 0.46875)}px)`}}>
          <Card w={F.work.w} h={F.work.h} style={{alignItems: 'flex-start', justifyContent: 'flex-start', flexDirection: 'column'}}>
            <div style={{padding: '20px 28px', fontFamily: MONO, fontSize: 20, color: P.mute}}>{work.title}</div>
            <div style={{padding: '0 28px', fontFamily: MONO, fontSize: font, lineHeight: `${lh}px`, color: P.ink, whiteSpace: 'pre', transform: `translateY(${-Math.max(0, typed - rows) * lh}px)`}}>
              {work.lines.slice(0, typed).map((l, i) => (
                <div key={i} style={{display: 'flex'}}>
                  <span style={{width: font * 1.76, color: P.mute}}>{i + 1}</span>
                  <span style={{textDecoration: work.bad?.test(l) ? `underline wavy ${P.alert}` : undefined}}>{l}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div style={{position: 'absolute', left: F.result.x, top: F.result.y, transform: L.kind === 'tall' ? `translateX(${(1 - panes) * L.W}px)` : `translateX(${(1 - panes) * (L.W * 0.46875)}px)`}}>
          <Card w={F.result.w} h={F.result.h}>
            <div style={{position: 'absolute', left: 28, top: 20, fontFamily: MONO, fontSize: 20, color: P.mute}}>{result.title}</div>
            <result.Broken local={local} w={F.result.w} h={F.result.h} />
          </Card>
        </div>

        {errors.map((e) => {
          if (frame < e.at) return null;
          const q = mapToast(L, e, F);
          return (
            <div key={e.text} style={{position: 'absolute', left: q.x, top: q.y, transform: `scale(${pop(frame, e.at, 9, 260)}) rotate(${(random(e.text) - 0.5) * 6}deg)`}}>
              <Toast text={e.text} />
            </div>
          );
        })}

        {lines.map((l, i) => (
          <KineticLine key={i} text={l.text} accentWord={l.accent} at={l.at} out={l.out} size={l.size ?? F.lineSize} top={l.top ?? F.lineTop} stagger={i ? 2 : 3} />
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Pressure's sound: panes swish, a Shepard tension under everything until `until`, typing, error bonks, alarm once critical. */
export const pressureSfx = (p: PressureProps & {until: number}) => {
  const critical = p.from + Math.round(CRITICAL * (p.peak - p.from));
  return [
    {at: p.from + 4, name: 'swish', vol: 0.3},
    {at: p.from + 6, name: 'tension', vol: 0.32, dur: p.until - p.from - 6},
    ...typing(p.from + 8, p.work.until, 3, 0.18),
    ...p.errors.map((e) => ({at: e.at, name: 'error', vol: 0.4})),
    ...Array.from({length: Math.max(0, Math.floor((p.until - 4 - critical) / 15))}, (_, i) => ({at: critical + i * 15, name: 'alarm', vol: 0.18})),
  ];
};
