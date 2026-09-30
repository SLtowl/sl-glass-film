import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {ease, EXPO_IN} from '../kit/tokens';
import {DotNumber, KineticLine, Stage} from '../kit/stage';
import {BurstTiles, burstTimes, TileFn} from '../kit/tiles';
import {POPS} from '../kit/sfx';
import {pick, useLayout} from '../kit/layout';

/*
 * Headline - the opening move of the style, and a good "chapter title" anywhere.
 * One or two big kinetic lines; optional hero tiles bursting in around them; optional dot-matrix number;
 * a slow camera pan; and (punch) a zoom into the lens with blur at the end - pair that with a Burst cut.
 */
export type KLine = {text: string; accent?: string; at: number; size?: number; top?: number; out?: number};

export const Headline: React.FC<{
  from: number;
  to: number;
  lines: KLine[];
  tiles?: TileFn[];
  number?: {text: string; at: number; cy?: number};
  punch?: boolean;
  shift?: number;
}> = ({from, to, lines, tiles, number, punch: doPunch = true, shift = 0}) => {
  const frame = useCurrentFrame();
  const L = useLayout();
  const punch = doPunch ? ease(frame, to - 10, to + 4, 0, 1, EXPO_IN) : 0;
  const pan = interpolate(frame, [from, to], [40, -40]);
  const size0 = pick(L, {wide: 150, tall: 132, square: 120});
  const gap = size0 * 1.13;
  const first = lines.length === 1 ? L.cy - size0 * 0.6 : L.cy - gap - size0 * 0.3 + (L.kind === 'wide' ? 0 : 20);
  // wide keeps the reference positions exactly
  const tops = L.kind === 'wide' ? (lines.length === 1 ? [420] : [330, 500, 670]) : lines.map((_, i) => first + i * gap);
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Stage shift={shift} />
      <AbsoluteFill style={{transform: `translateX(${pan}px) scale(${1 + punch * 0.9})`, filter: punch > 0.02 ? `blur(${punch * 14}px)` : undefined}}>
        {tiles && <BurstTiles tiles={tiles} from={from} punch={punch} />}
        {number && <DotNumber text={number.text} at={number.at} cx={L.cx} cy={number.cy ?? L.H * 0.28} />}
        {lines.map((l, i) => (
          <KineticLine key={i} text={l.text} accentWord={l.accent} at={l.at} out={l.out} size={l.size ?? size0} top={l.top ?? tops[i]} />
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const headlineSfx = (p: {from: number; lines: KLine[]; tiles?: boolean; number?: {at: number}}) => [
  ...(p.tiles ? burstTimes(p.from).map((at, i) => ({at, name: POPS[i % 3], vol: 0.35})) : []),
  ...(p.number ? [{at: p.number.at, name: 'sparkle', vol: 0.4}, {at: p.number.at + 14, name: 'pop_lo', vol: 0.35}] : []),
  ...p.lines.map((l) => ({at: l.at, name: 'swish', vol: 0.25})),
];
