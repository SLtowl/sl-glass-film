import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {DISPLAY, P} from '../kit/tokens';
import {cue, scene, voice} from '../kit/timeline';
import {SfxTrack} from '../kit/sfx';
import {cutSfx, CutSpec, Edit} from '../kit/cuts';
import {LogoMark} from '../kit/Logo';
import {Headline, headlineSfx} from '../blocks/Headline';
import {LogoReveal, logoRevealSfx} from '../blocks/LogoReveal';
import {Pressure, PressureProps, pressureSfx} from '../blocks/Pressure';
import {Turn, TurnProps, turnSfx} from '../blocks/Turn';
import {Assemble, AssembleProps, assembleSfx, stopwatch} from '../blocks/Assemble';
import {EndCard, EndCardProps, endCardSfx} from '../blocks/EndCard';
import {Canvas} from '../kit/layout';
import {BrokenButton, planCard, PLANS, TILES, WORK} from './content';

/*
 * EXAMPLE FILM - "SL UI Library", the reference cut of the style (story: the deadline race).
 * It is one arrangement of the blocks, not the only one: see references/stories.md for other stories
 * and how they map onto the same blocks and cuts.
 *
 * Scene ids and cue names come from script.py; every frame here is derived from a spoken word.
 */

const hook = () => ({
  from: 0,
  to: scene('hook').to,
  tiles: TILES,
  lines: [
    {text: 'Every interface', at: cue('h_line1') - 4},
    {text: 'starts somewhere.', accent: 'somewhere', at: cue('h_line2') - 8},
  ],
});

const reveal = () => ({from: scene('reveal').from, tagAt: cue('r_tag'), name: 'SL UI', tag: 'LIBRARY', Logo: LogoMark, x: 490}); // x pinned to the reference cut

const problem = (): PressureProps => ({
  from: scene('problem').from,
  peak: cue('p_hit3') + 24,
  timer: {label: 'DEADLINE', seconds: 3599, growFrom: {logo: 'SL UI', x: 490}, Logo: LogoMark},
  work: {...WORK, until: cue('p_hit3') + 16},
  result: {title: 'preview', Broken: BrokenButton},
  errors: [
    {at: cue('p_hit1'), text: 'TypeError: cannot read "center"', x: 560, y: 470},
    {at: cue('p_line2'), text: 'why is it not centered??', x: 220, y: 700},
    {at: cue('p_hit3'), text: 'z-index: 999999 (still behind)', x: 520, y: 800},
  ],
  lines: [
    {text: 'Deadline in one hour,', accent: 'hour', at: cue('p_line1') - 4, out: cue('p_line2') - 6},
    {text: "and you're still hand-coding a button.", accent: 'button', at: cue('p_line2') - 6},
  ],
});

const Problem: React.FC = () => <Pressure {...problem()} />;

const freeze = (): TurnProps => ({
  at: cue('f_or') - 2,
  A: Problem,
  line: {text: 'Or, just ask your agent.', accent: 'agent', at: cue('f_or') - 2},
  terminal: {title: 'claude code - sl-ui-library', prompt: 'build a pricing section with a toggle', typeFrom: cue('f_ask') - 4, typeTo: cue('f_ask') + 18, enterAt: scene('freeze').to - 5},
});

const solution = (): AssembleProps => ({
  from: scene('solution').from,
  url: 'my-app.dev/pricing',
  title: {text: 'Simple', accent: 'pricing'},
  toggle: ['Monthly', 'Yearly'],
  flipAt: cue('s_flip') + 10,
  cards: PLANS,
  card: planCard,
  stat: {value: '297', label: 'components', at: cue('s_stat') - 2},
  pill: {at: cue('s_stop'), render: () => <span style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 40, color: P.electric}}>Ready ✓</span>},
  pullAt: cue('s_line') - 6,
  verdict: {text: 'Pricing assembled.', accent: 'assembled', at: cue('s_line') - 4},
});

const end = (): EndCardProps => ({
  from: scene('end').from,
  line: {text: 'Star it on GitHub.', accent: 'github', at: cue('e_line') - 6},
  buttonAt: cue('e_click'),
  button: {idle: '☆ Star', done: '★ Starred'},
  url: 'github.com/SLtowl/sl-ui-library',
  footer: '297 COMPONENTS · CLAUDE CODE · MIT',
  tiles: TILES,
  Logo: LogoMark,
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
