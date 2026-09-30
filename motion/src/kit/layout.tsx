import React, {createContext, useContext} from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';

/*
 * Any format, one style.
 *
 * Blocks are laid out on a VIRTUAL canvas whose short side is always 1080 units, then scaled to the real frame:
 *   16:9   1920×1080 → virtual 1920×1080  (kind 'wide')    - the reference layout, 1:1
 *   9:16   1080×1920 → virtual 1080×1920  (kind 'tall')
 *   1:1    1080×1080 → virtual 1080×1080  (kind 'square')  - also 4:5 and anything close to square
 *   720×1280, 3840×2160 … → the same virtual canvas, just scaled
 * So type sizes, glass radii and shadows keep their proportions in every format, and a block only needs to know
 * which of the three arrangements to use (`kind`) and the virtual width/height.
 */
export type Kind = 'wide' | 'tall' | 'square';
export type Layout = {W: number; H: number; kind: Kind; cx: number; cy: number};

const Ctx = createContext<Layout>({W: 1920, H: 1080, kind: 'wide', cx: 960, cy: 540});

export const layoutFor = (width: number, height: number): Layout => {
  const aspect = width / height;
  const kind: Kind = aspect >= 1.3 ? 'wide' : aspect <= 0.7 ? 'tall' : 'square';
  const W = kind === 'wide' ? Math.round(1080 * aspect) : 1080;
  const H = kind === 'wide' ? 1080 : Math.round(1080 / aspect);
  return {W, H, kind, cx: W / 2, cy: H / 2};
};

/** Wrap the whole film in this once (Film.tsx). */
export const Canvas: React.FC<{children: React.ReactNode}> = ({children}) => {
  const {width, height} = useVideoConfig();
  const L = layoutFor(width, height);
  const s = width / L.W;
  return (
    <Ctx.Provider value={L}>
      <AbsoluteFill style={{overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: L.W, height: L.H, transform: `scale(${s})`, transformOrigin: '0 0', overflow: 'hidden'}}>{children}</div>
      </AbsoluteFill>
    </Ctx.Provider>
  );
};

export const useLayout = () => useContext(Ctx);

/** Pick a value per arrangement: pick(L, {wide: 150, tall: 118, square: 112}). `square` falls back to `tall`. */
export const pick = <T,>(L: Layout, v: {wide: T; tall: T; square?: T}): T => (L.kind === 'wide' ? v.wide : L.kind === 'tall' ? v.tall : v.square ?? v.tall);

/** Largest font size ≤ `size` at which `text` fits `maxWidth` on one line (Inter Tight 800, −0.045em tracking). */
export const fitSize = (text: string, size: number, maxWidth: number, tracking = -0.045) => {
  const w = measureText(text, 'Inter Tight', size, 800, tracking) + (text.split(' ').length - 1) * size * 0.26;
  return w > maxWidth ? (size * maxWidth) / w : size;
};

/**
 * Real width of a line of text in a loaded font (canvas measureText), with CSS letter-spacing in em applied.
 * Fonts are loaded before any frame renders (kit/tokens.ts), so this is exact at render time.
 */
let ctx2d: CanvasRenderingContext2D | null = null;
export const measureText = (text: string, font: string, size: number, weight = 800, letterSpacingEm = 0) => {
  if (typeof document === 'undefined') return text.length * size * 0.55;
  ctx2d = ctx2d ?? document.createElement('canvas').getContext('2d');
  if (!ctx2d) return text.length * size * 0.55;
  ctx2d.font = `${weight} ${size}px "${font}"`;
  return ctx2d.measureText(text).width + text.length * letterSpacingEm * size;
};
