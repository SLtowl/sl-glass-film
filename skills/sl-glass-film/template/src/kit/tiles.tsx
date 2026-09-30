import React from 'react';
import {useCurrentFrame} from 'remotion';
import {ease, EXPO, FPS, pop} from './tokens';
import {Card} from './ui';
import {pick, useLayout} from './layout';

/*
 * Hero tiles - small glass cards that burst in around a headline (BurstTiles) or orbit a logo (OrbitTiles).
 *
 * What goes ON the tiles is the most product-specific decision in the film. Tiles show the product's own world:
 *   UI library     → live toggles, sliders, tabs (the reference film)
 *   video tool     → film frames with timecodes, waveforms
 *   analytics      → sparklines, KPI numbers, tiny charts
 *   dev tool       → terminal lines, status badges, commit hashes
 *   food / retail  → product photos on glass, prices, ratings
 * Never use generic UI glyphs for a product that is not about UI.
 *
 * A tile is a function of time: (t seconds, i index) => ReactNode, drawn inside a glass Card.
 */
export type TileFn = (t: number, i: number) => React.ReactNode;

const BURST = [
  {x: 250, y: 180, r: -8},
  {x: 1660, y: 200, r: 7},
  {x: 170, y: 800, r: 6},
  {x: 1720, y: 860, r: -6},
  {x: 760, y: 120, r: 3},
  {x: 1250, y: 950, r: -4},
  {x: 1500, y: 520, r: 5},
];

/* tall (1080×1920) and square (1080×1080) spots keep the middle band free for the headline */
const BURST_TALL = [
  {x: 250, y: 280, r: -8},
  {x: 840, y: 360, r: 7},
  {x: 220, y: 1480, r: 6},
  {x: 850, y: 1600, r: -6},
  {x: 560, y: 150, r: 3},
  {x: 430, y: 1770, r: -4},
  {x: 860, y: 1250, r: 5},
];
const BURST_SQUARE = [
  {x: 190, y: 150, r: -8},
  {x: 890, y: 170, r: 7},
  {x: 180, y: 930, r: 6},
  {x: 900, y: 940, r: -6},
  {x: 540, y: 110, r: 3},
  {x: 540, y: 975, r: -4},
];

/**
 * Seven tiles spring out from behind the headline to fixed spots, float, catch a sheen,
 * and fly outward as `punch` goes 0 → 1 (the scene's punch-in).
 */
export const BurstTiles: React.FC<{tiles: TileFn[]; from: number; punch: number; w?: number; h?: number}> = ({tiles, from, punch, w: w0, h: h0}) => {
  const frame = useCurrentFrame();
  const L = useLayout();
  const t = frame / FPS;
  const w = w0 ?? pick(L, {wide: 340, tall: 300, square: 280});
  const h = h0 ?? pick(L, {wide: 150, tall: 132, square: 124});
  // spots are designed per arrangement; tall/square ones scale with the canvas height
  const spots = pick(L, {wide: BURST, tall: BURST_TALL.map((c) => ({...c, y: (c.y / 1920) * L.H})), square: BURST_SQUARE.map((c) => ({...c, y: (c.y / 1080) * L.H}))});
  return (
    <>
      {spots.map((c, i) => {
        const p = pop(frame, from + 4 + i * 3, 12, 150);
        const out = punch * 700;
        const dx = (c.x - L.cx) / L.cx;
        const dy = (c.y - L.cy) / L.cy;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: c.x - w / 2 + dx * out + (1 - p) * -dx * 300,
              top: c.y - h / 2 + dy * out + (1 - p) * -dy * 200 + Math.sin(t * 1.6 + i) * 10,
              transform: `rotate(${c.r * (0.4 + 0.6 * p) + Math.sin(t + i) * 2}deg) scale(${p})`,
              opacity: Math.min(1, p * 1.5),
            }}
          >
            <Card w={w} h={h} sheen={from + 20 + i * 6}>
              {tiles[i % tiles.length](t, i)}
            </Card>
          </div>
        );
      })}
    </>
  );
};

/** frames at which BurstTiles' tiles land - give each a pop sound */
export const burstTimes = (from: number) => BURST.map((_, i) => from + 4 + i * 3);

/**
 * Six tiles orbit a centre on a flat ellipse, depth-sorted by their angle (front tiles over the logo, back ones behind).
 * Content is drawn at `inner` scale so wide props fit the small tile without clipping.
 */
export const OrbitTiles: React.FC<{tiles: TileFn[]; from: number; cx?: number; cy?: number; rx?: number; ry?: number; w?: number; h?: number; inner?: number}> = ({
  tiles,
  from,
  cx: cx0,
  cy = 250,
  rx: rx0,
  ry = 150,
  w = 250,
  h = 110,
  inner = 0.7,
}) => {
  const frame = useCurrentFrame();
  const L = useLayout();
  const cx = cx0 ?? L.cx;
  const rx = rx0 ?? Math.min(380, L.W * 0.36);
  const t = frame / FPS;
  return (
    <>
      {Array.from({length: 6}).map((_, i) => {
        const a = (i / 6) * Math.PI * 2 + t * 0.6;
        const p = ease(frame, from + i * 2, from + 18 + i * 2, 0, 1, EXPO);
        const x = cx + Math.cos(a) * rx * p + Math.cos(a) * 900 * (1 - p);
        const y = cy + Math.sin(a) * ry * p + Math.sin(a) * 700 * (1 - p);
        return (
          <div key={i} style={{position: 'absolute', left: x - w / 2, top: y - h / 2, transform: `scale(${0.55 + 0.1 * Math.sin(a)})`, opacity: p, zIndex: Math.sin(a) > 0 ? 2 : 0}}>
            <Card w={w} h={h}>
              <div style={{transform: `scale(${inner})`}}>{tiles[i % tiles.length](t, i)}</div>
            </Card>
          </div>
        );
      })}
    </>
  );
};
