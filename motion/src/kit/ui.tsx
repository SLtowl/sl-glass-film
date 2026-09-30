import React from 'react';
import {accentFill, accentText, DISPLAY, glass, inkText, MONO, P} from './tokens';
import {Sheen} from './stage';

/* Glass UI pieces. They are props, not the subject: small, alive (they toggle, slide, pulse), always on glass cards. */

export const Toggle: React.FC<{on: number; s?: number}> = ({on, s = 1}) => (
  <div
    style={{
      position: 'relative',
      width: 150 * s,
      height: 84 * s,
      borderRadius: 42 * s,
      background: on > 0.5 ? accentFill() : '#DCDFEE',
      boxShadow: on > 0.5 ? `0 8px 24px ${P.electric}66` : 'inset 0 2px 4px rgba(14,16,32,0.08)',
    }}
  >
    <div
      style={{
        position: 'absolute',
        top: 8 * s,
        left: (8 + on * 66) * s,
        width: 68 * s,
        height: 68 * s,
        borderRadius: 34 * s,
        background: '#fff',
        boxShadow: '0 4px 12px rgba(14,16,32,0.2)',
        transform: `scaleX(${1 + Math.sin(on * Math.PI) * 0.25})`,
      }}
    />
  </div>
);

export const Slider: React.FC<{v: number}> = ({v}) => (
  <div style={{position: 'relative', width: 240, height: 40}}>
    <div style={{position: 'absolute', top: 16, width: 240, height: 8, borderRadius: 4, background: '#DCDFEE'}} />
    <div style={{position: 'absolute', top: 16, width: 240 * v, height: 8, borderRadius: 4, background: accentFill(90)}} />
    <div style={{position: 'absolute', left: 240 * v - 20, top: 0, width: 40, height: 40, borderRadius: 20, background: '#fff', boxShadow: `0 4px 14px ${P.electric}66`}} />
  </div>
);

export const Button: React.FC<{label?: string}> = ({label = 'Get started'}) => (
  <div
    style={{
      padding: '18px 36px',
      borderRadius: 999,
      background: accentFill(),
      boxShadow: `0 10px 26px ${P.electric}55, inset 0 1px 0 rgba(255,255,255,0.5)`,
      fontFamily: DISPLAY,
      fontWeight: 800,
      fontSize: 28,
      color: '#fff',
      whiteSpace: 'nowrap',
    }}
  >
    {label}
  </div>
);

export const Check: React.FC<{on: boolean; label?: string}> = ({on, label = 'Remember me'}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 16, fontFamily: DISPLAY, fontWeight: 700, fontSize: 28, color: P.ink}}>
    <div
      style={{
        width: 42,
        height: 42,
        borderRadius: 12,
        background: on ? accentFill() : '#DCDFEE',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: 26,
        fontWeight: 900,
      }}
    >
      {on ? '✓' : ''}
    </div>
    {label}
  </div>
);

export const Tabs: React.FC<{i: number; items?: string[]}> = ({i, items = ['Code', 'Preview', 'Docs']}) => (
  <div style={{display: 'flex', gap: 4, padding: 6, borderRadius: 16, background: 'rgba(14,16,32,0.05)', fontFamily: DISPLAY, fontWeight: 700, fontSize: 24}}>
    {items.map((t, k) => (
      <div key={t} style={{padding: '10px 18px', borderRadius: 11, background: k === i ? '#fff' : 'transparent', boxShadow: k === i ? '0 2px 8px rgba(14,16,32,0.12)' : 'none', color: k === i ? P.ink : P.mute}}>
        {t}
      </div>
    ))}
  </div>
);

export const Badge: React.FC<{label?: string}> = ({label = 'online'}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '10px 22px', borderRadius: 999, background: `${P.electric}14`, fontFamily: MONO, fontSize: 22, color: P.electric}}>
    <span style={{width: 10, height: 10, borderRadius: 5, background: P.electric}} /> {label}
  </div>
);

export const Bars: React.FC<{t: number}> = ({t}) => (
  <div style={{display: 'flex', alignItems: 'flex-end', gap: 10, height: 86}}>
    {[0.5, 0.8, 0.35, 0.95, 0.6].map((h, k) => (
      <div
        key={k}
        style={{
          width: 24,
          height: 86 * (0.3 + 0.7 * h * (0.75 + 0.25 * Math.sin(t * 3 + k))),
          borderRadius: 7,
          background: k === 3 ? `linear-gradient(180deg, ${P.violet}, ${P.electric})` : '#DCDFEE',
        }}
      />
    ))}
  </div>
);

