import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {accentFill, DISPLAY, ease, EXPO, MONO, P, pop} from '../kit/tokens';
import {KineticLine, Stage} from '../kit/stage';
import {Card, Cursor} from '../kit/ui';
import {OrbitTiles, TileFn} from '../kit/tiles';
import {POPS} from '../kit/sfx';
import {KLine} from './Headline';
import {LogoFC} from './LogoReveal';
import {pick, useLayout} from '../kit/layout';

/*
 * wide: button left of centre with the URL beside it (the reference); tall/square: everything centred, URL under the button.
 *
 * EndCard - the logo in a small glass tile with hero tiles orbiting it, the CTA line, a button that pops,
 * a cursor that flies in and clicks it EXACTLY (tip on the button centre), and a burst of dots; a mono footer.
 *
 * The button is centred on BTN; the URL sits separately to its right, so a long URL never moves the button.
 */

export type EndCardProps = {
  from: number;
  line: KLine;
  /** the button pops here; the cursor clicks 18 frames later */
  buttonAt: number;
  button: {idle: string; done: string};
  url?: string;
  footer?: string;
  tiles?: TileFn[];
  Logo: LogoFC;
};

export const EndCard: React.FC<EndCardProps> = ({from, line, buttonAt, button, url, footer, tiles, Logo}) => {
  const frame = useCurrentFrame();
  const L = useLayout();
  const wide = L.kind === 'wide';
  const BTN = pick(L, {wide: {x: 640, y: 735}, tall: {x: L.cx, y: L.H * 0.63}, square: {x: L.cx, y: 700}});
  const orbitY = pick(L, {wide: 250, tall: L.H * 0.3, square: 215});
  const lineTop = pick(L, {wide: 450, tall: L.H * 0.3 + 330, square: 420});
  const lineSize = pick(L, {wide: 110, tall: 110, square: 96});
  const click = buttonAt + 18;
  const done = frame >= click;
  const btn = pop(frame, buttonAt - 2, 12, 180);
  const tx = BTN.x - 6;
  const ty = BTN.y - 5;
  const path = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)} as const;
  const cx = interpolate(frame, [buttonAt + 2, click, click + 8, click + 22], [L.W * 0.78125, tx, tx, L.W * 0.729], path);
  const cy = interpolate(frame, [buttonAt + 2, click, click + 8, click + 22], [L.H + 70, ty, ty, L.H + 100], path);
  const press = frame >= click - 1 && frame < click + 4 ? 1 : 0;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Stage shift={5} />
      {tiles && <OrbitTiles tiles={tiles} from={from} cy={orbitY} ry={wide ? 150 : 120} />}
      <div style={{position: 'absolute', left: L.cx - 95, top: orbitY - 95, zIndex: 1, transform: `scale(${pop(frame, from + 4, 11, 170)})`}}>
        <Card w={190} h={190} sheen={from + 20} style={{borderRadius: 54}}>
          <Logo at={-100} size={130} />
        </Card>
      </div>
      <KineticLine text={line.text} accentWord={line.accent} at={line.at} size={line.size ?? lineSize} top={line.top ?? lineTop} />
      <div style={{position: 'absolute', left: BTN.x, top: BTN.y, transform: `translate(-50%, -50%) scale(${btn})`}}>
        <div style={{position: 'relative'}}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '18px 38px',
              borderRadius: 999,
              background: done ? accentFill() : '#fff',
              boxShadow: done ? `0 12px 30px ${P.electric}66` : '0 0 0 1px rgba(14,16,32,0.08), 0 12px 24px -8px rgba(79,91,255,0.3)',
              fontFamily: DISPLAY,
              fontWeight: 800,
              fontSize: 36,
              color: done ? '#fff' : P.ink,
              whiteSpace: 'nowrap',
              transform: `scale(${1 - press * 0.06})`,
            }}
          >
            {done ? button.done : button.idle}
          </div>
          {done &&
            Array.from({length: 14}).map((_, i) => {
              const a = (i / 14) * Math.PI * 2;
              const q = ease(frame, click, click + 16, 0, 1, EXPO);
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: 12,
                    height: 12,
                    marginLeft: -6,
                    marginTop: -6,
                    borderRadius: 6,
                    background: i % 2 ? P.electric : P.violet,
                    transform: `translate(${Math.cos(a) * 150 * q}px, ${Math.sin(a) * 90 * q}px) scale(${1 - q})`,
                  }}
                />
              );
            })}
        </div>
      </div>
      {url &&
        (wide ? (
          <div style={{position: 'absolute', left: BTN.x + 150, top: BTN.y, transform: `translateY(-50%) scale(${btn})`, transformOrigin: 'left center', fontFamily: MONO, fontSize: 32, color: P.ink2, whiteSpace: 'nowrap'}}>
            {url}
          </div>
        ) : (
          <div style={{position: 'absolute', left: 0, right: 0, top: BTN.y + 70, textAlign: 'center', transform: `scale(${btn})`, fontFamily: MONO, fontSize: Math.min(32, (L.W - 80) / (url.length * 0.6)), color: P.ink2, whiteSpace: 'nowrap'}}>
            {url}
          </div>
        ))}
      {frame > buttonAt + 2 && frame < click + 24 && <Cursor x={cx} y={cy} press={press} />}
      {footer && (
        <div style={{position: 'absolute', left: 0, right: 0, bottom: pick(L, {wide: 90, tall: 140, square: 60}), textAlign: 'center', fontFamily: MONO, fontSize: Math.min(22, (L.W - 60) / (footer.length * 1.02)), letterSpacing: 8, color: P.mute, opacity: ease(frame, buttonAt + 10, buttonAt + 20)}}>{footer}</div>
      )}
    </AbsoluteFill>
  );
};

export const endCardSfx = (p: EndCardProps) => [
  ...(p.tiles ? Array.from({length: 6}, (_, i) => ({at: p.from + 6 + i * 2, name: POPS[i % 3], vol: 0.2})) : []),
  {at: p.from + 4, name: 'pop_lo', vol: 0.45},
  {at: p.buttonAt - 2, name: 'pop', vol: 0.4},
  {at: p.buttonAt + 18, name: 'click', vol: 0.6},
  {at: p.buttonAt + 18, name: 'sparkle', vol: 0.45},
];
