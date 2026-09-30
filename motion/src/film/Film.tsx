import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {DISPLAY, P} from '../kit/tokens';
import {cue, scene, voice} from '../kit/timeline';
import {SfxTrack} from '../kit/sfx';
import {cutSfx, CutSpec, Edit} from '../kit/cuts';
import {Headline, headlineSfx} from '../blocks/Headline';
import {LogoReveal, logoRevealSfx} from '../blocks/LogoReveal';
import {Pressure, PressureProps, pressureSfx} from '../blocks/Pressure';
import {Turn, TurnProps, turnSfx} from '../blocks/Turn';
import {Assemble, AssembleProps, assembleSfx, stopwatch} from '../blocks/Assemble';
import {EndCard, EndCardProps, endCardSfx} from '../blocks/EndCard';
import {Canvas} from '../kit/layout';
import {BrokenPlayer, FilmMark, trackCard, TRACKS, TILES, WORK} from './content';

/*
 * Promo for the sl-glass-film skill, made with the skill (story: the deadline race).
 * Scene ids and cue names come from script.py.
 */

const hook = () => ({
  from: 0,
  to: scene('hook').to,
  tiles: TILES,
  lines: [
    {text: 'Every launch', at: cue('h_line1') - 4},
    {text: 'deserves a film.', accent: 'film', at: cue('h_line2') - 8},
  ],
});

const reveal = () => ({from: scene('reveal').from, tagAt: cue('r_tag'), name: 'SL Glass', tag: 'FILM · SKILL', Logo: FilmMark});

const problem = (): PressureProps => ({
  from: scene('problem').from,
  peak: cue('p_hit3') + 24,
  timer: {label: 'LAUNCH IN', seconds: 86399, growFrom: {logo: 'SL Glass'}, Logo: FilmMark},
  work: {...WORK, until: cue('p_hit3') + 16},
  result: {title: 'preview', Broken: BrokenPlayer},
  errors: [
    {at: cue('p_hit1'), text: 'audio out of sync (+11 frames)', x: 560, y: 470},
    {at: cue('p_line2'), text: 'render failed: out of memory', x: 200, y: 700},
    {at: cue('p_hit3'), text: 'export: 4h 10m remaining', x: 560, y: 800},
  ],
  lines: [
    {text: 'Launch tomorrow,', accent: 'tomorrow', at: cue('p_line1') - 4, out: cue('p_line2') - 6},
    {text: "and you're still keyframing by hand.", accent: 'keyframing', at: cue('p_line2') - 6},
  ],
});

const Problem: React.FC = () => <Pressure {...problem()} />;

const freeze = (): TurnProps => ({
  at: cue('f_or') - 2,
  A: Problem,
  line: {text: 'Or, just ask your agent.', accent: 'agent', at: cue('f_or') - 2},
  terminal: {title: 'claude code - my-app', prompt: '/sl-glass-film make a promo for my app', typeFrom: cue('f_ask') - 4, typeTo: cue('f_ask') + 18, enterAt: scene('freeze').to - 5},
});

const solution = (): AssembleProps => {
  const flipAt = cue('s_flip') + 10;
  return {
    from: scene('solution').from,
    url: 'my-app-film - remotion studio',
    title: {text: 'Your', accent: 'film'},
    toggle: ['Draft', 'Final'],
    flipAt,
    cards: TRACKS,
    card: (i, ctx) => trackCard(i, ctx, flipAt),
    stat: {value: '6', label: 'acts', at: cue('s_stat') - 2},
    pill: {
      at: cue('s_stop'),
      render: (done) => (
        <>
          <span style={{fontSize: 26, color: done ? P.electric : P.mute}}>{done ? '✓' : '⏎'}</span>
          <span style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 44, color: P.ink}}>1 prompt</span>
        </>
      ),
    },
    pullAt: cue('s_line') - 6,
    verdict: {text: 'From one prompt.', accent: 'one', at: cue('s_line') - 4},
  };
};

const end = (): EndCardProps => ({
  from: scene('end').from,
  line: {text: 'Get it on GitHub.', accent: 'github', at: cue('e_line') - 6},
  buttonAt: cue('e_click'),
  button: {idle: '☆ Star', done: '★ Starred'},
  url: 'github.com/SLtowl/sl-glass-film',
  footer: 'REMOTION · VOICE · MUSIC · SFX · MIT',
  tiles: TILES,
  Logo: FilmMark,
});

const VIEWS: Record<string, React.FC> = {
  hook: () => <Headline {...hook()} />,
  reveal: () => <LogoReveal {...reveal()} />,
  problem: Problem,
  freeze: () => <Turn {...freeze()} />,
  solution: () => <Assemble {...solution()} />,
  end: () => <EndCard {...end()} />,
};

/** The cut INTO each scene. Never the same type twice in a row. */
const CUTS: Record<string, CutSpec> = {
  reveal: 'Burst',
  problem: 'MatchCut',
  solution: 'Shockwave',
  end: 'PushCard',
};

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const {has, offset, start, end: vEnd, total} = voice();
  const musicVolume = (f: number) =>
    has ? interpolate(f, [start - 10, start + 6, vEnd + 6, vEnd + 24], [0.7, 0.32, 0.32, 0.75], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0.75;
  const fadeOut = interpolate(frame, [total - 16, total], [1, 0], {extrapolateLeft: 'clamp'});

  const sfx = [
    ...headlineSfx({...hook(), tiles: true}),
    ...logoRevealSfx(reveal()),
    ...pressureSfx({...problem(), until: cue('f_or')}),
    ...turnSfx(freeze()),
    ...assembleSfx(solution()),
    ...endCardSfx(end()),
    ...cutSfx(CUTS),
  ];

  return (
    <AbsoluteFill style={{background: P.bg}}>
      <AbsoluteFill style={{opacity: fadeOut}}>
        <Canvas>
          <Edit views={VIEWS} cuts={CUTS} />
        </Canvas>
      </AbsoluteFill>
      <Audio src={staticFile('music.wav')} volume={musicVolume} />
      <SfxTrack events={sfx} />
      {has && (
        <Sequence from={offset}>
          <Audio src={staticFile('voice.mp3')} volume={1} />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};