/** The glass card every piece of UI sits on. `sheen` = frame when a light sweep crosses it. */
export const Card: React.FC<{w: number; h: number; children?: React.ReactNode; sheen?: number; style?: React.CSSProperties}> = ({w, h, children, sheen, style}) => (
  <div style={{position: 'relative', width: w, height: h, ...glass(30), display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', ...style}}>
    {children}
    {sheen !== undefined && <Sheen at={sheen} />}
  </div>
);

/** Rotating set of live glass glyphs (t = seconds). Swap the list for glyphs of your own product. */
export const glyph = (k: number, t: number) =>
  [
    <Toggle key={0} on={Math.floor(t * 1.4 + k) % 2} s={0.8} />,
    <Slider key={1} v={0.5 + 0.38 * Math.sin(t * 2.4 + k)} />,
    <Button key={2} />,
    <Check key={3} on={Math.floor(t * 1.2 + k) % 2 === 0} />,
    <Tabs key={4} i={Math.floor(t * 1.8 + k) % 3} />,
    <Badge key={5} />,
    <Bars key={6} t={t} />,
  ][k % 7];

/**
 * Characters that roll from one string to another, left to right (prices, counters).
 * Digits are tabular (all the same width), so "0:00" → "0:16" never shifts or overlaps while it rolls.
 */
export const Odometer: React.FC<{from: string; to: string; p: number; size: number}> = ({from, to, p, size}) => (
  <div style={{display: 'flex', fontFamily: DISPLAY, fontWeight: 800, fontSize: size, letterSpacing: '-0.04em', lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>
    {to.split('').map((ch, i) => {
      const q = Math.min(1, Math.max(0, p * 1.4 - i * 0.12));
      return (
        <div key={i} style={{height: size, overflow: 'hidden'}}>
          <div style={{transform: `translateY(${-q * size}px)`, ...inkText()}}>
            <div style={{height: size}}>{from[i] ?? ''}</div>
            <div style={{height: size}}>{ch}</div>
          </div>
        </div>
      );
    })}
  </div>
);

/** macOS-style window dots + a mono title (terminals, browsers, editors). */
export const WindowBar: React.FC<{title: string; pill?: boolean; divider?: boolean}> = ({title, pill, divider}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '20px 28px', borderBottom: divider ? '1px solid rgba(14,16,32,0.06)' : undefined}}>
    {['#FF6B6B', '#FFC857', '#4ADE80'].map((c) => (
      <div key={c} style={{width: 14, height: 14, borderRadius: 7, background: c, opacity: 0.8}} />
    ))}
    <div
      style={{
        marginLeft: 16,
        fontFamily: MONO,
        fontSize: 20,
        color: P.mute,
        ...(pill ? {padding: '6px 18px', borderRadius: 10, background: 'rgba(14,16,32,0.05)'} : {}),
      }}
    >
      {title}
    </div>
  </div>
);

/** A glass pill with a big gradient number and a mono label ("297 components"). */
export const StatChip: React.FC<{value: string; label: string}> = ({value, label}) => (
  <div style={{padding: '12px 26px', ...glass(999), display: 'flex', alignItems: 'baseline', gap: 10}}>
    <span style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 40, ...accentText()}}>{value}</span>
    <span style={{fontFamily: MONO, fontSize: 22, color: P.ink2}}>{label}</span>
  </div>
);

/** Error toast for the problem act. */
export const Toast: React.FC<{text: string; style?: React.CSSProperties}> = ({text, style}) => (
  <div
    style={{
      padding: '14px 24px',
      ...glass(18),
      border: `1.5px solid ${P.alert}`,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      fontFamily: MONO,
      fontWeight: 700,
      fontSize: 24,
      color: P.alert,
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    <span style={{width: 26, height: 26, borderRadius: 13, background: P.alert, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18}}>!</span>
    {text}
  </div>
);

/** Arrow cursor. Its tip sits 6px right / 5px down of (x, y)'s top-left, so aim with (target.x - 6, target.y - 5). */
export const Cursor: React.FC<{x: number; y: number; press?: number}> = ({x, y, press = 0}) => (
  <svg width={56} height={66} viewBox="0 0 70 80" style={{position: 'absolute', left: x, top: y, transform: `scale(${1 - press * 0.15})`, transformOrigin: '8px 6px'}}>
    <path d="M8 6 L8 62 L22 49 L32 72 L44 67 L34 45 L54 45 Z" fill={P.ink} stroke="#fff" strokeWidth={4} strokeLinejoin="round" />
  </svg>
);
