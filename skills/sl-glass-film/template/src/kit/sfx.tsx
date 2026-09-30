import React from 'react';
import {Audio, Sequence, staticFile} from 'remotion';

/** One sound effect placed on a frame. Files live in public/sfx (made by scripts/sfx.py). */
export type Sfx = {at: number; name: string; vol?: number; dur?: number};

/** Renders a list of sound effects, each as its own short audio sequence. */
export const SfxTrack: React.FC<{events: Sfx[]; master?: number}> = ({events, master = 1}) => (
  <>
    {events
      .filter((e) => e.at >= 0)
      .map((e, i) => (
        <Sequence key={`${e.name}-${e.at}-${i}`} from={Math.round(e.at)} durationInFrames={e.dur ?? 45}>
          <Audio src={staticFile(`sfx/${e.name}.wav`)} volume={(e.vol ?? 0.5) * master} />
        </Sequence>
      ))}
  </>
);

/** Evenly spaced key clicks while text is being typed. */
export const typing = (from: number, to: number, every = 2, vol = 0.22): Sfx[] => {
  const out: Sfx[] = [];
  for (let f = from, k = 0; f < to; f += every, k++) out.push({at: f, name: `key${(k % 4) + 1}`, vol, dur: 6});
  return out;
};

/** Three pitches of the glass pop, cycled so bursts of elements don't sound like a machine gun. */
export const POPS = ['pop_hi', 'pop', 'pop_lo'];
