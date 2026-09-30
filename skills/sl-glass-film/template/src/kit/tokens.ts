import React from 'react';
import {cancelRender, continueRender, delayRender, Easing, interpolate, spring, staticFile} from 'remotion';

/* ------------------------------------------------------------------
 * SL Glass Film - design tokens.
 * Cool white stage, electric-blue → violet light, frosted white glass.
 * Change colours here only; every component reads from P.
 * ------------------------------------------------------------------ */

export const FPS = 30;

/**
 * Fonts ship with the project (public/fonts, SIL Open Font License) so renders never depend on the network.
 * Both files are variable fonts; the weight ranges below are deliberate: Inter Tight renders 800-900 only
 * (a 700 request snaps to 800, which keeps small UI labels heavy), JetBrains Mono renders 500-700.
 */
const loadLocalFont = (family: string, file: string, weight: string) => {
  if (typeof FontFace === 'undefined') return family;
  const handle = delayRender(`font ${family}`);
  const face = new FontFace(family, `url(${staticFile(`fonts/${file}`)}) format('woff2')`, {weight});
  face
    .load()
    .then(() => {
      document.fonts.add(face);
      continueRender(handle);
    })
    .catch((err) => cancelRender(err));
  return family;
};

export const DISPLAY = loadLocalFont('Inter Tight', 'InterTight.woff2', '800 900');
export const MONO = loadLocalFont('JetBrains Mono', 'JetBrainsMono.woff2', '500 700');

export const P = {
  bg: '#F5F6FB', // stage
  bg2: '#ECEEF8', // behind lifted cards
  ink: '#0E1020', // headlines
  ink2: '#3A3F5C', // secondary text, gradient foot of headlines
  mute: '#8A8FA8', // labels, mono captions
  electric: '#4F5BFF', // primary accent
  violet: '#7B5CFF', // second accent (gradients end here)
  sky: '#8FB6FF', // light blob
  lilac: '#C7B8FF', // light blob, glass tint
  white: '#FFFFFF',
  alert: '#FF4D6D', // only for the "problem" act: errors, critical timer
};

/* ---------------- motion ---------------- */

/** Fast out, long settle - the default for anything entering. */
export const EXPO = Easing.bezier(0.16, 1, 0.3, 1);
/** Slow start, violent end - punch-ins and things leaving. */
export const EXPO_IN = Easing.bezier(0.7, 0, 0.84, 0);
/** Symmetric snap - morphs, toggles, card pushes. */
export const SNAP = Easing.bezier(0.85, 0, 0.15, 1);
/** Gentle in-out - crossfades, freezes, anything that must never "jump". */
export const SOFT = Easing.inOut(Easing.cubic);

/** Clamped eased interpolation between frames a and b. */
export const ease = (frame: number, a: number, b: number, from = 0, to = 1, fn = EXPO) =>
  interpolate(frame, [a, b], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: fn});

/** Spring 0→1 starting at frame `at`. Low damping = more overshoot (pops), high = calm. */
export const pop = (frame: number, at: number, damping = 18, stiffness = 260, mass = 0.6) =>
  spring({frame: frame - at, fps: FPS, config: {damping, stiffness, mass}});

/* ---------------- surfaces & text ---------------- */

/**
 * Frosted white glass: translucent fill, strong blur of what's behind, a bright specular top edge,
 * a hairline outer border and a soft coloured shadow so it floats on a white stage.
 */
export const glass = (radius = 32, tint = 0): React.CSSProperties => ({
  borderRadius: radius,
  background: `linear-gradient(160deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.34) 50%, rgba(${tint ? '160,140,255' : '199,184,255'},0.30) 100%)`,
  backdropFilter: 'blur(26px) saturate(190%)',
  border: '1.5px solid rgba(255,255,255,0.95)',
  boxShadow: [
    '0 0 0 1px rgba(40,46,110,0.12)',
    '0 34px 70px -14px rgba(79,91,255,0.38)',
    '0 14px 28px -10px rgba(14,16,32,0.16)',
    'inset 0 2px 0 rgba(255,255,255,1)',
    'inset 0 -16px 36px -18px rgba(123,92,255,0.45)',
    'inset 0 0 0 1px rgba(255,255,255,0.35)',
  ].join(', '),
});

/** Ink text with a subtle top-to-bottom depth gradient. */
export const inkText = (): React.CSSProperties => ({
  background: `linear-gradient(180deg, ${P.ink} 40%, ${P.ink2})`,
  WebkitBackgroundClip: 'text',
  color: 'transparent',
});

/** Electric → violet gradient text for the one accent word of a line. */
export const accentText = (): React.CSSProperties => ({
  background: `linear-gradient(100deg, ${P.electric}, ${P.violet})`,
  WebkitBackgroundClip: 'text',
  color: 'transparent',
});

/** Electric → violet gradient fill (buttons, badges, progress bars). */
export const accentFill = (deg = 135) => `linear-gradient(${deg}deg, ${P.electric}, ${P.violet})`;
