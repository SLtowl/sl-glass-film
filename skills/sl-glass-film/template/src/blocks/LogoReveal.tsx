import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {accentText, DISPLAY, ease, EXPO, inkText, MONO, P, pop} from '../kit/tokens';
import {Stage} from '../kit/stage';
import {Card} from '../kit/ui';
import {fitSize, Layout, measureText, useLayout} from '../kit/layout';

/*
 * LogoReveal - the logo tile pops (with a sheen), three dotted ripples run out, the wordmark rises letter by letter,
 * and the tag below letter-spaces out. Best entered with a Burst (white flash).
 *
 * wide: tile and wordmark side by side; tall/square: tile above, wordmark below.
 * logoTile() gives the tile's rectangle so the next scene can grow its hero object out of it (MatchCut).
 */
export type LogoFC = React.FC<{at: number; size: number}>;
type Rect = {x: number; y: number; w: number; h: number; r: number};

/** width of the wordmark at 190 px as drawn: letters with −0.04em tracking, each space a 44 px gap */
const wordmarkWidth = (name: string) =>
  name.split(' ').reduce((w, part, i) => w + (i ? 44 : 0) + measureText(part, 'Inter Tight', 190, 800, -0.04), 0);

export const logoTile = (L: Layout, name: string, x?: number): Rect => {
  if (L.kind === 'wide') {
    const gx = x ?? Math.round((L.W - (260 + 48 + wordmarkWidth(name))) / 2);
    return {x: gx, y: 410, w: 260, h: 260, r: 72};
  }
  const top = L.kind === 'tall' ? L.H * 0.5 - 300 : (L.H - 520) / 2;
  return {x: L.cx - 130, y: top, w: 260, h: 260, r: 72};
};

export const LogoReveal: React.FC<{from: number; tagAt: number; name: string; tag: string; Logo: LogoFC; x?: number; shift?: number}> = ({
  from,
  tagAt,
  name,
  tag,
  Logo,
  x,
  shift = 1,
}) => {
  const frame = useCurrentFrame();
  const L = useLayout();
  const tile = logoTile(L, name, x);
  const tileP = pop(frame, from, 11, 170);
  const spread = ease(frame, tagAt - 2, tagAt + 18, 0, 1, EXPO);
  const wide = L.kind === 'wide';
  const size = wide ? 190 : fitSize(name, 190, L.W * 0.86, -0.04);
  const R = Math.max(L.W, L.H) * 0.46875;

  const Tile = (
    <div style={{transform: `scale(${tileP}) rotate(${(1 - tileP) * -30}deg)`}}>
      <Card w={tile.w} h={tile.h} sheen={from + 14} style={{borderRadius: tile.r}}>
        <Logo at={from + 2} size={180} />
      </Card>
    </div>
  );
  const Word = (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: wide ? 'flex-start' : 'center'}}>
      <div style={{display: 'flex'}}>
        {name.split('').map((ch, i) => {
          const p = ease(frame, from + 4 + i * 2, from + 18 + i * 2, 0, 1, EXPO);
          return (
            <div key={i} style={{overflow: 'hidden', width: ch === ' ' ? (44 * size) / 190 : undefined}}>
              <div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: size, letterSpacing: '-0.04em', lineHeight: 1, ...inkText(), transform: `translateY(${(1 - p) * 110}%)`}}>{ch}</div>
            </div>
          );
        })}
      </div>
      <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 32, letterSpacing: `${0.05 + spread * 0.5}em`, ...accentText(), opacity: spread, marginTop: 6}}>{tag}</div>
    </div>
  );

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Stage shift={shift} />
      {[0, 1, 2].map((k) => {
        const r = ease(frame, from + k * 5, from + k * 5 + 30, 0, 1, EXPO);
        return (
          <div
            key={k}
            style={{position: 'absolute', left: L.cx - R * r, top: L.cy - R * r, width: 2 * R * r, height: 2 * R * r, borderRadius: '50%', border: `3px dotted ${P.electric}`, opacity: (1 - r) * 0.6}}
          />
        );
      })}
      {wide ? (
        <div style={{position: 'absolute', left: tile.x, top: tile.y, display: 'flex', alignItems: 'center', gap: 48}}>
          {Tile}
          {Word}
        </div>
      ) : (
        <div style={{position: 'absolute', left: 0, right: 0, top: tile.y, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 44}}>
          {Tile}
          {Word}
        </div>
      )}
    </AbsoluteFill>
  );
};

export const logoRevealSfx = (p: {tagAt: number}) => [{at: p.tagAt - 2, name: 'swish', vol: 0.22}];
