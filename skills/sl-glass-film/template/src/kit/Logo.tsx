import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {ease, P, SNAP} from './tokens';

/**
 * Example brand mark (SL UI): three stacked interface bars, the middle one carrying a toggle knob.
 * It assembles itself from frame `at`. Replace with your own mark - keep it a flat SVG in P.ink + one accent,
 * drawn inside a 100×100 viewBox so it sits in the glass logo tile.
 */
export const LogoMark: React.FC<{at: number; size: number; tile?: string; ink?: string; accent?: string; knob?: boolean}> = ({
  at,
  size,
  tile = 'rgba(0,0,0,0)',
  ink = P.ink,
  accent = P.electric,
  knob: showKnob = true,
}) => {
  const frame = useCurrentFrame();
  const t = ease(frame, at, at + 10, 0, 1, SNAP);
  const b = (i: number) => ease(frame, at + 4 + i * 3, at + 14 + i * 3, 0, 1, SNAP);
  const knob = ease(frame, at + 14, at + 24, 0, 1, SNAP);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{overflow: 'visible'}}>
      <rect x={50 - 50 * t} y={50 - 50 * t} width={100 * t} height={100 * t} rx={30 * t} fill={tile} />
      <rect x={16 + (1 - b(0)) * -120} y={22} width={68} height={12} rx={6} fill={ink} />
      <rect x={16 + (1 - b(1)) * 120} y={44} width={68} height={12} rx={6} fill={ink} opacity={0.25} />
      <rect x={16 + (1 - b(2)) * -120} y={66} width={40} height={12} rx={6} fill={ink} />
      {showKnob && <circle cx={interpolate(knob, [0, 1], [22, 78])} cy={50} r={11 * Math.min(1, knob * 3)} fill={accent} />}
    </svg>
  );
};
