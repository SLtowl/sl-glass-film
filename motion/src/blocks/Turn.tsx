import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {accentFill, ease, EXPO, MONO, P, SOFT} from '../kit/tokens';
import {KineticLine} from '../kit/stage';
import {Card, WindowBar} from '../kit/ui';
import {TimeStop} from '../kit/transitions';
import {typing} from '../kit/sfx';
import {KLine} from './Headline';
import {pick, useLayout} from '../kit/layout';

/*
 * Turn - the style's signature moment: everything stops.
 * The previous scene freezes on `at`, drains to grey, blurs and is veiled in white; a mono badge appears,
 * the answer line rises, and (optionally) a glass terminal slides up with a prompt typed into it.
 * Pair it with a music tape-stop on the same word (script.py STOP_CUE) - whatever the music was doing before.
 *
 * Without a terminal it works as a pure "pause and think" beat: badge + one line over the frozen frame.
 */
export type TurnProps = {
  at: number;
  A: React.FC;
  badge?: string;
  line: KLine;
  terminal?: {title: string; prompt: string; typeFrom: number; typeTo: number; enterAt: number};
};

export const Turn: React.FC<TurnProps> = ({at, A, badge = '❚❚ TIME STOPPED', line, terminal}) => {
  const frame = useCurrentFrame();
  const L = useLayout();
  const f = ease(frame, at, at + 10, 0, 1, SOFT);
  const badgeTop = pick(L, {wide: 250, tall: L.H * 0.3, square: 230});
  const lineTop = pick(L, {wide: terminal ? 310 : 400, tall: badgeTop + 64, square: badgeTop + 60});
  return (
    <TimeStop at={at} A={A}>
      <div style={{position: 'absolute', left: 0, right: 0, top: badgeTop, textAlign: 'center', opacity: f, fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: 14, color: P.mute}}>{badge}</div>
      <KineticLine text={line.text} accentWord={line.accent} at={line.at} size={line.size ?? pick(L, {wide: 110, tall: 110, square: 96})} top={line.top ?? lineTop} />
      {terminal && <Terminal at={at} {...terminal} />}
    </TimeStop>
  );
};

const Terminal: React.FC<{at: number; title: string; prompt: string; typeFrom: number; typeTo: number; enterAt: number}> = ({at, title, prompt, typeFrom, typeTo, enterAt}) => {
  const frame = useCurrentFrame();
  const L = useLayout();
  const w = Math.min(1120, L.W - 80);
  const top = pick(L, {wide: 560, tall: L.H * 0.3 + 330, square: 560});
  // the prompt (+ caret and ⏎) stays on one line: JetBrains Mono advances exactly 0.6 em
  const font = Math.min(42, (w - 90) / ((prompt.length + 5) * 0.6));
  const term = ease(frame, at + 4, at + 18, 0, 1, EXPO);
  const typed = Math.floor(interpolate(frame, [typeFrom, typeTo], [0, prompt.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  return (
    <div style={{position: 'absolute', left: L.cx - w / 2, top, transform: `translateY(${(1 - term) * 500}px)`}}>
      <Card w={w} h={200} sheen={at + 16} style={{alignItems: 'flex-start', justifyContent: 'flex-start', flexDirection: 'column'}}>
        <WindowBar title={title} />
        <div style={{padding: '14px 40px', fontFamily: MONO, fontSize: font, color: P.ink, whiteSpace: 'pre'}}>
          <span style={{color: P.electric}}>› </span>
          {prompt.slice(0, typed)}
          <span style={{opacity: Math.floor(frame / 7) % 2 || typed < prompt.length ? 1 : 0, color: P.violet}}>▌</span>
          {frame >= enterAt && <span style={{marginLeft: 24, padding: '4px 14px', borderRadius: 10, background: accentFill(), color: '#fff', fontSize: font * 0.67}}>⏎</span>}
        </div>
      </Card>
    </div>
  );
};

export const turnSfx = (p: TurnProps) => [
  {at: p.at, name: 'freeze', vol: 0.55},
  ...(p.terminal
    ? [{at: p.at + 4, name: 'swish', vol: 0.3}, ...typing(p.terminal.typeFrom, p.terminal.typeTo, 2, 0.2), {at: p.terminal.enterAt, name: 'enter', vol: 0.55}]
    : [{at: p.line.at + 2, name: 'swish', vol: 0.25}]),
];
