import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {accentText, DISPLAY, ease, EXPO, inkText, P} from './tokens';
import {fitSize, useLayout} from './layout';

/* The world every scene lives in, plus the three signature moves: kinetic words, dot numbers, light sheens. */

const Blob: React.FC<{x: number; y: number; r: number; color: string; o: number}> = ({x, y, r, color, o}) => (
  <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', background: `radial-gradient(circle, ${color} 0%, transparent 65%)`, opacity: o}} />
);

/**
 * White stage: coloured light blobs (what the glass refracts), a fine dot grid drifting diagonally,
 * and a soft top light. `shift` moves the blobs so each scene gets its own light without a hard cut.
 */
export const Stage: React.FC<{shift?: number; dots?: number}> = ({shift = 0, dots = 1}) => {
  const frame = useCurrentFrame();
  const L = useLayout();
  const t = frame / 30;
  // blob layout is designed on 1920×1080 and stretched to the canvas; radii follow the long side
  const X = (x: number) => (x / 1920) * L.W;
  const Y = (y: number) => (y / 1080) * L.H;
  const R = (r: number) => (r * Math.max(L.W, L.H)) / 1920;
  return (
    <AbsoluteFill style={{background: P.bg, overflow: 'hidden'}}>
      <Blob x={X(560 + Math.sin(t * 0.8 + shift) * 160)} y={Y(420 + Math.cos(t * 0.6) * 90)} r={R(560)} color={P.electric} o={0.42} />
      <Blob x={X(1380 + Math.cos(t * 0.7 + shift) * 150)} y={Y(660 + Math.sin(t * 0.5) * 80)} r={R(520)} color={P.violet} o={0.4} />
      <Blob x={X(1000 + Math.sin(t * 0.5 + shift * 2) * 220)} y={Y(180)} r={R(380)} color={P.sky} o={0.45} />
      <Blob x={X(260 + Math.cos(t * 0.4 + shift) * 120)} y={Y(900)} r={R(300)} color={P.lilac} o={0.5} />
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(rgba(79,91,255,${0.16 * dots}) 2px, transparent 2.6px)`,
          backgroundSize: '32px 32px',
          transform: `translate(${(-frame * 0.8) % 32}px, ${(-frame * 0.3) % 32}px)`,
          WebkitMaskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 78%)',
        }}
      />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% -10%, rgba(255,255,255,0.9), transparent 55%)'}} />
    </AbsoluteFill>
  );
};

/** Kinetic line: words rise out of a mask one after another, with a small rotation that settles. */
export const KineticLine: React.FC<{
  text: string;
  at: number;
  size: number;
  top: number;
  stagger?: number;
  style?: React.CSSProperties;
  /** one word (case-insensitive, punctuation ignored) painted with the accent gradient */
  accentWord?: string;
  /** frame where the words leave upwards */
  out?: number;
}> = ({text, at, size, top, stagger = 3, style, accentWord, out}) => {
  const frame = useCurrentFrame();
  const L = useLayout();
  size = fitSize(text, size, L.W * 0.9); // never wider than the frame, in any format
  const words = text.split(' ');
  const gone = out !== undefined ? ease(frame, out, out + 10, 0, 1, EXPO) : 0;
  const key = (w: string) => w.replace(/[^a-z0-9]/gi, '').toLowerCase();
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', justifyContent: 'center', gap: size * 0.26, flexWrap: 'wrap'}}>
      {words.map((w, i) => {
        const p = ease(frame, at + i * stagger, at + i * stagger + 14, 0, 1, EXPO);
        const isAccent = accentWord && key(w) === key(accentWord);
        return (
          <div key={i} style={{overflow: 'hidden', paddingBottom: size * 0.12}}>
            <div
              style={{
                fontFamily: DISPLAY,
                fontWeight: 800,
                fontSize: size,
                lineHeight: 1.02,
                letterSpacing: '-0.045em',
                transform: `translateY(${(1 - p) * 110 + gone * -110}%) rotate(${(1 - p) * 6}deg)`,
                ...(isAccent ? accentText() : inkText()),
                ...style,
              }}
            >
              {w}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* 5×7 dot-matrix digits */
const GLYPHS: Record<string, string[]> = {
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  '6': ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
};

/** A number assembled from flying dots: every dot starts scattered and flies into its 5×7 cell. */
export const DotNumber: React.FC<{text: string; at: number; cx: number; cy: number; pitch?: number; dot?: number; color?: string; out?: number}> = ({
  text,
  at,
  cx,
  cy,
  pitch = 34,
  dot = 22,
  color = P.electric,
  out,
}) => {
  const frame = useCurrentFrame();
  const L = useLayout();
  const cols = text.length * 6 - 1;
  const x0 = cx - ((cols - 1) * pitch) / 2;
  const y0 = cy - 3 * pitch;
  const pts: {x: number; y: number; k: string}[] = [];
  text.split('').forEach((ch, d) => {
    (GLYPHS[ch] ?? GLYPHS['0']).forEach((row, r) =>
      row.split('').forEach((b, c) => {
        if (b === '1') pts.push({x: x0 + (d * 6 + c) * pitch, y: y0 + r * pitch, k: `${d}-${r}-${c}`});
      }),
    );
  });
  const gone = out !== undefined ? ease(frame, out, out + 12, 0, 1, EXPO) : 0;
  return (
    <>
      {pts.map((p) => {
        const delay = random(`dl${p.k}`) * 12;
        const q = ease(frame, at + delay, at + delay + 20, 0, 1, EXPO);
        const sx = random(`sx${p.k}`) * L.W;
        const sy = random(`sy${p.k}`) * L.H;
        const x = sx + (p.x - sx) * q + (random(`ox${p.k}`) - 0.5) * 900 * gone;
        const y = sy + (p.y - sy) * q + (random(`oy${p.k}`) - 0.5) * 600 * gone;
        const size = dot * (0.4 + 0.6 * q) * (1 - gone * 0.6);
        return (
          <div
            key={p.k}
            style={{
              position: 'absolute',
              left: x - size / 2,
              top: y - size / 2,
              width: size,
              height: size,
              borderRadius: '50%',
              background: `radial-gradient(circle at 35% 30%, #fff 0%, ${color} 45%, ${P.violet} 100%)`,
              boxShadow: `0 4px 12px ${color}55`,
              opacity: (frame >= at + delay ? 1 : 0) * (1 - gone),
            }}
          />
        );
      })}
    </>
  );
};

/** A sweep of light across a glass surface (place inside an overflow:hidden parent). */
export const Sheen: React.FC<{at: number; dur?: number; width?: number; opacity?: number}> = ({at, dur = 22, width = 140, opacity = 0.9}) => {
  const frame = useCurrentFrame();
  const p = ease(frame, at, at + dur);
  if (p <= 0 || p >= 1) return null;
  return (
    <div
      style={{
        position: 'absolute',
        top: '-30%',
        bottom: '-30%',
        width,
        left: `${-30 + p * 160}%`,
        background: `linear-gradient(90deg, transparent, rgba(255,255,255,${opacity}), transparent)`,
        transform: 'skewX(-22deg)',
        pointerEvents: 'none',
      }}
    />
  );
};

/** SVG filter for directional motion blur (used by Whip). Reference it as filter: url(#id). */
export const HBlurDef: React.FC<{id: string; amount: number; vertical?: boolean}> = ({id, amount, vertical}) => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation={vertical ? `0 ${amount}` : `${amount} 0`} />
    </filter>
  </svg>
);
