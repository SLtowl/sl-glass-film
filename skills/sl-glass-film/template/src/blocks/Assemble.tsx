import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {accentFill, accentText, DISPLAY, ease, EXPO, glass, inkText, MONO, P, pop, SNAP} from '../kit/tokens';
import {KineticLine, Stage} from '../kit/stage';
import {Card, StatChip, Toggle, WindowBar} from '../kit/ui';
import {POPS} from '../kit/sfx';
import {KLine} from './Headline';
import {pick, useLayout} from '../kit/layout';

/*
 * Assemble - the result builds itself: a glass window springs up, its title rises, a toggle appears,
 * three cards drop in with a tilt, the toggle flips on a spoken word (everything in the cards reacts),
 * a stat chip pops top-left, a status pill top-right changes state, then the camera pulls back (blur + scale)
 * and the verdict line lands.
 *
 * What is IN the window is the product: pricing cards, a dashboard, a pipeline, tracks of a film, a menu…
 * Card bodies come from `card(i, ctx)`; ctx.flip (0→1) is the toggle state - make something in every card react to it.
 */
export type CardCtx = {at: number; flip: number; frame: number};

export type AssembleProps = {
  from: number;
  url: string;
  title: {text: string; accent: string};
  toggle?: [string, string];
  flipAt: number;
  cards: {name: string; badge?: string}[];
  card: (i: number, ctx: CardCtx) => React.ReactNode;
  stat?: {value: string; label: string; at: number};
  pill?: {at: number; render: (done: boolean, frame: number) => React.ReactNode};
  pullAt: number;
  verdict: KLine;
};

