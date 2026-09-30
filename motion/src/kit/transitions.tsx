import React from 'react';
import {AbsoluteFill, Freeze, interpolate, useCurrentFrame} from 'remotion';
import {ease, EXPO_IN, glass, P, SNAP, SOFT} from './tokens';
import {HBlurDef, Sheen} from './stage';
import {useLayout} from './layout';

/*
 * Transitions. Each one renders both scenes (A = outgoing, B = incoming) around frame `at` (the cut).
 * Film.tsx swaps the body to a transition for a small window of frames around each cut.
 * Rule of the style: no two neighbouring cuts use the same transition, and every cut has a sound.
 *
 *   Burst      A punches in (A does its own zoom+blur), B comes up out of a white flash      ~12 f
 *   MatchCut   crossfade over identical geometry (a tile becomes a timer)                    ~8 f
 *   TimeStop   not a cut: freezes A in place, drains colour, veils it - B's UI arrives on top
 *   Shockwave  a glass ring expands from a point and reveals B inside the circle              ~16 f
 *   PushCard   A lifts away as a rounded card, B rises from below                            ~16 f
 *   Whip       fast horizontal pan with motion blur                                          ~14 f
 *   GlassWipe  a huge frosted pane slides across; the scene swaps behind it                  ~20 f
 *   Dissolve   blur crossfade (calm moments only)                                            ~20 f
 */

type AB = {at: number; A: React.FC; B: React.FC};

export const Burst: React.FC<AB> = ({at, A, B}) => {
  const frame = useCurrentFrame();
  const p = ease(frame, at - 4, at + 6, 0, 1, SOFT);
  const flash = 1 - Math.abs(ease(frame, at - 6, at + 6) * 2 - 1);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{opacity: 1 - p}}>
        <A />
      </AbsoluteFill>
      <AbsoluteFill style={{opacity: p}}>
        <B />
      </AbsoluteFill>
      <AbsoluteFill style={{background: '#fff', opacity: flash * 0.85}} />
    </AbsoluteFill>
  );
};

/** B is drawn over A with rising opacity. Works when B's first frame shares geometry with A's last. */
export const MatchCut: React.FC<AB> = ({at, A, B}) => {
  const frame = useCurrentFrame();
  const p = ease(frame, at - 6, at + 2, 0, 1, SOFT);
  return (
    <AbsoluteFill>
      <A />
      <AbsoluteFill style={{opacity: p}}>
        <B />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * The time-stop: A is frozen on frame `at`, drained to grey, blurred and veiled in white.
 * Children (the new UI) render on top, sharp and in colour.
 */
export const TimeStop: React.FC<{at: number; A: React.FC; children?: React.ReactNode}> = ({at, A, children}) => {
  const frame = useCurrentFrame();
  const f = ease(frame, at, at + 10, 0, 1, SOFT);
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <AbsoluteFill style={{filter: `grayscale(${f * 0.95}) blur(${f * 9}px)`, transform: `scale(${1 - f * 0.05})`}}>
        <Freeze frame={Math.min(frame, at)}>
          <A />
        </Freeze>
      </AbsoluteFill>
      <AbsoluteFill style={{background: '#fff', opacity: f * 0.6}} />
      {children}
    </AbsoluteFill>
  );
};

export const Shockwave: React.FC<AB & {cx?: number; cy?: number}> = ({at, A, B, cx: cx0, cy: cy0}) => {
  const frame = useCurrentFrame();
  const L = useLayout();
  const cx = cx0 ?? L.cx;
  const cy = cy0 ?? L.H * 0.555;
  const p = ease(frame, at - 4, at + 12, 0, 1, EXPO_IN);
  const R = p * Math.hypot(L.W, L.H) * 1.044;
  return (
    <AbsoluteFill>
      <A />
      <AbsoluteFill style={{clipPath: `circle(${R}px at ${cx}px ${cy}px)`}}>
        <B />
      </AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: cx - R,
          top: cy - R,
          width: R * 2,
          height: R * 2,
          borderRadius: '50%',
          border: `${10 + 30 * (1 - p)}px solid rgba(255,255,255,0.8)`,
          boxShadow: `0 0 60px ${P.electric}88, inset 0 0 60px ${P.violet}66`,
          opacity: 1 - p * 0.6,
        }}
      />
    </AbsoluteFill>
  );
};

export const PushCard: React.FC<AB> = ({at, A, B}) => {
  const frame = useCurrentFrame();
  const p = ease(frame, at - 8, at + 8, 0, 1, SNAP);
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: P.bg2}}>
      <AbsoluteFill style={{transform: `translateY(${-p * 110}%) scale(${1 - p * 0.15})`, borderRadius: 60 * p, overflow: 'hidden', boxShadow: `0 40px 80px rgba(79,91,255,${0.25 * p})`}}>
        <A />
      </AbsoluteFill>
      <AbsoluteFill style={{transform: `translateY(${(1 - p) * 110}%) scale(${0.85 + p * 0.15})`, borderRadius: 60 * (1 - p), overflow: 'hidden'}}>
        <B />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Whip: React.FC<AB> = ({at, A, B}) => {
  const frame = useCurrentFrame();
  const p = ease(frame, at - 7, at + 7, 0, 1, SNAP);
  const blur = Math.sin(p * Math.PI) * 70;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <HBlurDef id="whip" amount={blur} />
      <AbsoluteFill style={{transform: `translateX(${-p * 100}%)`, filter: blur > 0.5 ? 'url(#whip)' : undefined}}>
        <A />
      </AbsoluteFill>
      <AbsoluteFill style={{transform: `translateX(${(1 - p) * 100}%)`, filter: blur > 0.5 ? 'url(#whip)' : undefined}}>
        <B />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const GlassWipe: React.FC<AB> = ({at, A, B}) => {
  const frame = useCurrentFrame();
  const p = ease(frame, at - 10, at + 10, 0, 1, SNAP);
  const x = interpolate(p, [0, 1], [110, -130]);
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      {frame < at ? <A /> : <B />}
      <div style={{position: 'absolute', top: -40, bottom: -40, left: `${x}%`, width: '120%', ...glass(60), backdropFilter: 'blur(40px) saturate(170%)'}}>
        <Sheen at={at - 10} dur={20} width={260} />
      </div>
    </AbsoluteFill>
  );
};

export const Dissolve: React.FC<AB & {len?: number}> = ({at, A, B, len = 10}) => {
  const frame = useCurrentFrame();
  const p = ease(frame, at - len, at + len, 0, 1, SOFT);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{opacity: 1 - p, filter: `blur(${p * 14}px)`}}>
        <A />
      </AbsoluteFill>
      <AbsoluteFill style={{opacity: p, filter: `blur(${(1 - p) * 14}px)`}}>
        <B />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Window (in frames, relative to the cut) during which each transition must be mounted. */
export const WINDOW = {
  Burst: [-6, 6],
  MatchCut: [-6, 2],
  Shockwave: [-4, 12],
  PushCard: [-8, 8],
  Whip: [-7, 7],
  GlassWipe: [-10, 10],
  Dissolve: [-10, 10],
} as const;