export const Assemble: React.FC<AssembleProps> = ({from, url, title, toggle, flipAt, cards, card, stat, pill, pullAt, verdict}) => {
  const frame = useCurrentFrame();
  const L = useLayout();
  // the window: wide = the reference; tall/square = full-width window, cards row scaled to fit
  const WIN = pick(L, {wide: {x: 230, y: 90, w: 1460, h: 820}, tall: {x: 40, y: L.cy - 440, w: 1000, h: 760}, square: {x: 40, y: 150, w: 1000, h: 740}});
  const rowW = cards.length * 360 + (cards.length - 1) * 34;
  const k = Math.min(1, (WIN.w - 60) / rowW);
  const chipTop = pick(L, {wide: 40, tall: WIN.y - 120, square: 40});
  const pillRight = pick(L, {wide: 110, tall: 40, square: 40});
  const chipLeft = pick(L, {wide: 120, tall: 40, square: 40});
  const verdictTop = pick(L, {wide: 860, tall: WIN.y + WIN.h + 90, square: 880});
  const win = pop(frame, from - 2, 13, 170);
  const titleP = ease(frame, from + 6, from + 18, 0, 1, EXPO);
  const flip = ease(frame, flipAt, flipAt + 7, 0, 1, SNAP);
  const done = pill ? frame >= pill.at : false;
  const donePop = pill ? pop(frame, pill.at, 8, 240) : 0;
  const zoomOut = ease(frame, pullAt, pullAt + 16, 0, 1, SNAP);
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Stage shift={7} />
      <AbsoluteFill style={{transform: `scale(${1 - zoomOut * 0.14}) translateY(${-zoomOut * 40}px)`, filter: zoomOut > 0.02 ? `blur(${zoomOut * 3}px)` : undefined}}>
        <div style={{position: 'absolute', left: WIN.x, top: WIN.y, transform: `scale(${win})`, transformOrigin: '50% 60%'}}>
          <Card w={WIN.w} h={WIN.h} style={{alignItems: 'stretch', justifyContent: 'flex-start', flexDirection: 'column'}}>
            <WindowBar title={url} pill divider />
            <div style={{textAlign: 'center', marginTop: 40, overflow: 'hidden'}}>
              <div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: Math.min(76, (WIN.w - 80) / ((title.text.length + title.accent.length + 1) * 0.5)), letterSpacing: '-0.04em', ...inkText(), transform: `translateY(${(1 - titleP) * 110}%)`}}>
                {title.text} <span style={accentText()}>{title.accent}</span>
              </div>
            </div>
            {toggle && (
              <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, marginTop: 20, fontFamily: DISPLAY, fontWeight: 700, fontSize: 26, color: P.ink, transform: `scale(${pop(frame, from + 12, 11, 220)})`}}>
                <span style={{opacity: 1 - 0.6 * flip}}>{toggle[0]}</span>
                <Toggle on={flip} s={0.6} />
                <span style={{opacity: 0.4 + 0.6 * flip}}>{toggle[1]}</span>
              </div>
            )}
            <div style={{display: 'flex', justifyContent: 'center', gap: 34, marginTop: 40, ...(k < 1 ? {transform: `scale(${k})`, transformOrigin: '50% 0', marginLeft: -(rowW - WIN.w) / 2, marginRight: -(rowW - WIN.w) / 2} : {})}}>
              {cards.map((c, i) => {
                const at = from + 14 + i * 5;
                const p = pop(frame, at, 12, 170);
                return (
                  <div key={c.name} style={{transform: `translateY(${(1 - p) * -700}px) rotate(${(1 - p) * (i - 1) * 12}deg)`}}>
                    <Card
                      w={360}
                      h={420}
                      sheen={at + 14}
                      style={{
                        alignItems: 'stretch',
                        justifyContent: 'flex-start',
                        flexDirection: 'column',
                        padding: '34px 36px',
                        ...(c.badge ? {boxShadow: `0 0 0 2px ${P.electric}, 0 40px 80px -12px ${P.electric}66`} : {}),
                      }}
                    >
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 34, color: P.ink}}>{c.name}</div>
                        {c.badge && (
                          <div style={{padding: '6px 16px', borderRadius: 999, background: accentFill(), fontFamily: MONO, fontSize: 18, color: '#fff', transform: `scale(${pop(frame, at + 12, 8, 260)})`}}>{c.badge}</div>
                        )}
                      </div>
                      {card(i, {at, flip, frame})}
                    </Card>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
        {stat && (
          <div style={{position: 'absolute', left: chipLeft, top: chipTop, transform: `scale(${pop(frame, stat.at, 10, 220)})`, transformOrigin: 'left center'}}>
            <StatChip value={stat.value} label={stat.label} />
          </div>
        )}
      </AbsoluteFill>

      {pill && (
        <div style={{position: 'absolute', right: pillRight, top: chipTop, transform: `scale(${1 + (done ? donePop * 0.25 * Math.exp(-(frame - pill.at) / 6) : 0) + zoomOut * 0.9})`, transformOrigin: 'top right'}}>
          <div style={{padding: '14px 28px', ...glass(999), display: 'flex', alignItems: 'center', gap: 14, boxShadow: done ? `0 0 0 2px ${P.electric}, 0 20px 50px ${P.electric}55` : undefined}}>
            {pill.render(done, frame)}
          </div>
        </div>
      )}
      <KineticLine text={verdict.text} accentWord={verdict.accent} at={verdict.at} size={verdict.size ?? pick(L, {wide: 120, tall: 110, square: 100})} top={verdict.top ?? verdictTop} />
    </AbsoluteFill>
  );
};

/** Pill content used by the reference: a stopwatch that counts up to `seconds` and stops with a ✓. */
export const stopwatch = (from: number, at: number, seconds: number) => (done: boolean, frame: number) => {
  const clock = Math.min(seconds, Math.max(0, ((frame - from) / Math.max(1, at - from)) * seconds));
  return (
    <>
      <span style={{fontSize: 26, color: done ? P.electric : P.mute}}>{done ? '✓' : '⏱'}</span>
      <span style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 44, fontVariantNumeric: 'tabular-nums', color: P.ink}}>00:{String(Math.floor(clock)).padStart(2, '0')}</span>
    </>
  );
};

export const assembleSfx = (p: AssembleProps) => [
  ...(p.stat ? [{at: p.stat.at, name: 'pop_hi', vol: 0.35}] : []),
  ...p.cards.map((_, i) => ({at: p.from + 14 + i * 5, name: POPS[i % 3], vol: 0.4})),
  ...(p.cards.some((c) => c.badge) ? [{at: p.from + 31, name: 'pop_hi', vol: 0.3}] : []),
  {at: p.flipAt, name: 'click', vol: 0.5},
  ...(p.pill ? [{at: p.pill.at, name: 'click', vol: 0.5}, {at: p.pill.at + 1, name: 'confirm', vol: 0.45}] : []),
];
